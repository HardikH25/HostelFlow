import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const rawSocketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5005';
const SOCKET_URL = rawSocketUrl.replace(/\/api\/?$/, '');

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [slaAlerts, setSlaAlerts] = useState([]);

    useEffect(() => {
        if (!user) {
            setConnected(false);
            setSocket(null);
            return;
        }

        // Connect to Socket server with polling-first handshake to prevent closed-before-established warnings
        const socketInstance = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['polling', 'websocket'],
            reconnectionAttempts: 5
        });

        socketInstance.on('connect', () => {
            setConnected(true);
            if (user?.role) {
                socketInstance.emit('join:role', user.role);
            }
        });

        socketInstance.on('disconnect', () => {
            setConnected(false);
        });

        socketInstance.on('connect_error', () => {
            // Handled gracefully during page transitions
        });

        // SLA Breach Alert broadcast
        socketInstance.on('sla:breach_alert', (alertData) => {
            setSlaAlerts((prev) => [
                {
                    id: `${alertData.ticketId}-${Date.now()}`,
                    ...alertData,
                    dismissed: false
                },
                ...prev.slice(0, 4)
            ]);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.removeAllListeners();
            socketInstance.disconnect();
        };
    }, [user?._id, user?.role]);

    const dismissAlert = useCallback((id) => {
        setSlaAlerts((prev) => prev.filter((a) => a.id !== id));
    }, []);

    const joinTicketRoom = useCallback((ticketId) => {
        if (socket && ticketId) {
            socket.emit('join:ticket', ticketId);
        }
    }, [socket]);

    const leaveTicketRoom = useCallback((ticketId) => {
        if (socket && ticketId) {
            socket.emit('leave:ticket', ticketId);
        }
    }, [socket]);

    return (
        <SocketContext.Provider
            value={{
                socket,
                connected,
                slaAlerts,
                dismissAlert,
                joinTicketRoom,
                leaveTicketRoom
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
export default SocketContext;
