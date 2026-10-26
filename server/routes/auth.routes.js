import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout, getMe, changePassword, updateProfile } from '../controllers/auth.controller.js';
import isAuthenticated from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rate limiting to mitigate brute-force and credential stuffing attacks.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again after 15 minutes.'
    }
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', isAuthenticated, getMe);
router.put('/change-password', isAuthenticated, changePassword);
router.put('/profile', isAuthenticated, updateProfile);

export default router;
