import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { axiosInstance } from '../axiosCalls/axios';
import SLACountdown from '../components/SLACountdown';
import AttachmentViewer from '../components/AttachmentViewer';
import confetti from 'canvas-confetti';
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
} from 'lucide-react';

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
    const [message, setMessage] = useState('');
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
    const [customHours, setCustomHours] = useState('');
    const [customDate, setCustomDate] = useState('');
    const [showCustomDate, setShowCustomDate] = useState(false);

    const chatEndRef = useRef(null);

    const isStaff = user?.role === 'Warden' || user?.role === 'Technician';

    // 1. Fetch Ticket & Comments
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

                // If staff, load technicians
                if (isStaff) {
                    const staffRes = await axiosInstance.get('/users/staff');
                    if (isMounted) {
                        setStaffList(staffRes.data.staff || []);
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.response?.data?.message || 'Failed to load ticket details.');
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

    // 2. WebSockets: Join ticket room and listen for real-time comments & updates
    useEffect(() => {
        if (!ticketId) return;

        joinTicketRoom(ticketId);

        if (!socket) return;

        const handleNewComment = (newComment) => {
            setComments((prev) => {
                // Avoid duplicate if socket receives own emitted comment
                if (prev.some((c) => c._id === newComment._id)) return prev;
                return [...prev, newComment];
            });
        };

        const handleTicketUpdated = (updatedTicket) => {
            if (updatedTicket._id === ticketId) {
                setTicket(updatedTicket);
            }
        };

        socket.on('comment:new', handleNewComment);
        socket.on('ticket:updated', handleTicketUpdated);

        return () => {
            leaveTicketRoom(ticketId);
            socket.off('comment:new', handleNewComment);
            socket.off('ticket:updated', handleTicketUpdated);
        };
    }, [socket, ticketId, joinTicketRoom, leaveTicketRoom]);

    // Auto-scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    // Handle attaching file to comment
    const handleCommentFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('files', file);

        setUploadingAttachment(true);
        try {
            const res = await axiosInstance.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data?.success && res.data.files?.length > 0) {
                setCommentAttachments((prev) => [...prev, ...res.data.files]);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to attach document/image.');
        } finally {
            setUploadingAttachment(false);
            if (commentFileInputRef.current) commentFileInputRef.current.value = '';
        }
    };

    // 3. Post a comment
    const handleSendComment = async (e) => {
        e.preventDefault();
        const hasText = message.trim() !== '';
        const hasFiles = commentAttachments.length > 0;
        if (!hasText && !hasFiles) return;

        setSubmittingComment(true);
        try {
            const res = await axiosInstance.post(`/tickets/${ticketId}/comments`, {
                message: hasText ? message.trim() : (hasFiles ? '📎 Attached document/image' : ''),
                isInternal: isStaff ? isInternal : false,
                attachments: commentAttachments
            });

            if (res.data?.success) {
                if (res.data.comment) {
                    setComments((prev) => {
                        if (prev.some((c) => c._id === res.data.comment._id)) return prev;
                        return [...prev, res.data.comment];
                    });
                }
                setMessage('');
                setIsInternal(false);
                setCommentAttachments([]);
            }
        } catch (err) {
            console.error('Failed to post comment:', err);
        } finally {
            setSubmittingComment(false);
        }
    };

    // 4. Update Status (Triggers SLA Pause/Resume logic on backend!)
    const handleStatusChange = async (newStatus) => {
        setStatusUpdating(true);
        try {
            const res = await axiosInstance.put(`/tickets/${ticketId}/status`, { status: newStatus });
            if (res.data?.success) {
                setTicket(res.data.ticket);
                if (newStatus === 'Resolved') {
                    try {
                        confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
                    } catch (e) {}
                }
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating status');
        } finally {
            setStatusUpdating(false);
        }
    };

    // 5. Assign Technician
    const handleAssignChange = async (e) => {
        const assignedTo = e.target.value;
        setAssigning(true);
        try {
            const res = await axiosInstance.put(`/tickets/${ticketId}/assign`, { assignedTo });
            if (res.data?.success) {
                setTicket(res.data.ticket);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Error assigning staff');
        } finally {
            setAssigning(false);
        }
    };

    // 6. Warden SLA Deadline Adjustment
    const handleSetDeadline = async ({ hours, date }) => {
        setUpdatingDeadline(true);
        setActiveButton(hours !== undefined ? hours : 'custom');
        try {
            const payload = hours !== undefined ? { deadlineHours: hours } : { customDeadline: date };
            const res = await axiosInstance.put(`/tickets/${ticketId}/deadline`, payload);
            if (res.data?.success) {
                setTicket(res.data.ticket);
                setSelectedPreset(hours !== undefined ? hours : 'custom');
                setCustomHours('');
                setCustomDate('');
                setShowCustomDate(false);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update SLA deadline');
        } finally {
            setUpdatingDeadline(false);
            setActiveButton(null);
        }
    };

    // Calculate active preset for visual selection
    const activePreset = (() => {
        if (selectedPreset !== null) return selectedPreset;
        if (!ticket?.slaDeadline) return null;
        const now = Date.now();
        const deadline = new Date(ticket.slaDeadline).getTime();
        const created = ticket.createdAt ? new Date(ticket.createdAt).getTime() : now;
        
        // Check window from creation (e.g. initial priority SLA)
        const totalWindowHours = Math.round((deadline - created) / (3600 * 1000));
        if ([4, 12, 24, 48].includes(totalWindowHours)) return totalWindowHours;

        // Check remaining hours from now
        const remainingHours = Math.round((deadline - now) / (3600 * 1000));
        if ([4, 12, 24, 48].includes(remainingHours)) return remainingHours;

        return null;
    })();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
                <div className="neo-card p-8 flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-black border-t-[#FFD93D] rounded-full animate-spin" />
                    <span className="font-bold text-sm tracking-wider uppercase">Loading Ticket Console...</span>
                </div>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="min-h-screen bg-[#FFFDF5] p-6 flex flex-col items-center justify-center">
                <div className="neo-card max-w-md p-6 text-center">
                    <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
                    <h2 className="text-lg font-black text-black">Unable to Access Ticket</h2>
                    <p className="text-xs text-gray-600 my-2">{error || 'Ticket not found or permission denied.'}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="neo-btn bg-[#FFD93D] text-black text-xs px-4 py-2 mt-2"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const isBreached = ticket.slaBreached || (ticket.status !== 'Resolved' && ticket.status !== 'Awaiting-Student-Reply' && new Date() > new Date(ticket.slaDeadline));

    return (
        <div className="min-h-[calc(100vh-4.5rem)] bg-[#FFFDF5] p-4 sm:p-6 lg:p-8">
            {/* Top Navigation */}
            <div className="max-w-7xl mx-auto mb-5 flex items-center justify-between">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="neo-btn bg-white hover:bg-gray-100 text-black text-xs px-3 py-1.5"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Issues</span>
                </button>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-gray-500 uppercase">Ticket ID:</span>
                    <span className="font-mono text-xs font-black bg-black text-[#FFD93D] px-2 py-0.5 rounded">
                        #{ticket._id.slice(-6).toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Split-Screen Container */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* ========================================================
                    LEFT PANEL: Static Ticket Meta, SLA Countdown & Actions
                   ======================================================== */}
                <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-5">
                    
                    {/* Main Meta Card */}
                    <div className={`neo-card p-6 ${isBreached ? 'animate-breach-pulse' : ''}`}>
                        
                        {/* Badges Bar */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="inline-flex items-center gap-1 text-xs font-black uppercase px-2.5 py-1 bg-black text-white rounded">
                                {ticket.category}
                            </span>
                            <SLACountdown ticket={ticket} />
                        </div>

                        {/* Title */}
                        <h1 className="text-xl sm:text-2xl font-black text-black leading-tight mb-3">
                            {ticket.title}
                        </h1>

                        {/* Description Box */}
                        <div className="bg-[#F8FAFC] border-2 border-black rounded-lg p-3.5 mb-4 text-sm text-gray-800 leading-relaxed font-sans">
                            {ticket.description}
                        </div>

                        {/* Attachments / Evidence Section */}
                        {ticket.attachments && ticket.attachments.length > 0 && (
                            <div className="mb-4">
                                <span className="font-mono text-xs font-black uppercase text-black mb-2 flex items-center gap-1.5">
                                    <Paperclip className="w-3.5 h-3.5 text-black" />
                                    <span>Attached Evidence & Documents ({ticket.attachments.length})</span>
                                </span>
                                <AttachmentViewer attachments={ticket.attachments} />
                            </div>
                        )}

                        {/* Student & Location Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#FFFDF5] border-2 border-dashed border-black rounded-lg text-xs mb-5">
                            <div className="flex items-start gap-2">
                                <User className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                                <div>
                                    <span className="block font-bold text-gray-500 text-[10px] uppercase">Submitted By:</span>
                                    <span className="font-extrabold text-black">{ticket.studentId?.fullname}</span>
                                    <span className="block text-gray-500 text-[11px] font-mono">{ticket.studentId?.email}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                                <div>
                                    <span className="block font-bold text-gray-500 text-[10px] uppercase">Hostel Location:</span>
                                    <span className="font-bold text-black">{ticket.locationSnapshot || ticket.studentId?.location}</span>
                                </div>
                            </div>
                        </div>

                        {/* SLA Status Notification Banners */}
                        {ticket.status === 'Awaiting-Student-Reply' && (
                            <div className="mb-4 p-3 bg-[#FEF3C7] border-2 border-black rounded-lg text-xs text-[#92400E] flex items-center gap-2">
                                <PauseCircle className="w-5 h-5 text-[#D97706] shrink-0 animate-pulse" />
                                <div>
                                    <strong className="block uppercase font-black">SLA Clock Paused</strong>
                                    Resolution timer is frozen while waiting for the student's clarification.
                                </div>
                            </div>
                        )}

                        {isBreached && (
                            <div className="mb-4 p-3 bg-red-100 border-2 border-red-600 rounded-lg text-xs text-red-900 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                                <div>
                                    <strong className="block uppercase font-black">SLA Breached</strong>
                                    Issue unresolved past deadline. Automatically escalated and alerted to Warden.
                                </div>
                            </div>
                        )}

                        {/* Staff Action Controls: Status, Assignee, Priority */}
                        {isStaff && (
                            <div className="pt-4 border-t-2 border-black flex flex-col gap-3">
                                <span className="font-mono text-xs font-black uppercase text-gray-700 tracking-wider">
                                    Staff Management Controls
                                </span>

                                {/* Status Switcher */}
                                <div>
                                    <label className="block text-[11px] font-bold text-black uppercase mb-1">
                                        Update Issue Status
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                        {['Open', 'Assigned', 'Awaiting-Student-Reply', 'Resolved'].map((st) => (
                                            <button
                                                key={st}
                                                type="button"
                                                disabled={statusUpdating}
                                                onClick={() => handleStatusChange(st)}
                                                className={`px-2 py-1.5 text-[11px] font-bold rounded border border-black cursor-pointer transition-colors ${
                                                    ticket.status === st
                                                        ? 'bg-black text-[#FFD93D]'
                                                        : 'bg-white text-gray-800 hover:bg-gray-100'
                                                }`}
                                            >
                                                {st === 'Awaiting-Student-Reply' ? 'Awaiting Reply' : st}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Assign Technician */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-[11px] font-bold text-black uppercase">
                                            Assign Technician / Staff
                                        </label>
                                        <span className="text-[10px] font-mono font-bold bg-[#FFD93D] text-black px-1.5 py-0.5 border border-black rounded">
                                            {ticket.hostel || (ticket.locationSnapshot?.includes('Velankani') ? 'Velankani Hostel' : 'Neeladri Hostel')}
                                        </span>
                                    </div>
                                    <select
                                        disabled={assigning}
                                        value={ticket.assignedTo?._id || ticket.assignedTo || ''}
                                        onChange={handleAssignChange}
                                        className="w-full px-3 py-2 text-xs border-2 border-black rounded bg-white font-medium focus:outline-none"
                                    >
                                        <option value="">-- Unassigned --</option>
                                        {staffList
                                            .filter((member) => {
                                                const ticketHostel = ticket.hostel || (ticket.locationSnapshot?.includes('Velankani') ? 'Velankani Hostel' : 'Neeladri Hostel');
                                                const memberHostel = member.hostel || (member.location?.includes('Velankani') ? 'Velankani Hostel' : 'Neeladri Hostel');
                                                return memberHostel === ticketHostel;
                                            })
                                            .map((member) => (
                                                <option key={member._id} value={member._id}>
                                                    {member.fullname} ({member.role}{member.role === 'Technician' && member.specialization ? ` • ${member.specialization}` : ''})
                                                </option>
                                            ))}
                                    </select>
                                    <p className="text-[10px] text-gray-500 font-mono mt-1">
                                        Hostel Isolation: Only showing staff assigned to {ticket.hostel || (ticket.locationSnapshot?.includes('Velankani') ? 'Velankani Hostel' : 'Neeladri Hostel')}.
                                    </p>
                                </div>

                                {/* Warden SLA Resolution Time Override */}
                                {user?.role === 'Warden' && (
                                    <div className="pt-3 border-t-2 border-dashed border-black/20">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-[11px] font-bold text-black uppercase flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-black" />
                                                <span>Set SLA Resolution Time</span>
                                            </label>
                                            <span className="text-[10px] font-mono font-bold bg-black text-[#FFD93D] px-1.5 py-0.5 rounded">
                                                Warden Control
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-mono mb-2">
                                            Select a target resolution window. Live countdown & breach detection reflect instantly.
                                        </p>

                                        {/* Quick Presets with Active State Indicator */}
                                        <div className="grid grid-cols-4 gap-1.5 mb-2">
                                            {[4, 12, 24, 48].map((h) => {
                                                const isSelected = activePreset === h;
                                                const isLoadingThis = updatingDeadline && activeButton === h;

                                                return (
                                                    <button
                                                        key={h}
                                                        type="button"
                                                        disabled={updatingDeadline}
                                                        onClick={() => handleSetDeadline({ hours: h })}
                                                        className={`py-1.5 px-2 text-[11px] font-bold rounded border-2 border-black text-center cursor-pointer transition-all flex items-center justify-center gap-1 ${
                                                            isSelected
                                                                ? 'bg-black text-[#FFD93D] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                                                : 'bg-white text-gray-800 hover:bg-gray-100 hover:border-black active:translate-y-0.5'
                                                        }`}
                                                        title={`Set resolution deadline to ${h} hours from now`}
                                                    >
                                                        {isLoadingThis ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFD93D]" />
                                                        ) : isSelected ? (
                                                            <>
                                                                <CheckCircle className="w-3.5 h-3.5 text-[#FFD93D]" />
                                                                <span>{h}h</span>
                                                            </>
                                                        ) : (
                                                            <span>+{h}h</span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Selected Window Confirmation Banner */}
                                        <div className="flex items-center justify-between p-2 mb-2 bg-[#FFFDF5] border border-black rounded text-[11px] font-mono">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="font-extrabold text-black">
                                                    {activePreset && typeof activePreset === 'number'
                                                        ? `${activePreset}h Window Selected`
                                                        : activePreset === 'custom'
                                                        ? 'Custom Window Selected'
                                                        : 'SLA Target Window'}
                                                </span>
                                            </div>
                                            {ticket.slaDeadline && (
                                                <span className="text-gray-600 font-semibold text-[10px]">
                                                    Due: {new Date(ticket.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                                                    {new Date(ticket.slaDeadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>
                                            )}
                                        </div>

                                        {/* Custom Hours Input */}
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <input
                                                type="number"
                                                min="0.5"
                                                step="0.5"
                                                placeholder="Custom hours (e.g. 6)"
                                                value={customHours}
                                                onChange={(e) => setCustomHours(e.target.value)}
                                                className="flex-1 px-2.5 py-1.5 text-xs border border-black rounded bg-white font-medium focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                disabled={updatingDeadline || !customHours}
                                                onClick={() => handleSetDeadline({ hours: Number(customHours) })}
                                                className="neo-btn bg-black text-[#FFD93D] text-[11px] px-3 py-1.5 font-bold whitespace-nowrap flex items-center gap-1"
                                            >
                                                {updatingDeadline && activeButton === 'custom' ? (
                                                    <>
                                                        <Loader2 className="w-3 h-3 animate-spin text-[#FFD93D]" />
                                                        <span>Updating...</span>
                                                    </>
                                                ) : (
                                                    <span>Set Hours</span>
                                                )}
                                            </button>
                                        </div>

                                        {/* Exact Date/Time Picker */}
                                        <div className="mt-1">
                                            {!showCustomDate ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCustomDate(true)}
                                                    className="text-[10px] font-mono text-gray-600 underline hover:text-black cursor-pointer"
                                                >
                                                    Or pick exact date & time...
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-1.5 mt-1.5">
                                                    <input
                                                        type="datetime-local"
                                                        value={customDate}
                                                        onChange={(e) => setCustomDate(e.target.value)}
                                                        className="flex-1 px-2 py-1 text-xs border border-black rounded bg-white font-medium focus:outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        disabled={updatingDeadline || !customDate}
                                                        onClick={() => handleSetDeadline({ date: new Date(customDate).toISOString() })}
                                                        className="neo-btn bg-black text-[#FFD93D] text-[11px] px-2.5 py-1 font-bold whitespace-nowrap"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCustomDate(false)}
                                                        className="text-xs px-2 py-1 text-gray-500 hover:text-black cursor-pointer"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Escalation History Log (if any escalations happened) */}
                    {ticket.escalationHistory && ticket.escalationHistory.length > 0 && (
                        <div className="neo-card p-4 bg-[#FFF8E7]">
                            <h4 className="font-mono text-xs font-black uppercase text-black mb-2 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                <span>SLA Escalation Audit Log</span>
                            </h4>
                            <div className="flex flex-col gap-2">
                                {ticket.escalationHistory.map((entry, idx) => (
                                    <div key={idx} className="p-2 bg-white border border-black rounded text-[11px]">
                                        <div className="flex items-center justify-between font-mono font-bold text-gray-600 mb-0.5">
                                            <span>{new Date(entry.escalatedAt).toLocaleTimeString()}</span>
                                            <span className="text-red-600">{entry.oldPriority} → {entry.newPriority}</span>
                                        </div>
                                        <p className="text-gray-800 font-medium">{entry.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ========================================================
                    RIGHT PANEL: Real-Time WebSocket Comment Engine
                   ======================================================== */}
                <div className="lg:col-span-6 xl:col-span-7">
                    <div className="neo-card flex flex-col h-[700px] overflow-hidden">
                        
                        {/* Chat Header */}
                        <div className="p-4 bg-white border-b-2 border-black flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-[#FFD93D] border border-black rounded">
                                    <MessageSquare className="w-4 h-4 text-black" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-black">
                                        Issue Discussion Thread
                                    </h3>
                                    <p className="text-[10px] font-mono text-gray-500">
                                        Live bidirectional WebSocket channel (ticket:{ticket._id.slice(-6)})
                                    </p>
                                </div>
                            </div>

                            <span className="font-mono text-xs font-bold bg-gray-100 px-2 py-0.5 border border-black rounded">
                                {comments.length} message{comments.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {/* Messages Stream */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF9F5]">
                            {comments.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                                    <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                                    <p className="font-bold text-xs uppercase">No comments yet</p>
                                    <p className="text-[11px] text-gray-500 mt-1 max-w-xs">
                                        Ask a question or post an update to begin live resolution.
                                    </p>
                                </div>
                            ) : (
                                comments.map((comment) => {
                                    const isSenderMe = comment.senderId?._id === user?._id;
                                    const isInternalNote = comment.isInternal;

                                    return (
                                        <div
                                            key={comment._id}
                                            className={`flex flex-col ${isSenderMe ? 'items-end' : 'items-start'}`}
                                        >
                                            {/* Sender Info Bar */}
                                            <div className="flex items-center gap-1.5 mb-1 px-1">
                                                <span className="font-extrabold text-[11px] text-black">
                                                    {comment.senderId?.fullname || 'User'}
                                                </span>
                                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 border rounded ${
                                                    comment.senderId?.role === 'Warden' ? 'bg-[#FF5252] text-white border-black' :
                                                    comment.senderId?.role === 'Technician' ? 'bg-[#38E54D] text-black border-black' :
                                                    'bg-[#FFD93D] text-black border-black'
                                                }`}>
                                                    {comment.senderId?.role || 'User'}
                                                </span>
                                                <span className="text-[10px] font-mono text-gray-400">
                                                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            {/* Message Bubble */}
                                            <div
                                                className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed border-2 border-black ${
                                                    isInternalNote
                                                        ? 'staff-note-stripe border-amber-600 text-amber-950 neo-shadow-sm'
                                                        : isSenderMe
                                                        ? 'bg-[#FFD93D] text-black neo-shadow-sm'
                                                        : 'bg-white text-black neo-shadow-sm'
                                                }`}
                                            >
                                                {isInternalNote && (
                                                    <div className="flex items-center gap-1 text-[10px] font-mono font-black text-amber-800 uppercase mb-1 pb-1 border-b border-amber-400/50">
                                                        <Lock className="w-3 h-3" />
                                                        <span>Internal Staff Note (Hidden from Student)</span>
                                                    </div>
                                                )}
                                                <p className="whitespace-pre-wrap font-sans font-medium">
                                                    {comment.message}
                                                </p>

                                                {/* Comment Attachments */}
                                                {comment.attachments && comment.attachments.length > 0 && (
                                                    <div className="mt-2 pt-2 border-t border-black/15">
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
                            className="p-3 bg-white border-t-2 border-black flex flex-col gap-2"
                        >
                            {/* Staff Only Internal Note Toggle */}
                            {isStaff && (
                                <div className="flex items-center justify-between bg-amber-50 px-2.5 py-1.5 border border-amber-300 rounded text-xs">
                                    <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900 select-none">
                                        <input
                                            type="checkbox"
                                            checked={isInternal}
                                            onChange={(e) => setIsInternal(e.target.checked)}
                                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                                        />
                                        <span className="flex items-center gap-1">
                                            {isInternal ? <Lock className="w-3.5 h-3.5 text-amber-700" /> : <Unlock className="w-3.5 h-3.5 text-gray-500" />}
                                            <span>Post as Internal Staff Note</span>
                                        </span>
                                    </label>
                                    <span className="text-[10px] font-mono text-amber-700 font-medium">
                                        {isInternal ? 'Students will NOT see this note' : 'Visible to everyone'}
                                    </span>
                                </div>
                            )}

                            {/* Preview Selected Comment Attachments */}
                            {commentAttachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 p-1.5 bg-gray-50 border border-black/20 rounded">
                                    {commentAttachments.map((att, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5 bg-white border border-black rounded px-2 py-0.5 text-[11px] neo-shadow-sm">
                                            {att.fileType?.includes('pdf') || att.filename?.endsWith('.pdf') ? (
                                                <FileText className="w-3.5 h-3.5 text-red-600" />
                                            ) : (
                                                <img src={att.url} alt="" className="w-4 h-4 object-cover rounded border" />
                                            )}
                                            <span className="font-bold truncate max-w-[120px]">{att.filename}</span>
                                            <button
                                                type="button"
                                                onClick={() => setCommentAttachments((prev) => prev.filter((_, i) => i !== idx))}
                                                className="text-gray-500 hover:text-black cursor-pointer"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                {/* Hidden File Input */}
                                <input
                                    type="file"
                                    ref={commentFileInputRef}
                                    className="hidden"
                                    accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                                    onChange={handleCommentFileUpload}
                                />

                                {/* File Attachment Trigger Button */}
                                <button
                                    type="button"
                                    onClick={() => commentFileInputRef.current?.click()}
                                    disabled={uploadingAttachment}
                                    title="Attach image or PDF document"
                                    className="neo-btn bg-white hover:bg-gray-100 text-black p-2 border-2 border-black"
                                >
                                    {uploadingAttachment ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                                    ) : (
                                        <Paperclip className="w-4 h-4 text-black" />
                                    )}
                                </button>

                                <input
                                    type="text"
                                    placeholder={isInternal ? "Write internal staff note..." : "Type reply to student or technician (Enter to send)..."}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className={`flex-1 px-3 py-2 text-xs border-2 border-black rounded focus:outline-none focus:ring-2 ${
                                        isInternal ? 'bg-amber-50/50 focus:ring-amber-400' : 'bg-white focus:ring-[#FFD93D]'
                                    }`}
                                />
                                <button
                                    type="submit"
                                    disabled={submittingComment || (!message.trim() && commentAttachments.length === 0)}
                                    className={`neo-btn text-xs px-4 py-2 font-black uppercase ${
                                        isInternal ? 'bg-amber-400 text-black' : 'bg-[#FFD93D] text-black'
                                    }`}
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
