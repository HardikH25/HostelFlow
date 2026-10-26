import 'dotenv/config';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import ticketRouter from './routes/ticket.routes.js';
import slaRouter from './routes/sla.routes.js';
import uploadRouter from './routes/upload.routes.js';
import { initSocket } from './utils/socket.js';
import { initSLACron } from './utils/slaCron.js';

const app = express();
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : null;
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    clientUrl
].filter(Boolean);

const corsOriginCheck = (origin, callback) => {
    if (
        !origin ||
        allowedOrigins.includes(origin) ||
        (typeof origin === 'string' && origin.endsWith('.vercel.app')) ||
        process.env.NODE_ENV !== 'production'
    ) {
        return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy'));
};

// CORS configuration
app.use(cors({
    origin: corsOriginCheck,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Setup Socket.io with production CORS
const io = new Server(server, {
    cors: {
        origin: corsOriginCheck,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Socket.io Authentication Middleware
io.use(async (socket, next) => {
    try {
        const rawCookies = socket.handshake.headers.cookie;
        let token = null;

        if (rawCookies) {
            const parsed = rawCookies.split(';').reduce((acc, pair) => {
                const [k, v] = pair.trim().split('=');
                if (k && v) acc[k] = decodeURIComponent(v);
                return acc;
            }, {});
            token = parsed.token;
        }

        if (!token && socket.handshake.auth?.token) {
            token = socket.handshake.auth.token;
        }

        if (token && process.env.JWT_SECRET) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-password');
            socket.user = user || null;
        } else {
            socket.user = null;
        }
        next();
    } catch {
        socket.user = null;
        next();
    }
});

initSocket(io);

io.on('connection', (socket) => {
    // Join a ticket-specific chat & update room
    socket.on('join:ticket', (ticketId) => {
        if (ticketId) {
            socket.join(`ticket:${ticketId}`);
        }
    });

    socket.on('leave:ticket', (ticketId) => {
        if (ticketId) {
            socket.leave(`ticket:${ticketId}`);
        }
    });

    // Authenticated role channel for targeted broadcasts (e.g. Wardens, Technicians)
    socket.on('join:role', (role) => {
        if (role && socket.user && socket.user.role === role) {
            socket.join(`role:${role}`);
        }
    });

    socket.on('disconnect', () => {
        // clean up socket
    });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/tickets', ticketRouter);
app.use('/api/sla', slaRouter);
app.use('/api/upload', uploadRouter);

// Health & Info endpoints
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'Hostel SLA Issue Tracker API',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Hostel SLA Issue Resolution Engine Running'
    });
});

// Global 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Resource not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// Fail-fast environment variable validation
if (!process.env.dbURL) {
    throw new Error("dbURL is not configured in server environment.");
}
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured in server environment.");
}

const PORT = process.env.PORT || 8080;

mongoose.connect(process.env.dbURL)
    .then(() => {
        console.log('MongoDB Atlas connected successfully to hostel_sla_db');

        // Start SLA automated cron monitor
        initSLACron();

        server.listen(PORT, () => {
            console.log(`Hostel SLA Server listening on port ${PORT}`);
            console.log(`WebSocket Server active on ws://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Database connection error:', error);
    });
