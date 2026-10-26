import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { axiosInstance } from "../axiosCalls/axios";
import KanbanBoard from "../components/KanbanBoard";
import TicketCard from "../components/TicketCard";
import CreateTicketModal from "../components/CreateTicketModal";
import AddStaffModal from "../components/AddStaffModal";
import {
    PlusCircle,
    LayoutGrid,
    Kanban,
    RefreshCw,
    Clock,
    CheckCircle2,
    Search,
    UserPlus,
    AlertCircle,
    Inbox
} from "lucide-react";

const Dashboard = () => {
    const { user } = useAuth();
    const { socket } = useSocket();

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("kanban"); // "kanban" or "grid"
    const [filterCategory, setFilterCategory] = useState("All");
    const [filterPriority, setFilterPriority] = useState("All");
    const [filterHostel, setFilterHostel] = useState("All");
    const [filterStatus, setFilterStatus] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

    const isStaff = user?.role === "Warden" || user?.role === "Technician";
    const isWarden = user?.role === "Warden";

    const fetchTickets = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get("/tickets");
            if (res.data?.success) {
                setTickets(res.data.tickets || []);
            }
        } catch (err) {
            console.error("Failed to load tickets:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    // Live WebSocket updates
    useEffect(() => {
        if (!socket) return;

        const handleTicketCreated = (newTicket) => {
            setTickets((prev) => {
                if (prev.some((t) => t._id === newTicket._id)) return prev;
                // If technician, only add if assigned to them
                if (user?.role === "Technician") {
                    const isAssigned = newTicket.assignedTo?._id === user._id || newTicket.assignedTo === user._id;
                    if (!isAssigned) return prev;
                }
                return [newTicket, ...prev];
            });
        };

        const handleTicketUpdated = (updatedTicket) => {
            setTickets((prev) => {
                // If technician, remove if unassigned from them
                if (user?.role === "Technician") {
                    const isAssigned = updatedTicket.assignedTo?._id === user._id || updatedTicket.assignedTo === user._id;
                    if (!isAssigned) {
                        return prev.filter((t) => t._id !== updatedTicket._id);
                    }
                }
                const exists = prev.some((t) => t._id === updatedTicket._id);
                if (exists) {
                    return prev.map((t) => (t._id === updatedTicket._id ? updatedTicket : t));
                }
                return [updatedTicket, ...prev];
            });
        };

        socket.on("ticket:created", handleTicketCreated);
        socket.on("ticket:updated", handleTicketUpdated);

        return () => {
            socket.off("ticket:created", handleTicketCreated);
            socket.off("ticket:updated", handleTicketUpdated);
        };
    }, [socket, user?._id, user?.role]);

    // Handle Kanban Drag & Drop Status Change (Warden only)
    const handleStatusUpdate = async (ticketId, newStatus) => {
        if (!isWarden) return;
        try {
            const res = await axiosInstance.put(`/tickets/${ticketId}/status`, { status: newStatus });
            if (res.data?.success) {
                setTickets((prev) =>
                    prev.map((t) => (t._id === ticketId ? res.data.ticket : t))
                );
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update issue status.");
            fetchTickets();
        }
    };

    // Filter Logic
    const filteredTickets = tickets.filter((ticket) => {
        const ticketHostel = ticket.hostel || "Neeladri Hostel";
        const matchesHostel = filterHostel === "All" || ticketHostel === filterHostel;
        const matchesCategory = filterCategory === "All" || ticket.category === filterCategory;
        const matchesPriority = filterPriority === "All" || ticket.priority === filterPriority;
        const matchesStatus = filterStatus === "All" || ticket.status === filterStatus;
        const matchesSearch =
            searchQuery.trim() === "" ||
            ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ticket.locationSnapshot && ticket.locationSnapshot.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesHostel && matchesCategory && matchesPriority && matchesStatus && matchesSearch;
    });

    // Compute Metrics
    const totalCount = tickets.length;
    const overdueCount = tickets.filter(
        (t) => t.slaBreached || (t.status !== "Resolved" && t.status !== "Awaiting-Student-Reply" && new Date() > new Date(t.slaDeadline))
    ).length;
    const resolvedCount = tickets.filter((t) => t.status === "Resolved").length;
    const awaitingReplyCount = tickets.filter((t) => t.status === "Awaiting-Student-Reply").length;
    const activeCount = tickets.filter((t) => t.status === "Open" || t.status === "Assigned").length;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-[#050505] p-4 sm:p-6 lg:p-8 text-[#f2f2f2]">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
                
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#222222]">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-mono text-[10px] text-[#3fd6c6] bg-[#0e0e0e] border border-[#222222] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                {user?.role} Portal
                            </span>
                            <span className="text-xs text-[#717478]">
                                {user?.location}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-medium text-[#f2f2f2] tracking-tight">
                            Campus Maintenance Operations
                        </h1>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={fetchTickets}
                            title="Refresh issue queue"
                            className="neo-btn bg-[#0e0e0e] text-[#a6a9ad] hover:text-[#f2f2f2] border border-[#222222] hover:border-[#303030] px-3.5 py-1.5 text-xs rounded-full"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                            <span>Sync</span>
                        </button>

                        {/* Student Action: Report Issue */}
                        {user?.role === "Student" && (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="neo-btn bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] text-xs px-4 py-1.5 rounded-full font-medium flex items-center gap-1.5 shadow-sm"
                            >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>Report Maintenance Issue</span>
                            </button>
                        )}

                        {/* Warden Action: Onboard Staff */}
                        {user?.role === "Warden" && (
                            <button
                                onClick={() => setIsAddStaffOpen(true)}
                                className="neo-btn bg-[#0e0e0e] hover:bg-[#141414] text-[#f2f2f2] border border-[#222222] hover:border-[#303030] text-xs px-4 py-1.5 rounded-full font-medium flex items-center gap-1.5"
                            >
                                <UserPlus className="w-3.5 h-3.5 text-[#3fd6c6]" />
                                <span>Onboard Staff</span>
                            </button>
                        )}

                        {/* Staff Action: View Mode Toggle */}
                        {isStaff && (
                            <div className="flex items-center bg-[#0e0e0e] p-0.5 border border-[#222222] rounded-full">
                                <button
                                    onClick={() => setViewMode("kanban")}
                                    className={`px-3 py-1 text-xs rounded-full flex items-center gap-1.5 transition-colors ${
                                        viewMode === "kanban" ? "bg-[#f2f2f2] text-[#0a0a0a] font-medium" : "text-[#717478] hover:text-[#f2f2f2]"
                                    }`}
                                >
                                    <Kanban className="w-3 h-3" />
                                    <span>Board</span>
                                </button>
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`px-3 py-1 text-xs rounded-full flex items-center gap-1.5 transition-colors ${
                                        viewMode === "grid" ? "bg-[#f2f2f2] text-[#0a0a0a] font-medium" : "text-[#717478] hover:text-[#f2f2f2]"
                                    }`}
                                >
                                    <LayoutGrid className="w-3 h-3" />
                                    <span>Grid</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Metrics Summary Strip (Minimalist Graphite Panels) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="dp-panel p-4 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-mono text-[#717478] uppercase tracking-wider block mb-1">Active Queue</span>
                            <span className="text-2xl font-light text-[#f2f2f2]">{activeCount}</span>
                        </div>
                        <div className="p-2 bg-[#141414] border border-[#222222] rounded-full text-[#a6a9ad]">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>

                    <div className={`dp-panel p-4 flex items-center justify-between ${overdueCount > 0 ? "border-red-950/80 bg-red-950/10" : ""}`}>
                        <div>
                            <span className={`text-[10px] font-mono uppercase tracking-wider block mb-1 ${overdueCount > 0 ? "text-red-400" : "text-[#717478]"}`}>
                                Target Overdue
                            </span>
                            <span className={`text-2xl font-light ${overdueCount > 0 ? "text-red-300" : "text-[#f2f2f2]"}`}>
                                {overdueCount}
                            </span>
                        </div>
                        <div className={`p-2 rounded-full border ${overdueCount > 0 ? "bg-red-950/40 border-red-900/60 text-red-400" : "bg-[#141414] border-[#222222] text-[#717478]"}`}>
                            <AlertCircle className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="dp-panel p-4 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-mono text-[#717478] uppercase tracking-wider block mb-1">Awaiting Reply</span>
                            <span className="text-2xl font-light text-[#f2f2f2]">{awaitingReplyCount}</span>
                        </div>
                        <div className="p-2 bg-[#141414] border border-[#222222] rounded-full text-amber-400/80">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="dp-panel p-4 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-mono text-[#717478] uppercase tracking-wider block mb-1">Resolved</span>
                            <span className="text-2xl font-light text-[#f2f2f2]">{resolvedCount}</span>
                        </div>
                        <div className="p-2 bg-[#141414] border border-[#222222] rounded-full text-emerald-400/80">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="dp-panel p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-[#55585d] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by issue title, location, room..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#050505] border border-[#222222] focus:border-[#303030] text-[#f2f2f2] text-xs pl-8 pr-3 py-1.5 rounded-full focus:outline-none placeholder-[#55585d]"
                        />
                    </div>

                    {/* Filter Selects */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Hostel Scope (Warden View) */}
                        {isWarden && (
                            <select
                                value={filterHostel}
                                onChange={(e) => setFilterHostel(e.target.value)}
                                className="bg-[#050505] border border-[#222222] focus:border-[#303030] text-[#a6a9ad] text-xs px-2.5 py-1.5 rounded-full focus:outline-none"
                            >
                                <option value="All">All Hostels</option>
                                <option value="Neeladri Hostel">Neeladri Hostel</option>
                                <option value="Velankani Hostel">Velankani Hostel</option>
                            </select>
                        )}

                        {/* Category Filter */}
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="bg-[#050505] border border-[#222222] focus:border-[#303030] text-[#a6a9ad] text-xs px-2.5 py-1.5 rounded-full focus:outline-none"
                        >
                            <option value="All">All Categories</option>
                            <option value="Plumbing">Plumbing</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Housekeeping">Housekeeping</option>
                            <option value="IT">IT & Internet</option>
                        </select>

                        {/* Priority Filter */}
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="bg-[#050505] border border-[#222222] focus:border-[#303030] text-[#a6a9ad] text-xs px-2.5 py-1.5 rounded-full focus:outline-none"
                        >
                            <option value="All">All Priorities</option>
                            <option value="Critical">Critical</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                </div>

                {/* View Switch: Kanban or Grid */}
                {viewMode === "kanban" && isStaff ? (
                    <KanbanBoard
                        tickets={filteredTickets}
                        onStatusChange={handleStatusUpdate}
                        isWarden={isWarden}
                    />
                ) : (
                    <div>
                        {/* Status Pills Filter */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-[#1a1a1a]">
                            {["All", "Open", "Assigned", "Awaiting-Student-Reply", "Resolved"].map((st) => {
                                const count = st === "All" ? tickets.length : tickets.filter((t) => t.status === st).length;
                                const isSelected = filterStatus === st;
                                const label = st === "Awaiting-Student-Reply" ? "Awaiting Reply" : st;

                                return (
                                    <button
                                        key={st}
                                        onClick={() => setFilterStatus(st)}
                                        className={`px-3 py-1 rounded-full text-xs font-mono flex items-center gap-1.5 transition-colors ${
                                            isSelected
                                                ? "bg-[#f2f2f2] text-[#0a0a0a] font-medium"
                                                : "bg-[#0e0e0e] text-[#717478] hover:text-[#f2f2f2] border border-[#222222]"
                                        }`}
                                    >
                                        <span>{label}</span>
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-black/10 text-black font-bold" : "bg-[#141414] text-[#a6a9ad]"}`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tickets Grid */}
                        {filteredTickets.length === 0 ? (
                            <div className="dp-panel p-12 text-center flex flex-col items-center justify-center gap-2">
                                <Inbox className="w-8 h-8 text-[#55585d]" />
                                <h3 className="font-medium text-sm text-[#f2f2f2]">No maintenance issues found</h3>
                                <p className="text-xs text-[#717478]">
                                    {searchQuery || filterCategory !== "All" || filterPriority !== "All"
                                        ? "Try adjusting your search criteria or filters."
                                        : "All campus issues have been addressed."}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                {filteredTickets.map((ticket) => (
                                    <TicketCard key={ticket._id} ticket={ticket} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateTicketModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onTicketCreated={(newTicket) => setTickets((prev) => [newTicket, ...prev])}
            />

            <AddStaffModal
                isOpen={isAddStaffOpen}
                onClose={() => setIsAddStaffOpen(false)}
            />
        </div>
    );
};

export default Dashboard;
