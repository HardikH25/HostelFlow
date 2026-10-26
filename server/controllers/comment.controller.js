import Comment from '../models/Comment.js';
import Ticket from '../models/Ticket.js';
import { emitToRoom } from '../utils/socket.js';

/**
 * POST /api/tickets/:id/comments
 * Append a new comment, resume SLA timer if student replies, and emit Socket.io event safely
 */
export const addComment = async (req, res) => {
    try {
        const { id: ticketId } = req.params;
        const { message, isInternal, attachments } = req.body;

        const hasText = message && message.trim() !== '';
        const hasAttachments = Array.isArray(attachments) && attachments.length > 0;

        if (!hasText && !hasAttachments) {
            return res.status(400).json({
                success: false,
                message: 'Comment must contain text or an attached document/image.'
            });
        }

        const ticket = req.targetTicket || await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found.'
            });
        }

        const canPostInternal = req.user.role === 'Warden' || req.user.role === 'Technician';
        const finalIsInternal = Boolean(isInternal && canPostInternal);

        const newComment = await Comment.create({
            ticketId,
            senderId: req.user._id,
            message: hasText ? message.trim() : (hasAttachments ? '📎 Attached file' : ''),
            isInternal: finalIsInternal,
            attachments: hasAttachments ? attachments : []
        });

        await newComment.populate('senderId', 'fullname email role location');

        // Resume SLA timer if student replies while ticket was awaiting student reply
        if (req.user.role === 'Student' && ticket.status === 'Awaiting-Student-Reply') {
            ticket.status = ticket.assignedTo ? 'Assigned' : 'Open';
            const remaining = ticket.slaRemainingMs ?? (24 * 60 * 60 * 1000);
            ticket.slaDeadline = new Date(Date.now() + remaining);
            ticket.slaPausedAt = null;
            ticket.slaRemainingMs = null;
            await ticket.save();

            await ticket.populate([
                { path: 'studentId', select: 'fullname email location phone role' },
                { path: 'assignedTo', select: 'fullname email phone role' }
            ]);

            emitToRoom(`ticket:${ticketId}`, 'ticket:updated', ticket);
            emitToRoom('role:Warden', 'ticket:updated', ticket);
            emitToRoom('role:Technician', 'ticket:updated', ticket);
        }

        // Emit comment event without leaking internal notes to students
        if (finalIsInternal) {
            emitToRoom('role:Warden', 'comment:new', newComment);
            emitToRoom('role:Technician', 'comment:new', newComment);
        } else {
            emitToRoom(`ticket:${ticketId}`, 'comment:new', newComment);
        }

        return res.status(201).json({
            success: true,
            message: finalIsInternal ? 'Internal staff note added.' : 'Comment posted successfully.',
            comment: newComment
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to post comment.',
            error: error.message
        });
    }
};

/**
 * GET /api/tickets/:id/comments
 * Fetch comments for a ticket.
 * If user is Student, hide internal staff notes.
 */
export const getComments = async (req, res) => {
    try {
        const { id: ticketId } = req.params;

        const filter = { ticketId };

        if (req.user.role === 'Student') {
            filter.isInternal = { $ne: true };
        }

        const comments = await Comment.find(filter)
            .populate('senderId', 'fullname email role location')
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            count: comments.length,
            comments
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve comments.',
            error: error.message
        });
    }
};
