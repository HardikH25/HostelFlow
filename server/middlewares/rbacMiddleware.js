import Ticket from '../models/Ticket.js';

/**
 * verifyRole(...allowedRoles)
 * Ensures req.user has one of the required roles.
 */
export const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: No active session found.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]. Your role is '${req.user.role}'.`
            });
        }

        next();
    };
};

/**
 * verifyTicketAccess
 * A student can only view/interact with /api/tickets/:id if req.user._id matches the ticket's studentId.
 * Wardens and Technicians bypass this restriction.
 */
export const verifyTicketAccess = async (req, res, next) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket.findById(id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found.'
            });
        }

        // Wardens and Technicians bypass student ownership restriction
        if (req.user.role === 'Warden' || req.user.role === 'Technician') {
            req.targetTicket = ticket;
            return next();
        }

        // For Students: verify ownership
        if (ticket.studentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: You are only permitted to view tickets you submitted.'
            });
        }

        req.targetTicket = ticket;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error verifying ticket authorization.',
            error: error.message
        });
    }
};
