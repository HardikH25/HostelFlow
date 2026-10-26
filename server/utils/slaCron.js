import cron from 'node-cron';
import Ticket from '../models/Ticket.js';
import { emitToRoom } from './socket.js';

/**
 * Priority Escalation Ladder
 */
const getEscalatedPriority = (currentPriority) => {
    switch (currentPriority) {
        case 'Low':
            return 'Medium';
        case 'Medium':
            return 'High';
        case 'High':
        case 'Critical':
            return 'Critical';
        default:
            return 'High';
    }
};

/**
 * Core SLA Check & Escalation Engine
 */
export const runSLACheck = async () => {
    try {
        const now = new Date();

        // Find active tickets past deadline
        const breachedTickets = await Ticket.find({
            status: { $nin: ['Resolved', 'Awaiting-Student-Reply'] },
            slaDeadline: { $lt: now }
        }).populate('studentId', 'fullname email location phone role')
          .populate('assignedTo', 'fullname email phone role');

        if (breachedTickets.length === 0) {
            return { breachedCount: 0, escalatedTickets: [] };
        }

        const escalatedTickets = [];

        for (const ticket of breachedTickets) {
            const oldPriority = ticket.priority;
            const wasAlreadyBreached = ticket.slaBreached;

            // Stop alert spam if ticket is already marked breached and at maximum Critical priority
            if (wasAlreadyBreached && oldPriority === 'Critical') {
                continue;
            }

            const newPriority = getEscalatedPriority(oldPriority);

            ticket.slaBreached = true;
            if (!ticket.breachedAt) {
                ticket.breachedAt = now;
            }

            if (oldPriority !== newPriority) {
                ticket.priority = newPriority;
                ticket.escalationHistory.push({
                    escalatedAt: now,
                    oldPriority,
                    newPriority,
                    reason: `Automated SLA Breach: Escalated to ${newPriority}`
                });
                // Give a 4-hour window before the next escalation step
                ticket.slaDeadline = new Date(now.getTime() + 4 * 60 * 60 * 1000);
            }

            await ticket.save();
            escalatedTickets.push(ticket);

            const alertPayload = {
                ticketId: ticket._id,
                title: ticket.title,
                studentName: ticket.studentId?.fullname,
                studentLocation: ticket.studentId?.location || ticket.locationSnapshot,
                oldPriority,
                newPriority,
                slaDeadline: ticket.slaDeadline,
                status: ticket.status,
                assignedTo: ticket.assignedTo?.fullname || 'Unassigned',
                isNewBreach: !wasAlreadyBreached,
                timestamp: now
            };

            // Targeted staff alerts (protect student channel privacy)
            emitToRoom('role:Warden', 'sla:breach_alert', alertPayload);
            emitToRoom('role:Technician', 'sla:breach_alert', alertPayload);
            emitToRoom(`ticket:${ticket._id}`, 'ticket:updated', ticket);
            emitToRoom('role:Warden', 'ticket:updated', ticket);
            emitToRoom('role:Technician', 'ticket:updated', ticket);
        }

        return {
            breachedCount: escalatedTickets.length,
            escalatedTickets
        };
    } catch (error) {
        console.error('[SLA CRON ERROR] Failure during SLA scheduled evaluation:', error);
        throw error;
    }
};

/**
 * Initialize node-cron schedule (Runs every 30 minutes)
 */
export const initSLACron = () => {
    cron.schedule('*/30 * * * *', async () => {
        try {
            await runSLACheck();
        } catch (error) {
            console.error('[SLA CRON] Error executing 30-minute SLA cycle:', error);
        }
    });
};
