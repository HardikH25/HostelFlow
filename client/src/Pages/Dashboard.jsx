import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { axiosInstance } from '../axiosCalls/axios';
import KanbanBoard from '../components/KanbanBoard';
import TicketCard from '../components/TicketCard';
import CreateTicketModal from '../components/CreateTicketModal';
import AddStaffModal from '../components/AddStaffModal';
import {
    PlusCircle,
    LayoutGrid,
    Kanban,
    RefreshCw,
    AlertOctagon,
    Clock,
    CheckCircle2,
    Shield,
    Filter,
    Search,
    UserPlus,
    Building2
} from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const { socket } = useSocket();

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'grid'
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterPriority, setFilterPriority] = useState('All');
    const [filterHostel, setFilterHostel] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

    const isStaff = user?.role === 'Warden' || user?.role === 'Technician';

    const fetchTickets = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/tickets');
            if (res.data?.success) {
                setTickets(res.data.tickets || []);
            }
        } catch (err) {
            console.error('Failed to load tickets:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    // Real-time WebSocket updates: tickets created or updated
    useEffect(() => {
        if (!socket) return;

        const handleTicketCreated = (newTicket) => {
            setTickets((prev) => [newTicket, ...prev.filter((t) => t._id !== newTicket._id)]);
        };

        const handleTicketUpdated = (updatedTicket) => {
            setTickets((prev) =>
                prev.map((t) => (t._id === updatedTicket._id ? updatedTicket : t))
            );
        };

        const handleTicketDeleted = ({ ticketId }) => {
            setTickets((prev) => prev.filter((t) => t._id !== ticketId));
        };

        socket.on('ticket:created', handleTicketCreated);
        socket.on('ticket:updated', handleTicketUpdated);
        socket.on('ticket:deleted', handleTicketDeleted);

        return () => {
            socket.off('ticket:created', handleTicketCreated);
            socket.off('ticket:updated', handleTicketUpdated);
            socket.off('ticket:deleted', handleTicketDeleted);
        };
    }, [socket]);

    // Handle drag-and-drop status update in Kanban
    const handleStatusChange = async (ticketId, newStatus) => {
        try {
            await axiosInstance.put(`/tickets/${ticketId}/status`, { status: newStatus });
        } catch (err) {
            console.error('Failed to update status:', err);
            fetchTickets(); // rollback if error
        }
    };

    // Filter tickets
    const filteredTickets = tickets.filter((ticket) => {
        const ticketHostel = ticket.hostel || (ticket.locationSnapshot?.includes('Velankani') ? 'Velankani Hostel' : 'Neeladri Hostel');
        const matchesHostel = filterHostel === 'All' || ticketHostel === filterHostel;
        const matchesCategory = filterCategory === 'All' || ticket.category === filterCategory;
        const matchesPriority = filterPriority === 'All' || ticket.priority === filterPriority;
        const matchesSearch =
            searchQuery.trim() === '' ||
            ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ticket.locationSnapshot && ticket.locationSnapshot.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesHostel && matchesCategory && matchesPriority && matchesSearch;
    });

    // Compute Metrics
    const totalCount = tickets.length;
    const breachedCount = tickets.filter(
        (t) => t.slaBreached || (t.status !== 'Resolved' && t.status !== 'Awaiting-Student-Reply' && new Date() > new Date(t.slaDeadline))
    ).length;
    const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;
    const awaitingReplyCount = tickets.filter((t) => t.status === 'Awaiting-Student-Reply').length;
    const activeCount = tickets.filter((t) => t.status === 'Open' || t.status === 'Assigned').length;

    return (
        <div className="min-h-[calc(100vh-4.5rem)] bg-[#FFFDF5] p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
                
                {/* Dashboard Top Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-3 border-black">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-black bg-black text-[#FFD93D] px-2 py-0.5 rounded uppercase">
                                {user?.role} Portal
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                                {user?.location}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                            Hostel Issue Operations Hub
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchTickets}
                            title="Refresh ticket queue"
                            className="neo-btn bg-white hover:bg-gray-100 text-black text-xs px-3 py-2"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            <span className="font-bold">Sync</span>
                        </button>

                        {/* Student Action: Raise Ticket */}
                        {user?.role === 'Student' && (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="neo-btn bg-[#FFD93D] text-black text-xs px-4 py-2 font-black uppercase flex items-center gap-1.5"
                            >
                                <PlusCircle className="w-4 h-4" />
                                <span>Report Hostel Issue</span>
                            </button>
                        )}

                        {/* Warden Action: Onboard Staff */}
                        {user?.role === 'Warden' && (
                            <button
                                onClick={() => setIsAddStaffOpen(true)}
                                className="neo-btn bg-[#FF5252] text-white text-xs px-3 py-2 font-black uppercase flex items-center gap-1.5"
                                title="Onboard new Technician or Assistant Warden"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>Onboard Staff</span>
                            </button>
                        )}

                        {/* Staff Action: View Mode Toggle */}
                        {isStaff && (
                            <div className="flex items-center bg-gray-200 p-1 border-2 border-black rounded neo-shadow-sm">
                                <button
                                    onClick={() => setViewMode('kanban')}
                                    className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-colors ${
                                        viewMode === 'kanban' ? 'bg-black text-[#FFD93D]' : 'text-gray-700 hover:text-black'
                                    }`}
                                >
                                    <Kanban className="w-3.5 h-3.5" />
                                    <span>Kanban</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-colors ${
                                        viewMode === 'grid' ? 'bg-black text-[#FFD93D]' : 'text-gray-700 hover:text-black'
                                    }`}
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                    <span>Grid</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Metrics Summary Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="neo-card p-4 flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-mono font-bold text-gray-500 uppercase block">Active Queue</span>
                            <span className="text-2xl font-black text-black">{activeCount}</span>
                        </div>
                        <div className="p-2.5 bg-blue-100 text-blue-800 border-2 border-black rounded">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="neo-card p-4 flex items-center justify-between border-2 border-red-500 bg-red-50/40">
                        <div>
                            <span className="text-[11px] font-mono font-bold text-red-600 uppercase block">SLA Breached</span>
                            <span className="text-2xl font-black text-red-600">{breachedCount}</span>
                        </div>
                        <div className="p-2.5 bg-red-100 text-red-700 border-2 border-red-600 rounded animate-pulse">
                            <AlertOctagon className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="neo-card p-4 flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-mono font-bold text-amber-700 uppercase block">SLA Paused</span>
                            <span className="text-2xl font-black text-amber-700">{awaitingReplyCount}</span>
                        </div>
                        <div className="p-2.5 bg-amber-100 text-amber-800 border-2 border-black rounded">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="neo-card p-4 flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-mono font-bold text-emerald-700 uppercase block">Resolved</span>
                            <span className="text-2xl font-black text-emerald-700">{resolvedCount}</span>
                        </div>
                        <div className="p-2.5 bg-emerald-100 text-emerald-800 border-2 border-black rounded">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Filters and Search Bar */}
                <div className="neo-card p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 bg-white">
                    {/* Search Input */}
                    <div className="relative w-full md:w-80">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Search title, room, or issue..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 text-xs border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                        />
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {isStaff && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-mono font-bold text-gray-500 uppercase flex items-center gap-1">
                                    <Building2 className="w-3 h-3" /> Hostel:
                                </span>
                                {['All', 'Neeladri Hostel', 'Velankani Hostel'].map((h) => (
                                    <button
                                        key={h}
                                        onClick={() => setFilterHostel(h)}
                                        className={`px-2 py-1 text-xs font-bold rounded border cursor-pointer transition-colors ${
                                            filterHostel === h
                                                ? 'bg-[#FFD93D] text-black border-black neo-shadow-sm'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                                        }`}
                                    >
                                        {h === 'All' ? 'All Hostels' : h.replace(' Hostel', '')}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono font-bold text-gray-500 uppercase flex items-center gap-1">
                                <Filter className="w-3 h-3" /> Category:
                            </span>
                            {['All', 'Plumbing', 'Electrical', 'IT', 'Housekeeping'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setFilterCategory(cat)}
                                    className={`px-2.5 py-1 text-xs font-bold rounded border cursor-pointer transition-colors ${
                                        filterCategory === cat
                                            ? 'bg-black text-[#FFD93D] border-black'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                {loading && tickets.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 border-4 border-black border-t-[#FFD93D] rounded-full animate-spin mb-3" />
                        <span className="font-bold text-xs uppercase tracking-wider text-gray-600">
                            Loading hostel issue stream...
                        </span>
                    </div>
                ) : isStaff && viewMode === 'kanban' ? (
                    /* Warden & Technician Drag-and-Drop Kanban Board */
                    <KanbanBoard
                        tickets={filteredTickets}
                        onStatusChange={handleStatusChange}
                    />
                ) : (
                    /* Student Grid View or Staff Grid View */
                    <div>
                        {filteredTickets.length === 0 ? (
                            <div className="neo-card py-16 px-6 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
                                <h3 className="text-lg font-black text-black">No Issues Found</h3>
                                <p className="text-xs text-gray-600 mt-1 mb-4">
                                    No maintenance tickets match the selected filters.
                                </p>
                                {user?.role === 'Student' && (
                                    <button
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="neo-btn bg-[#FFD93D] text-black text-xs px-4 py-2 font-black uppercase"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        <span>Report New Issue</span>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredTickets.map((ticket) => (
                                    <TicketCard
                                        key={ticket._id}
                                        ticket={ticket}
                                        isStaff={isStaff}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Student Create Ticket Modal */}
            <CreateTicketModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={(newTicket) => {
                    setTickets((prev) => [newTicket, ...prev]);
                }}
            />

            {/* Warden Onboard Staff Modal */}
            <AddStaffModal
                isOpen={isAddStaffOpen}
                onClose={() => setIsAddStaffOpen(false)}
            />
        </div>
    );
};

export default Dashboard;
