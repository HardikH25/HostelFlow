import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { axiosInstance } from "../axiosCalls/axios";
import TicketMeta from "../components/TicketMeta";
import TicketControls from "../components/TicketControls";
import CommentThread from "../components/CommentThread";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";

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

    const isStaff = user?.role === "Warden" || user?.role === "Technician";

    // Fetch ticket details, comments, and staff list
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
    }, [ticketId, user?.role]);

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
                        className="px-4 py-2 mt-2 rounded-full bg-[#f2f2f2] text-[#0a0a0a] hover:bg-white text-xs font-medium cursor-pointer"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-[#050505] p-4 sm:p-6 lg:p-8 text-[#f2f2f2] font-sans">
            {/* Top Navigation Bar */}
            <div className="max-w-[1360px] mx-auto mb-6 flex items-center justify-between">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="px-4 py-2 rounded-full bg-[#0e0e0e] border border-[#222222] hover:border-[#303030] text-[#a6a9ad] hover:text-[#f2f2f2] text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
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
                {/* LEFT PANEL: Meta & Warden/Technician Controls */}
                <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-5">
                    <TicketMeta ticket={ticket} />
                    <TicketControls
                        ticket={ticket}
                        user={user}
                        staffList={staffList}
                        onTicketUpdated={setTicket}
                    />
                </div>

                {/* RIGHT PANEL: Live Discussion Thread */}
                <div className="lg:col-span-6 xl:col-span-7">
                    <CommentThread
                        ticketId={ticketId}
                        comments={comments}
                        user={user}
                        isStaff={isStaff}
                    />
                </div>
            </div>
        </div>
    );
};

export default TicketDetails;
