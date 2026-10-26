import { useNavigate } from 'react-router-dom';
import SLACountdown from './SLACountdown';
import {
    Wrench,
    Zap,
    Wifi,
    Sparkles,
    User,
    MapPin,
    AlertCircle,
    ArrowUpRight,
    Paperclip
} from 'lucide-react';

const getCategoryIcon = (category) => {
    switch (category) {
        case 'Plumbing':
            return <Wrench className="w-3.5 h-3.5" />;
        case 'Electrical':
            return <Zap className="w-3.5 h-3.5 text-amber-500" />;
        case 'IT':
            return <Wifi className="w-3.5 h-3.5 text-indigo-500" />;
        case 'Housekeeping':
            return <Sparkles className="w-3.5 h-3.5 text-emerald-500" />;
        default:
            return <Wrench className="w-3.5 h-3.5" />;
    }
};

const getPriorityStyle = (priority) => {
    switch (priority) {
        case 'Critical':
            return 'bg-[#FF5252] text-white border-black';
        case 'High':
            return 'bg-[#FFD93D] text-black border-black';
        case 'Medium':
            return 'bg-[#60A5FA] text-black border-black';
        case 'Low':
        default:
            return 'bg-gray-100 text-gray-800 border-black';
    }
};

const TicketCard = ({ ticket, onQuickAction, isStaff = false }) => {
    const navigate = useNavigate();

    const isBreached = ticket.slaBreached || (ticket.status !== 'Resolved' && ticket.status !== 'Awaiting-Student-Reply' && new Date() > new Date(ticket.slaDeadline));

    return (
        <div
            onClick={() => navigate(`/tickets/${ticket._id}`)}
            className={`group bg-white border-2 border-black rounded-lg p-4 cursor-pointer transition-all duration-150 relative ${
                isBreached ? 'animate-breach-pulse' : 'neo-shadow-md hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#000]'
            }`}
        >
            {/* Header: Category, Attachments and Priority */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 border border-black rounded text-[11px] font-bold text-gray-800">
                        {getCategoryIcon(ticket.category)}
                        <span>{ticket.category}</span>
                    </div>
                    {ticket.attachments && ticket.attachments.length > 0 && (
                        <div
                            title={`${ticket.attachments.length} document/image attachment(s)`}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#FFD93D] border border-black rounded text-[10px] font-mono font-bold"
                        >
                            <Paperclip className="w-3 h-3 text-black" />
                            <span>{ticket.attachments.length}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 border rounded ${getPriorityStyle(ticket.priority)}`}>
                        {ticket.priority}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
            </div>

            {/* Title */}
            <h3 className="font-extrabold text-sm text-black line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors mb-2">
                {ticket.title}
            </h3>

            {/* Location & Student */}
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-3 bg-gray-50 p-2 border border-dashed border-gray-300 rounded">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate font-medium">
                    {ticket.locationSnapshot || ticket.studentId?.location || 'Campus Residence'}
                </span>
            </div>

            {/* Footer: SLA Countdown & Assigned technician */}
            <div className="flex items-center justify-between pt-2 border-t-2 border-black/10 gap-2">
                <SLACountdown ticket={ticket} compact={true} />

                <div className="flex items-center gap-1 text-[11px] font-bold text-gray-700">
                    <User className="w-3 h-3 text-gray-400" />
                    <span className="truncate max-w-[100px]">
                        {ticket.assignedTo ? ticket.assignedTo.fullname.split(' ')[0] : 'Unassigned'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TicketCard;
