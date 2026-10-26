import express from 'express';
import {
    createTicket,
    getTickets,
    getTicketById,
    updateTicketStatus,
    assignTicket,
    updateTicketPriority,
    updateTicketDeadline,
    deleteTicket
} from '../controllers/ticket.controller.js';
import { addComment, getComments } from '../controllers/comment.controller.js';
import isAuthenticated from '../middlewares/authMiddleware.js';
import { verifyRole, verifyTicketAccess } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// Base Ticket CRUD
router.post('/', isAuthenticated, createTicket);
router.get('/', isAuthenticated, getTickets);
router.get('/:id', isAuthenticated, verifyTicketAccess, getTicketById);

// Staff-only Status & Assignment Actions
router.put('/:id/status', isAuthenticated, verifyRole('Warden'), updateTicketStatus);
router.put('/:id/assign', isAuthenticated, verifyRole('Warden'), assignTicket);
router.put('/:id/priority', isAuthenticated, verifyRole('Warden'), updateTicketPriority);
router.put('/:id/deadline', isAuthenticated, verifyRole('Warden'), updateTicketDeadline);
router.delete('/:id', isAuthenticated, verifyRole('Warden'), deleteTicket);

// Nested Comment routes for specific ticket
router.get('/:id/comments', isAuthenticated, verifyTicketAccess, getComments);
router.post('/:id/comments', isAuthenticated, verifyTicketAccess, addComment);

export default router;
