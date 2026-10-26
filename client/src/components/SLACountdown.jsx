import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, PauseCircle } from 'lucide-react';

const SLACountdown = ({ ticket, compact = false }) => {
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0,
        isBreached: false,
        totalRemainingMs: 0
    });

    useEffect(() => {
        if (!ticket) return;

        const calculateTime = () => {
            if (ticket.status === 'Resolved') {
                return;
            }

            if (ticket.status === 'Awaiting-Student-Reply') {
                return;
            }

            const deadline = new Date(ticket.slaDeadline).getTime();
            const now = Date.now();
            const difference = deadline - now;

            if (difference <= 0) {
                const overdue = Math.abs(difference);
                const hours = Math.floor(overdue / (1000 * 60 * 60));
                const minutes = Math.floor((overdue % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((overdue % (1000 * 60)) / 1000);
                setTimeLeft({
                    hours,
                    minutes,
                    seconds,
                    isBreached: true,
                    totalRemainingMs: difference
                });
            } else {
                const hours = Math.floor(difference / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                setTimeLeft({
                    hours,
                    minutes,
                    seconds,
                    isBreached: false,
                    totalRemainingMs: difference
                });
            }
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);

        return () => clearInterval(interval);
    }, [ticket?.slaDeadline, ticket?.status]);

    if (!ticket) return null;

    // 1. Status is Resolved
    if (ticket.status === 'Resolved') {
        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#D1FAE5] text-[#065F46] border border-[#065F46] font-mono font-bold text-xs rounded shadow-[2px_2px_0px_0px_#065F46] ${compact ? 'text-[11px] py-0.5' : ''}`}>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>RESOLVED</span>
            </div>
        );
    }

    // 2. Status is Awaiting-Student-Reply (Paused SLA)
    if (ticket.status === 'Awaiting-Student-Reply') {
        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FEF3C7] text-[#92400E] border-2 border-black font-mono font-bold text-xs rounded neo-shadow-sm ${compact ? 'text-[11px] py-0.5' : ''}`}>
                <PauseCircle className="w-3.5 h-3.5 text-[#D97706] animate-pulse" />
                <span>SLA PAUSED</span>
            </div>
        );
    }

    // 3. SLA Breached
    if (timeLeft.isBreached || ticket.slaBreached) {
        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FEE2E2] text-[#991B1B] border-2 border-[#DC2626] font-mono font-extrabold text-xs rounded shadow-[2px_2px_0px_0px_#DC2626] animate-pulse ${compact ? 'text-[11px] py-0.5' : ''}`}>
                <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" />
                <span>BREACHED +{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
        );
    }

    // 4. Critical Warning (< 4 hours remaining)
    const isUrgent = timeLeft.totalRemainingMs < 4 * 60 * 60 * 1000;

    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 border-2 border-black font-mono font-bold text-xs rounded neo-shadow-sm ${isUrgent ? 'bg-[#FFD93D] text-black' : 'bg-white text-black'} ${compact ? 'text-[11px] py-0.5' : ''}`}>
            <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'animate-spin' : ''}`} />
            <span>
                {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
        </div>
    );
};

export default SLACountdown;
