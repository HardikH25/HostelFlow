import SLACountdown from "./SLACountdown";
import AttachmentViewer from "./AttachmentViewer";
import { formatFriendlyDateTime, formatAuditTimestamp, humanizeTimestampsInText } from "../utils/dateUtils";
import {
    Paperclip,
    User,
    MapPin,
    PauseCircle,
    AlertTriangle,
    Calendar,
    Clock
} from "lucide-react";

const TicketMeta = ({ ticket }) => {
    if (!ticket) return null;

    const isBreached = ticket.slaBreached || (
        ticket.status !== "Resolved" &&
        ticket.status !== "Awaiting-Student-Reply" &&
        new Date() > new Date(ticket.slaDeadline)
    );

    return (
        <div className="flex flex-col gap-5">
            {/* Main Meta Information Card */}
            <div className={`rounded-[6px] bg-[#0e0e0e] border p-6 ${isBreached ? "border-red-800/60 shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "border-[#222222]"}`}>
                {/* Badges Bar */}
                <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#141414] border border-[#222222] text-[#f2f2f2]">
                        {ticket.category}
                    </span>
                    <SLACountdown ticket={ticket} />
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-normal text-[#f2f2f2] leading-tight mb-3 tracking-tight">
                    {ticket.title}
                </h1>

                {/* Description Box */}
                <div className="bg-[#080808] border border-[#1a1a1a] rounded-[6px] p-4 mb-4 text-xs text-[#a6a9ad] leading-relaxed">
                    {ticket.description}
                </div>

                {/* Attached Evidence & Documents */}
                {ticket.attachments && ticket.attachments.length > 0 && (
                    <div className="mb-4">
                        <span className="font-mono text-xs text-[#8a8d91] mb-2 flex items-center gap-1.5">
                            <Paperclip className="w-3.5 h-3.5 text-[#8a8d91]" />
                            <span>Attached Evidence &amp; Documents ({ticket.attachments.length})</span>
                        </span>
                        <AttachmentViewer attachments={ticket.attachments} />
                    </div>
                )}

                {/* Student Snapshot Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-[6px] text-xs mb-4">
                    <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-[#8a8d91] shrink-0 mt-0.5" />
                        <div>
                            <span className="block text-[10px] font-mono text-[#8a8d91] uppercase">Submitted By:</span>
                            <span className="font-medium text-[#f2f2f2]">{ticket.studentId?.fullname || "Student Resident"}</span>
                            {ticket.studentId?.phone && (
                                <span className="block text-[10px] font-mono text-[#8a8d91]">Ph: {ticket.studentId.phone}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#8a8d91] shrink-0 mt-0.5" />
                        <div>
                            <span className="block text-[10px] font-mono text-[#8a8d91] uppercase">Hostel Location:</span>
                            <span className="font-medium text-[#f2f2f2]">{ticket.locationSnapshot || ticket.studentId?.location}</span>
                        </div>
                    </div>
                    {ticket.createdAt && (
                        <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-[#8a8d91] shrink-0 mt-0.5" />
                            <div>
                                <span className="block text-[10px] font-mono text-[#8a8d91] uppercase">Reported On:</span>
                                <span className="font-medium text-[#f2f2f2]">{formatFriendlyDateTime(ticket.createdAt)}</span>
                            </div>
                        </div>
                    )}
                    {ticket.slaDeadline && (
                        <div className="flex items-start gap-2">
                            <Clock className="w-4 h-4 text-[#3fd6c6] shrink-0 mt-0.5" />
                            <div>
                                <span className="block text-[10px] font-mono text-[#8a8d91] uppercase">Target Resolution:</span>
                                <span className="font-medium text-[#f2f2f2]">{formatFriendlyDateTime(ticket.slaDeadline)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Resolution Timeline Notifications */}
                {ticket.status === "Awaiting-Student-Reply" && (
                    <div className="p-3.5 rounded-[6px] bg-[#161208] border border-amber-800/40 text-xs text-amber-200/90 flex items-center gap-2.5">
                        <PauseCircle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                        <div>
                            <strong className="block font-medium">Resolution Timeline Paused</strong>
                            Countdown is frozen while waiting for the student&apos;s clarification.
                        </div>
                    </div>
                )}

                {isBreached && (
                    <div className="p-3.5 rounded-[6px] bg-[#180a0a] border border-red-800/50 text-xs text-red-200/90 flex items-center gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <div>
                            <strong className="block font-medium">Target Resolution Window Overdue</strong>
                            Issue unresolved past deadline. Automatically escalated for priority review.
                        </div>
                    </div>
                )}
            </div>

            {/* Resolution Audit & Escalation Log */}
            {ticket.escalationHistory && ticket.escalationHistory.length > 0 && (
                <div className="rounded-[6px] bg-[#0e0e0e] border border-[#222222] p-5">
                    <h4 className="font-mono text-xs text-[#8a8d91] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Resolution Audit &amp; Escalation History</span>
                    </h4>
                    <div className="space-y-2">
                        {ticket.escalationHistory.map((item, idx) => (
                            <div key={idx} className="p-2.5 rounded-[6px] bg-[#0a0a0a] border border-[#1a1a1a] text-xs flex items-center justify-between">
                                <div>
                                    <span className="font-mono text-[10px] text-[#8a8d91] block">
                                        {formatAuditTimestamp(item.escalatedAt || item.triggeredAt || item.createdAt)}
                                    </span>
                                    <span className="font-medium text-[#f2f2f2]">
                                        {humanizeTimestampsInText(item.reason) || "Priority Escalation"}
                                    </span>
                                </div>
                                <div className="text-right font-mono text-[11px] shrink-0 ml-3">
                                    <span className="text-[#8a8d91]">{item.oldPriority}</span>
                                    <span className="text-[#8a8d91] mx-1">→</span>
                                    <span className="text-amber-400 font-semibold">{item.newPriority}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketMeta;
