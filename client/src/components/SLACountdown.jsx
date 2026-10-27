import { useState, useEffect } from "react";
import { formatFriendlyDateTime } from "../utils/dateUtils";
import { Clock, AlertCircle, CheckCircle2, PauseCircle } from "lucide-react";

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
            if (ticket.status === "Resolved" || ticket.status === "Awaiting-Student-Reply") {
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

        if (ticket.status === "Resolved" || ticket.status === "Awaiting-Student-Reply") {
            return;
        }

        const interval = setInterval(calculateTime, 1000);
        return () => clearInterval(interval);
    }, [ticket?.slaDeadline, ticket?.status]);

    if (!ticket) return null;

    // 1. Resolved
    if (ticket.status === "Resolved") {
        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-900/50 font-mono text-xs ${compact ? "text-[10px] py-0.5" : ""}`}>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Resolved</span>
            </div>
        );
    }

    // 2. Paused (Awaiting Student Reply)
    if (ticket.status === "Awaiting-Student-Reply") {
        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/40 text-amber-300 border border-amber-900/50 font-mono text-xs ${compact ? "text-[10px] py-0.5" : ""}`}>
                <PauseCircle className="w-3 h-3 text-amber-400" />
                <span>Paused (Awaiting Reply)</span>
            </div>
        );
    }

    // 3. Overdue / Target Exceeded
    if (timeLeft.isBreached || ticket.slaBreached) {
        return (
            <div
                title={ticket.slaDeadline ? `Target was: ${formatFriendlyDateTime(ticket.slaDeadline)}` : undefined}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/40 text-red-300 border border-red-900/60 font-mono text-xs ${compact ? "text-[10px] py-0.5" : ""}`}
            >
                <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
                <span>
                    Overdue +{String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
                </span>
            </div>
        );
    }

    // 4. Active Target Resolution Window
    const isUrgent = timeLeft.totalRemainingMs < 4 * 60 * 60 * 1000;

    return (
        <div
            title={ticket.slaDeadline ? `Target: ${formatFriendlyDateTime(ticket.slaDeadline)}` : undefined}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#121212] border ${isUrgent ? "border-amber-900/70 text-amber-200" : "border-[#222222] text-[#f2f2f2]"} font-mono text-xs ${compact ? "text-[10px]" : ""}`}
        >
            <Clock className={`w-3 h-3 ${isUrgent ? "text-amber-400" : "text-[#717478]"}`} />
            <span>
                {String(timeLeft.hours).padStart(2, "0")}h {String(timeLeft.minutes).padStart(2, "0")}m {String(timeLeft.seconds).padStart(2, "0")}s
            </span>
        </div>
    );
};

export default SLACountdown;
