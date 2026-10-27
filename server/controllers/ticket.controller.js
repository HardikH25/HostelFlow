import mongoose from 'mongoose';
import Ticket from '../models/Ticket.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import { emitToRoom } from '../utils/socket.js';
import { deleteFromCloudinary } from '../utils/cloudinary.js';

/**
 * Standard SLA duration mapping based on priority
 */
const SLA_HOURS_BY_PRIORITY = {
    Critical: 4,
    High: 12,
    Medium: 24,
    Low: 48
};

/**
 * POST /api/tickets
 * Create a new ticket & calculate initial slaDeadline
 */
export const createTicket = async (req, res) => {
    try {
        const { title, description, category, priority, customDeadlineHours, attachments, locationSnapshot, hostel } = req.body;

        if (!title || !description || !category) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, and category are required.'
            });
        }

        const validPriority = ['Low', 'Medium', 'High', 'Critical'].includes(priority) ? priority : 'Medium';

        // Compute SLA Deadline: Students cannot manipulate deadline.
        // Only staff can optionally override customDeadlineHours.
        let deadlineHours = SLA_HOURS_BY_PRIORITY[validPriority] || 24;
        if (req.user.role !== 'Student' && Number(customDeadlineHours) > 0) {
            deadlineHours = Number(customDeadlineHours);
        }

        const slaDeadline = new Date(Date.now() + deadlineHours * 60 * 60 * 1000);

        // Determine ticket hostel from explicit body, user's hostel, or location string
        const resolvedHostel = hostel || req.user.hostel || 'Neeladri Hostel';
        const finalLocation = locationSnapshot || req.user.location || `${resolvedHostel}`;

        const newTicket = await Ticket.create({
            studentId: req.user._id,
            title,
            description,
            category,
            priority: validPriority,
            status: 'Open',
            slaDeadline,
            hostel: resolvedHostel,
            locationSnapshot: finalLocation,
            attachments: Array.isArray(attachments) ? attachments : []
        });

        await newTicket.populate([
            { path: 'studentId', select: 'fullname email location phone role' },
            { path: 'assignedTo', select: 'fullname email phone role' }
        ]);

        // Emit real-time notification to staff role channels (protect student privacy)
        emitToRoom('role:Warden', 'ticket:created', newTicket);
        emitToRoom('role:Technician', 'ticket:created', newTicket);

        return res.status(201).json({
            success: true,
            message: 'Hostel ticket submitted successfully. SLA countdown started.',
            ticket: newTicket
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to create ticket.',
            error: error.message
        });
    }
};

/**
 * GET /api/tickets
 * Fetch tickets: filtered by studentId for Students, or all active tickets for Wardens/Technicians
 */
export const getTickets = async (req, res) => {
    try {
        const query = {};

        // Student Role Restriction: only their own tickets
        if (req.user.role === 'Student') {
            query.studentId = req.user._id;
        }

        // Technician Role Restriction: only tickets assigned to this technician
        if (req.user.role === 'Technician') {
            query.assignedTo = req.user._id;
        }

        // Optional query filters
        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.category) {
            query.category = req.query.category;
        }
        if (req.query.priority) {
            query.priority = req.query.priority;
        }
        if (req.query.assignedTo) {
            query.assignedTo = req.query.assignedTo;
        }
        if (req.query.slaBreached) {
            query.slaBreached = req.query.slaBreached === 'true';
        }

        const tickets = await Ticket.find(query)
            .populate('studentId', 'fullname email location phone role')
            .populate('assignedTo', 'fullname email phone role')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: tickets.length,
            tickets
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch tickets.',
            error: error.message
        });
    }
};

/**
 * GET /api/tickets/:id
 * Fetch single ticket details (access verified by verifyTicketAccess middleware)
 */
export const getTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ticket ID.'
            });
        }

        const ticket = req.targetTicket || await Ticket.findById(id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found.'
            });
        }

        await ticket.populate([
            { path: 'studentId', select: 'fullname email location phone role' },
            { path: 'assignedTo', select: 'fullname email phone role' }
        ]);

        return res.status(200).json({
            success: true,
            ticket
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch ticket.',
            error: error.message
        });
    }
};

/**
 * PUT /api/tickets/:id/status
 * Admin / Staff endpoint to update status.
 * Triggers logic to pause/resume the SLA deadline if moving to/from Awaiting-Student-Reply.
 */
export const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ticket ID.'
            });
        }
        const { status } = req.body;

        const validStatuses = ['Open', 'Assigned', 'Awaiting-Student-Reply', 'Resolved'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found.'
            });
        }

        const previousStatus = ticket.status;

        // SLA PAUSE LOGIC: Moving TO 'Awaiting-Student-Reply'
        if (status === 'Awaiting-Student-Reply' && previousStatus !== 'Awaiting-Student-Reply') {
            const now = Date.now();
            const currentDeadline = new Date(ticket.slaDeadline).getTime();
            const remaining = Math.max(0, currentDeadline - now);

            ticket.slaPausedAt = new Date(now);
            ticket.slaRemainingMs = remaining;
        }

        // SLA RESUME LOGIC: Moving FROM 'Awaiting-Student-Reply' to another active status
        if (previousStatus === 'Awaiting-Student-Reply' && status !== 'Awaiting-Student-Reply' && status !== 'Resolved') {
            const remaining = ticket.slaRemainingMs ?? (24 * 60 * 60 * 1000);
            ticket.slaDeadline = new Date(Date.now() + remaining);
            ticket.slaPausedAt = null;
            ticket.slaRemainingMs = null;
        }

        // RESOLVED LOGIC: If moving to Resolved
        if (status === 'Resolved') {
            ticket.resolvedAt = new Date();
            ticket.slaPausedAt = null;
        } else if (previousStatus === 'Resolved') {
            ticket.resolvedAt = null;
        }

        ticket.status = status;
        await ticket.save();

        await ticket.populate([
            { path: 'studentId', select: 'fullname email location phone role' },
            { path: 'assignedTo', select: 'fullname email phone role' }
        ]);

        // Emit real-time WebSocket events to relevant rooms
        emitToRoom(`ticket:${id}`, 'ticket:updated', ticket);
        emitToRoom('role:Warden', 'ticket:updated', ticket);
        emitToRoom('role:Technician', 'ticket:updated', ticket);

        return res.status(200).json({
            success: true,
            message: `Ticket status updated from '${previousStatus}' to '${status}'.`,
            ticket
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update ticket status.',
            error: error.message
        });
    }
};

/**
 * PUT /api/tickets/:id/assign
 * Staff endpoint to assign ticket to a Technician or Warden
 */
export const assignTicket = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ticket ID.'
            });
        }
        const { assignedTo } = req.body;
        if (assignedTo && !mongoose.Types.ObjectId.isValid(assignedTo)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid technician ID.'
            });
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found.'
            });
        }

        if (assignedTo) {
            const validStaff = await User.findOne({
                _id: assignedTo,
                role: { $in: ['Technician', 'Warden'] }
            });

            if (!validStaff) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid assignee. Must be a registered Technician or Warden.'
                });
            }

            // Enforce hostel scoping: tickets can only be assigned to staff within the same hostel
            const ticketHostel = ticket.hostel || 'Neeladri Hostel';
            const staffHostel = validStaff.hostel || 'Neeladri Hostel';

            if (staffHostel !== ticketHostel) {
                return res.status(400).json({
                    success: false,
                    message: `Hostel Mismatch: This ticket is for ${ticketHostel}, but ${validStaff.fullname} is assigned to ${staffHostel}. Staff can only be assigned to tickets within their designated hostel.`
                });
            }
        }

        ticket.assignedTo = assignedTo || null;
        if (assignedTo && ticket.status === 'Open') {
            ticket.status = 'Assigned';
        } else if (!assignedTo && ticket.status === 'Assigned') {
            ticket.status = 'Open';
        }

        await ticket.save();

        await ticket.populate([
            { path: 'studentId', select: 'fullname email location phone role' },
            { path: 'assignedTo', select: 'fullname email phone role' }
        ]);

        emitToRoom(`ticket:${id}`, 'ticket:updated', ticket);
        emitToRoom('role:Warden', 'ticket:updated', ticket);
        emitToRoom('role:Technician', 'ticket:updated', ticket);

        return res.status(200).json({
            success: true,
            message: 'Ticket assigned successfully.',
            ticket
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to assign ticket.',
            error: error.message
        });
    }
};

/**
 * PUT /api/tickets/:id/priority
 * Update ticket priority manually
 */
export const updateTicketPriority = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ticket ID.'
            });
        }
        const { priority } = req.body;

        const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
        if (!validPriorities.includes(priority)) {
            return res.status(400).json({
                success: false,
                message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`
            });
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found.'
            });
        }

        ticket.escalationHistory.push({
            escalatedAt: new Date(),
            oldPriority: ticket.priority,
            newPriority: priority,
            reason: `Manual update by ${req.user.fullname} (${req.user.role})`
        });

        ticket.priority = priority;
        await ticket.save();

        await ticket.populate([
            { path: 'studentId', select: 'fullname email location phone role' },
            { path: 'assignedTo', select: 'fullname email phone role' }
        ]);

        emitToRoom(`ticket:${id}`, 'ticket:updated', ticket);
        emitToRoom('role:Warden', 'ticket:updated', ticket);
        emitToRoom('role:Technician', 'ticket:updated', ticket);

        return res.status(200).json({
            success: true,
            message: `Priority set to ${priority}.`,
            ticket
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update priority.',
            error: error.message
        });
    }
};

/**
 * DELETE /api/tickets/:id
 * Delete a ticket and its associated comments (Warden only)
 */
export const deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ticket ID.'
            });
        }
        const ticket = await Ticket.findById(id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found.'
            });
        }

        // Delete all Cloudinary attachments first (prevent storage orphans)
        if (ticket.attachments && ticket.attachments.length > 0) {
            await Promise.allSettled(
                ticket.attachments
                    .filter(a => a.publicId)
                    .map(a => deleteFromCloudinary(a.publicId, a.fileType?.includes('pdf') ? 'raw' : 'image'))
            );
        }

        await Ticket.findByIdAndDelete(id);

        // Delete all associated comments to prevent orphaned documents
        await Comment.deleteMany({ ticketId: id });

        emitToRoom(`ticket:${id}`, 'ticket:deleted', { ticketId: id });
        emitToRoom('role:Warden', 'ticket:deleted', { ticketId: id });
        emitToRoom('role:Technician', 'ticket:deleted', { ticketId: id });

        return res.status(200).json({
            success: true,
            message: 'Ticket and associated comments deleted successfully.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to delete ticket.',
            error: error.message
        });
    }
};

/**
 * PUT /api/tickets/:id/deadline
 * Warden-only endpoint to customize or extend the SLA resolution deadline
 */
export const updateTicketDeadline = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ticket ID.'
            });
        }
        const { deadlineHours, customDeadline } = req.body;

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found.'
            });
        }

        let newDeadline;
        if (customDeadline) {
            newDeadline = new Date(customDeadline);
            if (isNaN(newDeadline.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid deadline date format.'
                });
            }
        } else if (deadlineHours !== undefined && !isNaN(Number(deadlineHours))) {
            newDeadline = new Date(Date.now() + Number(deadlineHours) * 60 * 60 * 1000);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Please provide either deadlineHours or customDeadline.'
            });
        }

        ticket.slaDeadline = newDeadline;

        // If new deadline is in future, clear breach; if in past, mark breached
        if (newDeadline > new Date()) {
            ticket.slaBreached = false;
            ticket.breachedAt = null;
        } else {
            ticket.slaBreached = true;
            ticket.breachedAt = new Date();
        }

        // If ticket was paused, recalculate remaining
        if (ticket.status === 'Awaiting-Student-Reply' && ticket.slaPausedAt) {
            ticket.slaRemainingMs = Math.max(0, newDeadline.getTime() - ticket.slaPausedAt.getTime());
        }

        ticket.escalationHistory.push({
            escalatedAt: new Date(),
            oldPriority: ticket.priority,
            newPriority: ticket.priority,
            reason: `Resolution window adjusted to ${newDeadline.toISOString()} by ${req.user.fullname} (${req.user.role})`
        });

        await ticket.save();

        await ticket.populate([
            { path: 'studentId', select: 'fullname email location phone role' },
            { path: 'assignedTo', select: 'fullname email phone role' }
        ]);

        emitToRoom(`ticket:${id}`, 'ticket:updated', ticket);
        emitToRoom('role:Warden', 'ticket:updated', ticket);
        emitToRoom('role:Technician', 'ticket:updated', ticket);

        return res.status(200).json({
            success: true,
            message: `Resolution target updated to ${newDeadline.toLocaleString()}.`,
            ticket
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update resolution deadline.',
            error: error.message
        });
    }
};
