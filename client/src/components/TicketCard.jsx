import { useNavigate } from "react-router-dom";
import SLACountdown from "./SLACountdown";
import {
    Wrench,
    Zap,
    Wifi,
    Sparkles,
    User,
    MapPin,
    ArrowUpRight,
    Paperclip
} from "lucide-react";

const getCategoryIcon = (category) => {
    switch (category) {
        case "Plumbing":
            return <Wrench className="w-3.5 h-3.5 text-[#a6a9ad]" />;
        case "Electrical":
            return <Zap className="w-3.5 h-3.5 text-amber-400" />;
        case "IT":
            return <Wifi className="w-3.5 h-3.5 text-[#3fd6c6]" />;
        case "Housekeeping":
            return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
        default:
            return <Wrench className="w-3.5 h-3.5 text-[#a6a9ad]" />;
    }
};

const getPriorityStyle = (priority) => {
    switch (priority) {
        case "Critical":
            return "bg-red-950/40 text-red-300 border-red-900/60";
        case "High":
            return "bg-amber-950/40 text-amber-300 border-amber-900/50";
        case "Medium":
            return "bg-[#141414] text-[#a6a9ad] border-[#222222]";
        case "Low":
        default:
            return "bg-[#101010] text-[#717478] border-[#1f1f1f]";
    }
};

const TicketCard = ({ ticket }) => {
    const navigate = useNavigate();

    const isBreached = ticket.slaBreached || (ticket.status !== "Resolved" && ticket.status !== "Awaiting-Student-Reply" && new Date() > new Date(ticket.slaDeadline));

    return (
        <div
            onClick={() => navigate(`/tickets/${ticket._id}`)}
            className={`group bg-[#0e0e0e] border ${
                isBreached ? "border-red-900/60 animate-breach-pulse" : "border-[#222222] hover:border-[#303030]"
            } hover:bg-[#121212] rounded-[6px] p-4 cursor-pointer transition-all duration-120 relative`}
        >
            {/* Header: Category, Attachments, and Priority */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#141414] border border-[#222222] rounded-full text-[11px] font-mono text-[#a6a9ad]">
                        {getCategoryIcon(ticket.category)}
                        <span>{ticket.category}</span>
                    </div>
                    {ticket.attachments && ticket.attachments.length > 0 && (
                        <div
                            title={`${ticket.attachments.length} attachment(s)`}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#141414] border border-[#222222] rounded-full text-[10px] font-mono text-[#717478]"
                        >
                            <Paperclip className="w-2.5 h-2.5" />
                            <span>{ticket.attachments.length}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-mono font-medium uppercase px-2 py-0.5 border rounded-full ${getPriorityStyle(ticket.priority)}`}>
                        {ticket.priority}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#55585d] group-hover:text-[#f2f2f2] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
            </div>

            {/* Title */}
            <h3 className="font-medium text-sm text-[#f2f2f2] line-clamp-2 leading-snug group-hover:text-white transition-colors mb-2">
                {ticket.title}
            </h3>

            {/* Location & Room */}
            <div className="flex items-center gap-1.5 text-xs text-[#8a8d91] mb-3 bg-[#080808] p-2 border border-[#1a1a1a] rounded-[4px]">
                <MapPin className="w-3.5 h-3.5 text-[#55585d] shrink-0" />
                <span className="truncate font-normal">
                    {ticket.locationSnapshot || ticket.studentId?.location || "Campus Residence"}
                </span>
            </div>

            {/* Footer: Resolution Timeline & Assignee */}
            <div className="flex items-center justify-between pt-2.5 border-t border-[#1a1a1a] gap-2">
                <SLACountdown ticket={ticket} compact={true} />

                <div className="flex items-center gap-1 text-[11px] font-mono text-[#717478]">
                    <User className="w-3 h-3 text-[#55585d]" />
                    <span className="truncate max-w-[100px]">
                        {ticket.assignedTo ? ticket.assignedTo.fullname.split(" ")[0] : "Unassigned"}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TicketCard;
