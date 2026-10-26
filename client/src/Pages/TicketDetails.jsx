import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { axiosInstance } from "../axiosCalls/axios";
import SLACountdown from "../components/SLACountdown";
import AttachmentViewer from "../components/AttachmentViewer";
import confetti from "canvas-confetti";
import {
    ArrowLeft,
    Send,
    Lock,
    Unlock,
    User,
    Calendar,
    MapPin,
    AlertTriangle,
    CheckCircle,
    Clock,
    Wrench,
    Zap,
    Shield,
    MessageSquare,
    PlayCircle,
    PauseCircle,
    Paperclip,
    FileText,
    Loader2,
    X
} from "lucide-react";

const TicketDetails = () => {
    const { id: ticketId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { socket, joinTicketRoom, leaveTicketRoom } = useSocket();

    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Comment input state
    const [message, setMessage] = useState("");
    const [isInternal, setIsInternal] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [commentAttachments, setCommentAttachments] = useState([]);
    const [uploadingAttachment, setUploadingAttachment] = useState(false);
    const commentFileInputRef = useRef(null);

    // Actions state
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [updatingDeadline, setUpdatingDeadline] = useState(false);
    const [activeButton, setActiveButton] = useState(null);
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [customHours, setCustomHours] = useState("");
    const [customDate, setCustomDate] = useState("");
    const [showCustomDate, setShowCustomDate] = useState(false);

    const chatEndRef = useRef(null);

    const isStaff = user?.role === "Warden" || user?.role === "Technician";

    // Fetch ticket details and comment thread
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);
                const [ticketRes, commentsRes] = await Promise.all([
                    axiosInstance.get(`/tickets/${ticketId}`),
                    axiosInstance.get(`/tickets/${ticketId}/comments`)
                ]);

                if (isMounted) {
                    setTicket(ticketRes.data.ticket);
                    setComments(commentsRes.data.comments || []);
                }

                if (user?.role === "Warden") {
                    const staffRes = await axiosInstance.get("/users/staff");
                    if (isMounted) {
                        setStaffList(staffRes.data.staff || []);
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.response?.data?.message || "Failed to load ticket details.");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [ticketId, isStaff]);

    // Real-time ticket updates and comments via WebSocket
    useEffect(() => {
        if (!ticketId) return;

        joinTicketRoom(ticketId);

        if (!socket) return;

        const handleNewComment = (newComment) => {
            setComments((prev) => {
                if (prev.some((c) => c._id === newComment._id)) return prev;
                return [...prev, newComment];
            });
        };

        const handleTicketUpdated = (updatedTicket) => {
            if (updatedTicket._id === ticketId) {
                setTicket(updatedTicket);
            }
        };

        socket.on("comment:new", handleNewComment);
        socket.on("ticket:updated", handleTicketUpdated);

        return () => {
            leaveTicketRoom(ticketId);
            socket.off("comment:new", handleNewComment);
            socket.off("ticket:updated", handleTicketUpdated);
        };
    }, [socket, ticketId, joinTicketRoom, leaveTicketRoom]);

    // Auto-scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [comments]);

    // Handle attaching file to comment
    const handleCommentFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("files", file);

        setUploadingAttachment(true);
        try {
            const res = await axiosInstance.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (res.data?.success && res.data.files?.length > 0) {
                setCommentAttachments((prev) => [...prev, ...res.data.files]);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to attach document/image.");
        } finally {
            setUploadingAttachment(false);
            if (commentFileInputRef.current) commentFileInputRef.current.value = "";
        }
    };

    // Post a comment
    const handleSendComment = async (e) => {
        e.preventDefault();
        const hasText = message.trim() !== "";
        const hasFiles = commentAttachments.length > 0;
        if (!hasText && !hasFiles) return;

        setSubmittingComment(true);
        try {
            const res = await axiosInstance.post(`/tickets/${ticketId}/comments`, {
                message: hasText ? message.trim() : (hasFiles ? "📎 Attached document/image" : ""),
                isInternal: isStaff ? isInternal : false,
                attachments: commentAttachments
            });

            if (res.data?.success) {
                setMessage("");
                setIsInternal(false);
                setCommentAttachments([]);
            }
        } catch (err) {
            console.error("Failed to post comment:", err);
            alert(err.response?.data?.message || "Failed to post message. Please check your connection and try again.");
        } finally {
            setSubmittingComment(false);
        }
    };

    // Update ticket status
    const handleStatusChange = async (newStatus) => {
        setStatusUpdating(true);
        try {
            const res = await axiosInstance.put(`/tickets/${ticketId}/status`, { status: newStatus });
            if (res.data?.success) {
                setTicket(res.data.ticket);
                if (newStatus === "Resolved") {
                    try {
                        confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
                    } catch (e) {}
                }
            }
        } catch (err) {
            alert(err.response?.data?.message || "Error updating status");
        } finally {
            setStatusUpdating(false);
        }
    };

    // Assign staff member
    const handleAssignChange = async (e) => {
        const assignedTo = e.target.value;
        setAssigning(true);
        try {
            const res = await axiosInstance.put(`/tickets/${ticketId}/assign`, { assignedTo });
            if (res.data?.success) {
                setTicket(res.data.ticket);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Error assigning staff");
        } finally {
            setAssigning(false);
        }
    };

    // Deadline adjustment
    const handleSetDeadline = async ({ hours, date }) => {
        setUpdatingDeadline(true);
        setActiveButton(hours !== undefined ? hours : "custom");
        try {
            const payload = hours !== undefined ? { deadlineHours: hours } : { customDeadline: date };
            const res = await axiosInstance.put(`/tickets/${ticketId}/deadline`, payload);
            if (res.data?.success) {
                setTicket(res.data.ticket);
                setSelectedPreset(hours !== undefined ? hours : "custom");
                setCustomHours("");
                setCustomDate("");
                setShowCustomDate(false);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update resolution deadline");
        } finally {
            setUpdatingDeadline(false);
            setActiveButton(null);
        }
    };

    const activePreset = (() => {
        if (selectedPreset !== null) return selectedPreset;
        if (!ticket?.slaDeadline) return null;
        const now = Date.now();
        const deadline = new Date(ticket.slaDeadline).getTime();
        const created = ticket.createdAt ? new Date(ticket.createdAt).getTime() : now;
        
        const totalWindowHours = Math.round((deadline - created) / (3600 * 1000));
        if ([4, 12, 24, 48].includes(totalWindowHours)) return totalWindowHours;

        const remainingHours = Math.round((deadline - now) / (3600 * 1000));
        if ([4, 12, 24, 48].includes(remainingHours)) return remainingHours;

        return null;
    })();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="p-8 rounded-[6px] bg-[#0e0e0e] border border-[#222222] flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-[#3fd6c6]" />
                    <span className="font-mono text-xs text-[#8a8d91] tracking-wider uppercase">Loading Ticket Console...</span>
                </div>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="min-h-screen bg-[#050505] p-6 flex flex-col items-center justify-center">
                <div className="max-w-md p-6 rounded-[6px] bg-[#0e0e0e] border border-[#222222] text-center">
                    <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                    <h2 className="text-base font-medium text-[#f2f2f2]">Unable to Access Ticket</h2>
                    <p className="text-xs text-[#a6a9ad] my-2">{error || "Ticket not found or permission denied."}</p>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="px-4 py-2 mt-2 rounded-full bg-[#f2f2f2] text-[#0a0a0a] hover:bg-white text-xs font-medium"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const isBreached = ticket.slaBreached || (ticket.status !== "Resolved" && ticket.status !== "Awaiting-Student-Reply" && new Date() > new Date(ticket.slaDeadline));

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-[#050505] p-4 sm:p-6 lg:p-8 text-[#f2f2f2] font-sans">
            {/* Top Navigation Bar */}
            <div className="max-w-[1360px] mx-auto mb-6 flex items-center justify-between">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="px-4 py-2 rounded-full bg-[#0e0e0e] border border-[#222222] hover:border-[#303030] text-[#a6a9ad] hover:text-[#f2f2f2] text-xs font-medium flex items-center gap-2 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Issues</span>
                </button>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#8a8d91]">Ticket:</span>
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#141414] border border-[#222222] text-[#f2f2f2]">
                        #{ticket._id.slice(-6).toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Split-Screen 12-Column Grid */}
            <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT PANEL: Meta, Resolution Window & Actions */}
                <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-5">
                    
                    {/* Main Meta Card */}
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
                        </div>

                        {/* Resolution Timeline Notifications */}
                        {ticket.status === "Awaiting-Student-Reply" && (
                            <div className="mb-4 p-3.5 rounded-[6px] bg-[#161208] border border-amber-800/40 text-xs text-amber-200/90 flex items-center gap-2.5">
                                <PauseCircle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                                <div>
                                    <strong className="block font-medium">Resolution Timeline Paused</strong>
                                    Countdown is frozen while waiting for the student&apos;s clarification.
                                </div>
                            </div>
                        )}

                        {isBreached && (
                            <div className="mb-4 p-3.5 rounded-[6px] bg-[#180a0a] border border-red-800/50 text-xs text-red-200/90 flex items-center gap-2.5">
                                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                                <div>
                                    <strong className="block font-medium">Target Resolution Window Overdue</strong>
                                    Issue unresolved past deadline. Automatically escalated for priority review.
                                </div>
                            </div>
                        )}

                        {/* Warden Action Controls: Status, Assignee, Window */}
                        {user?.role === "Warden" && (
                            <div className="pt-5 border-t border-[#1f1f1f] flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono text-[#a6a9ad] uppercase tracking-wider">
                                        Warden Management Controls
                                    </span>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#141414] border border-[#222222] text-[#3fd6c6]">
                                        Admin
                                    </span>
                                </div>

                                {/* Status Switcher */}
                                <div>
                                    <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-2">
                                        Update Issue Status
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {["Open", "Assigned", "Awaiting-Student-Reply", "Resolved"].map((st) => {
                                            const isActive = ticket.status === st;
                                            return (
                                                <button
                                                    key={st}
                                                    type="button"
                                                    disabled={statusUpdating}
                                                    onClick={() => handleStatusChange(st)}
                                                    className={`px-2.5 py-1.5 text-xs rounded-full border transition-all cursor-pointer ${
                                                        isActive
                                                            ? "bg-[#f2f2f2] text-[#0a0a0a] border-[#f2f2f2] font-medium"
                                                            : "bg-[#141414] border-[#222222] text-[#a6a9ad] hover:border-[#303030]"
                                                    }`}
                                                >
                                                    {st === "Awaiting-Student-Reply" ? "Awaiting Reply" : st}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Assign Technician */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-[11px] font-mono text-[#8a8d91] uppercase">
                                            Assign Technician / Staff
                                        </label>
                                        <span className="text-[10px] font-mono text-[#8a8d91]">
                                            {ticket.hostel || (ticket.locationSnapshot?.includes("Velankani") ? "Velankani Hostel" : "Neeladri Hostel")}
                                        </span>
                                    </div>
                                    <select
                                        disabled={assigning}
                                        value={ticket.assignedTo?._id || ticket.assignedTo || ""}
                                        onChange={handleAssignChange}
                                        className="w-full px-3 py-2 text-xs border border-[#222222] rounded-[6px] bg-[#0a0a0a] text-[#f2f2f2] font-normal focus:outline-none focus:border-[#3fd6c6]"
                                    >
                                        <option value="">-- Unassigned --</option>
                                        {staffList
                                            .filter((member) => {
                                                const ticketHostel = ticket.hostel || (ticket.locationSnapshot?.includes("Velankani") ? "Velankani Hostel" : "Neeladri Hostel");
                                                const memberHostel = member.hostel || (member.location?.includes("Velankani") ? "Velankani Hostel" : "Neeladri Hostel");
                                                return memberHostel === ticketHostel;
                                            })
                                            .map((member) => (
                                                <option key={member._id} value={member._id}>
                                                    {member.fullname} ({member.role}{member.role === "Technician" && member.specialization ? ` • ${member.specialization}` : ""})
                                                </option>
                                            ))}
                                    </select>
                                    <p className="text-[10px] text-[#8a8d91] font-mono mt-1">
                                        Hostel Isolation: Filtered to staff in {ticket.hostel || (ticket.locationSnapshot?.includes("Velankani") ? "Velankani Hostel" : "Neeladri Hostel")}.
                                    </p>
                                </div>

                                {/* Target Resolution Window Controls */}
                                <div className="pt-3 border-t border-[#1f1f1f]">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-[11px] font-mono text-[#8a8d91] uppercase flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-[#3fd6c6]" />
                                            <span>Target Resolution Window</span>
                                        </label>
                                        <span className="text-[10px] font-mono text-[#8a8d91]">
                                            Warden Controlled
                                        </span>
                                    </div>

                                    {/* Presets */}
                                    <div className="grid grid-cols-4 gap-2 mb-2">
                                        {[4, 12, 24, 48].map((hrs) => {
                                            const isSelected = activePreset === hrs;
                                            return (
                                                <button
                                                    key={hrs}
                                                    type="button"
                                                    disabled={updatingDeadline}
                                                    onClick={() => handleSetDeadline({ hours: hrs })}
                                                    className={`py-1.5 text-xs rounded-full border transition-all cursor-pointer font-mono ${
                                                        isSelected
                                                            ? "bg-[#f2f2f2] text-[#0a0a0a] border-[#f2f2f2] font-semibold"
                                                            : "bg-[#141414] border-[#222222] text-[#a6a9ad] hover:border-[#303030]"
                                                    }`}
                                                >
                                                    {updatingDeadline && activeButton === hrs ? (
                                                        <Loader2 className="w-3 h-3 animate-spin mx-auto text-[#0a0a0a]" />
                                                    ) : (
                                                        `+${hrs}h`
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Custom Hours */}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0.5"
                                            step="0.5"
                                            placeholder="Custom hours (e.g. 6)"
                                            value={customHours}
                                            onChange={(e) => setCustomHours(e.target.value)}
                                            className="flex-1 px-3 py-1.5 text-xs border border-[#222222] rounded-full bg-[#0a0a0a] text-[#f2f2f2] placeholder-[#8a8d91] focus:outline-none focus:border-[#3fd6c6]"
                                        />
                                        <button
                                            type="button"
                                            disabled={updatingDeadline || !customHours}
                                            onClick={() => handleSetDeadline({ hours: Number(customHours) })}
                                            className="px-4 py-1.5 rounded-full bg-[#f2f2f2] text-[#0a0a0a] hover:bg-white text-xs font-medium whitespace-nowrap flex items-center gap-1 transition-colors"
                                        >
                                            {updatingDeadline && activeButton === "custom" ? (
                                                <>
                                                    <Loader2 className="w-3 h-3 animate-spin text-[#0a0a0a]" />
                                                    <span>Updating...</span>
                                                </>
                                            ) : (
                                                <span>Set Hours</span>
                                            )}
                                        </button>
                                    </div>

                                    {/* Exact Date/Time Picker */}
                                    <div className="mt-2">
                                        {!showCustomDate ? (
                                            <button
                                                type="button"
                                                onClick={() => setShowCustomDate(true)}
                                                className="text-[11px] font-mono text-[#8a8d91] hover:text-[#f2f2f2] cursor-pointer"
                                            >
                                                + Set exact target date &amp; time
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2 mt-2">
                                                <input
                                                    type="datetime-local"
                                                    value={customDate}
                                                    onChange={(e) => setCustomDate(e.target.value)}
                                                    className="flex-1 px-3 py-1 text-xs border border-[#222222] rounded-[6px] bg-[#0a0a0a] text-[#f2f2f2] focus:outline-none focus:border-[#3fd6c6]"
                                                />
                                                <button
                                                    type="button"
                                                    disabled={updatingDeadline || !customDate}
                                                    onClick={() => handleSetDeadline({ date: new Date(customDate).toISOString() })}
                                                    className="px-3 py-1 rounded-full bg-[#f2f2f2] text-[#0a0a0a] hover:bg-white text-xs font-medium"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCustomDate(false)}
                                                    className="text-xs px-2 py-1 text-[#8a8d91] hover:text-[#f2f2f2] cursor-pointer"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Technician Work Console (Read-only) */}
                        {user?.role === "Technician" && (
                            <div className="pt-5 border-t border-[#1f1f1f] flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono text-[#a6a9ad] uppercase tracking-wider flex items-center gap-1.5">
                                        <Wrench className="w-3.5 h-3.5 text-[#3fd6c6]" />
                                        <span>Technician Work Console</span>
                                    </span>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#141414] border border-[#222222] text-[#3fd6c6]">
                                        Assigned to You
                                    </span>
                                </div>
                                <div className="p-3.5 rounded-[6px] bg-[#0a0a0a] border border-[#1f1f1f] text-xs flex flex-col gap-2">
                                    <div className="flex items-center justify-between font-mono">
                                        <span className="text-[#8a8d91] text-[10px] uppercase">Current Status:</span>
                                        <span className="px-2 py-0.5 rounded-full bg-[#141414] border border-[#222222] text-[#f2f2f2] text-[11px]">
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#8a8d91]">Designated Scope:</span>
                                        <span className="font-medium text-[#f2f2f2]">{ticket.category}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#8a8d91]">Room Location:</span>
                                        <span className="font-medium text-[#f2f2f2]">{ticket.locationSnapshot || ticket.studentId?.location}</span>
                                    </div>
                                    <p className="text-[10px] text-[#8a8d91] font-mono pt-2 border-t border-[#1f1f1f]">
                                        Status and assignments are managed by the Warden. Post progress notes and questions in the Discussion Thread.
                                    </p>
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
                                                {new Date(item.escalatedAt || item.triggeredAt || item.createdAt || Date.now()).toLocaleString()}
                                            </span>
                                            <span className="font-medium text-[#f2f2f2]">{item.reason?.replace(/SLA Breach/gi, "Target Overdue")?.replace(/SLA Deadline adjusted/gi, "Resolution window adjusted") || "Priority Escalation"}</span>
                                        </div>
                                        <div className="text-right font-mono text-[11px]">
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

                {/* RIGHT PANEL: Live Discussion Thread */}
                <div className="lg:col-span-6 xl:col-span-7">
                    <div className="rounded-[6px] bg-[#0e0e0e] border border-[#222222] p-5 flex flex-col h-[740px]">
                        
                        {/* Discussion Header */}
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#222222]">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-[#3fd6c6]" />
                                <h3 className="font-medium text-sm text-[#f2f2f2]">
                                    Issue Discussion &amp; Activity
                                </h3>
                            </div>
                            <span className="text-xs font-mono text-[#8a8d91] px-2.5 py-0.5 rounded-full bg-[#141414] border border-[#222222]">
                                {comments.length} {comments.length === 1 ? "entry" : "entries"}
                            </span>
                        </div>

                        {/* Messages Stream */}
                        <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3.5 bg-[#090909] rounded-[6px] border border-[#181818]">
                            {comments.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#8a8d91]">
                                    <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
                                    <p className="font-mono text-xs uppercase text-[#a6a9ad]">No discussion entries yet</p>
                                    <p className="text-[11px] text-[#8a8d91] mt-1 max-w-xs">
                                        Post an update, note, or inquiry to begin coordinated resolution.
                                    </p>
                                </div>
                            ) : (
                                comments.map((comment) => {
                                    const isSenderMe = comment.senderId?._id === user?._id;
                                    const isInternalNote = comment.isInternal;

                                    return (
                                        <div
                                            key={comment._id}
                                            className={`flex flex-col ${isSenderMe ? "items-end" : "items-start"}`}
                                        >
                                            {/* Sender Info Bar */}
                                            <div className="flex items-center gap-1.5 mb-1 px-1">
                                                <span className="font-medium text-xs text-[#f2f2f2]">
                                                    {comment.senderId?.fullname || "User"}
                                                </span>
                                                <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full border ${
                                                    comment.senderId?.role === "Warden" ? "bg-rose-950/60 text-rose-300 border-rose-800/40" :
                                                    comment.senderId?.role === "Technician" ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/40" :
                                                    "bg-[#1a1a1a] text-[#a6a9ad] border-[#2a2a2a]"
                                                }`}>
                                                    {comment.senderId?.role || "Resident"}
                                                </span>
                                                <span className="text-[10px] font-mono text-[#8a8d91]">
                                                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                            </div>

                                            {/* Message Bubble */}
                                            <div
                                                className={`max-w-[85%] rounded-[6px] p-3.5 text-xs leading-relaxed border ${
                                                    isInternalNote
                                                        ? "bg-[#181208] border-amber-900/50 text-amber-200/95"
                                                        : isSenderMe
                                                        ? "bg-[#161616] border-[#2c2c2c] text-[#f2f2f2]"
                                                        : "bg-[#101010] border-[#222222] text-[#f2f2f2]"
                                                }`}
                                            >
                                                {isInternalNote && (
                                                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 uppercase mb-1.5 pb-1 border-b border-amber-900/40">
                                                        <Lock className="w-3 h-3" />
                                                        <span>Internal Staff Note (Hidden from Resident)</span>
                                                    </div>
                                                )}
                                                <p className="whitespace-pre-wrap font-normal">
                                                    {comment.message}
                                                </p>

                                                {/* Comment Attachments */}
                                                {comment.attachments && comment.attachments.length > 0 && (
                                                    <div className="mt-2.5 pt-2 border-t border-[#222222]">
                                                        <AttachmentViewer attachments={comment.attachments} compact={true} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Comment Input Footer */}
                        <form
                            onSubmit={handleSendComment}
                            className="p-3 bg-[#0a0a0a] rounded-[6px] border border-[#1f1f1f] mt-3 flex flex-col gap-2.5"
                        >
                            {/* Staff Only Internal Note Toggle */}
                            {isStaff && (
                                <div className="flex items-center justify-between bg-[#141005] px-3 py-1.5 border border-amber-900/40 rounded-[6px] text-xs">
                                    <label className="flex items-center gap-2 cursor-pointer font-medium text-amber-300 select-none">
                                        <input
                                            type="checkbox"
                                            checked={isInternal}
                                            onChange={(e) => setIsInternal(e.target.checked)}
                                            className="w-3.5 h-3.5 rounded text-amber-500 focus:ring-0 bg-[#0a0a0a] border-[#333]"
                                        />
                                        <span className="flex items-center gap-1.5">
                                            {isInternal ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3 text-[#8a8d91]" />}
                                            <span>Post as Internal Staff Note</span>
                                        </span>
                                    </label>
                                    <span className="text-[10px] font-mono text-amber-400/80">
                                        {isInternal ? "Hidden from students" : "Visible to everyone"}
                                    </span>
                                </div>
                            )}

                            {/* Preview Selected Comment Attachments */}
                            {commentAttachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 p-2 bg-[#080808] border border-[#222222] rounded-[6px]">
                                    {commentAttachments.map((att, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5 bg-[#141414] border border-[#222222] rounded-full px-2.5 py-0.5 text-[11px] text-[#f2f2f2]">
                                            {att.fileType?.includes("pdf") || att.filename?.endsWith(".pdf") ? (
                                                <FileText className="w-3.5 h-3.5 text-rose-400" />
                                            ) : (
                                                <img src={att.url} alt="" className="w-3.5 h-3.5 object-cover rounded-full" />
                                            )}
                                            <span className="font-mono truncate max-w-[120px]">{att.filename}</span>
                                            <button
                                                type="button"
                                                onClick={() => setCommentAttachments((prev) => prev.filter((_, i) => i !== idx))}
                                                className="text-[#8a8d91] hover:text-[#f2f2f2] cursor-pointer ml-1"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    ref={commentFileInputRef}
                                    className="hidden"
                                    accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                                    onChange={handleCommentFileUpload}
                                />

                                <button
                                    type="button"
                                    onClick={() => commentFileInputRef.current?.click()}
                                    disabled={uploadingAttachment}
                                    title="Attach image or PDF document"
                                    className="p-2 rounded-full bg-[#141414] border border-[#222222] hover:border-[#303030] text-[#a6a9ad] hover:text-[#f2f2f2] transition-colors"
                                >
                                    {uploadingAttachment ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-[#3fd6c6]" />
                                    ) : (
                                        <Paperclip className="w-4 h-4" />
                                    )}
                                </button>

                                <input
                                    type="text"
                                    placeholder={isInternal ? "Write internal staff note..." : "Type reply to resident or staff (Enter to send)..."}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="flex-1 px-4 py-2 text-xs border border-[#222222] rounded-full bg-[#080808] text-[#f2f2f2] placeholder-[#8a8d91] focus:outline-none focus:border-[#3fd6c6]"
                                />
                                <button
                                    type="submit"
                                    disabled={submittingComment || (!message.trim() && commentAttachments.length === 0)}
                                    className="px-4 py-2 rounded-full bg-[#f2f2f2] text-[#0a0a0a] hover:bg-white text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Send</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TicketDetails;
