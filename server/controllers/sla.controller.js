import Ticket from '../models/Ticket.js';
import { runSLACheck } from '../utils/slaCron.js';

export const triggerSLACheckManual = async (req, res) => {
    try {
        const result = await runSLACheck();
        return res.status(200).json({
            success: true,
            message: `Manual SLA check completed. Evaluated and processed ${result.breachedCount} breached ticket(s).`,
            ...result
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to run manual SLA evaluation.',
            error: error.message
        });
    }
};



export const getSLAMetrics = async (req, res) => {
    try {
        const now = new Date();

        const [
            total,
            resolved,
            open,
            assigned,
            awaitingReply,
            currentlyBreached,
            criticalCount
        ] = await Promise.all([
            Ticket.countDocuments(),
            Ticket.countDocuments({ status: 'Resolved' }),
            Ticket.countDocuments({ status: 'Open' }),
            Ticket.countDocuments({ status: 'Assigned' }),
            Ticket.countDocuments({ status: 'Awaiting-Student-Reply' }),
            Ticket.countDocuments({
                status: { $nin: ['Resolved', 'Awaiting-Student-Reply'] },
                slaDeadline: { $lt: now }
            }),
            Ticket.countDocuments({
                status: { $ne: 'Resolved' },
                priority: 'Critical'
            })
        ]);

        return res.status(200).json({
            success: true,
            metrics: {
                total,
                resolved,
                open,
                assigned,
                awaitingReply,
                currentlyBreached,
                criticalCount
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to calculate SLA metrics.',
            error: error.message
        });
    }
};
