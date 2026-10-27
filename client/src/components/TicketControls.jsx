import { useState } from "react";
import { axiosInstance } from "../axiosCalls/axios";
import confetti from "canvas-confetti";
import { formatFriendlyDateTime } from "../utils/dateUtils";
import {
    Clock,
    Wrench,
    Loader2
} from "lucide-react";

const TicketControls = ({ ticket, user, staffList, onTicketUpdated }) => {
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [updatingDeadline, setUpdatingDeadline] = useState(false);
    const [activeButton, setActiveButton] = useState(null);
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [customHours, setCustomHours] = useState("");
    const [customDate, setCustomDate] = useState("");
    const [showCustomDate, setShowCustomDate] = useState(false);

    if (!ticket) return null;

    // Handle ticket status change (Warden only)
    const handleStatusChange = async (newStatus) => {
        setStatusUpdating(true);
        try {
            const res = await axiosInstance.put(`/tickets/${ticket._id}/status`, { status: newStatus });
            if (res.data?.success) {
                onTicketUpdated(res.data.ticket);
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

    // Assign staff member (Warden only)
    const handleAssignChange = async (e) => {
        const assignedTo = e.target.value;
        setAssigning(true);
        try {
            const res = await axiosInstance.put(`/tickets/${ticket._id}/assign`, { assignedTo });
            if (res.data?.success) {
                onTicketUpdated(res.data.ticket);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Error assigning staff");
        } finally {
            setAssigning(false);
        }
    };

    // Deadline adjustment (Warden only)
    const handleSetDeadline = async ({ hours, date }) => {
        setUpdatingDeadline(true);
        setActiveButton(hours !== undefined ? hours : "custom");
        try {
            const payload = hours !== undefined ? { deadlineHours: hours } : { customDeadline: date };
            const res = await axiosInstance.put(`/tickets/${ticket._id}/deadline`, payload);
            if (res.data?.success) {
                onTicketUpdated(res.data.ticket);
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

    const ticketHostel = ticket.hostel || "Neeladri Hostel";

    // Only render controls for Warden or Technician
    if (user?.role !== "Warden" && user?.role !== "Technician") {
        return null;
    }

    return (
        <div className="rounded-[6px] bg-[#0e0e0e] border border-[#222222] p-6 flex flex-col gap-4">
            {/* Warden Action Controls */}
            {user?.role === "Warden" && (
                <>
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
                                {ticketHostel}
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
                                .filter((member) => (member.hostel || "Neeladri Hostel") === ticketHostel)
                                .map((member) => (
                                    <option key={member._id} value={member._id}>
                                        {member.fullname} ({member.role}{member.role === "Technician" && member.specialization ? ` • ${member.specialization}` : ""})
                                    </option>
                                ))}
                        </select>
                        <p className="text-[10px] text-[#8a8d91] font-mono mt-1">
                            Hostel Isolation: Filtered to staff in {ticketHostel}.
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

                        {ticket.slaDeadline && (
                            <div className="mb-2.5 px-3 py-1.5 rounded-[4px] bg-[#0a0a0a] border border-[#1f1f1f] flex items-center justify-between text-xs">
                                <span className="text-[10px] font-mono text-[#8a8d91] uppercase">Current Target:</span>
                                <span className="font-medium text-[#3fd6c6]">
                                    {formatFriendlyDateTime(ticket.slaDeadline)}
                                </span>
                            </div>
                        )}

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
                                className="px-4 py-1.5 rounded-full bg-[#f2f2f2] text-[#0a0a0a] hover:bg-white text-xs font-medium cursor-pointer"
                            >
                                Apply
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
                </>
            )}

            {/* Technician Work Console (Read-only) */}
            {user?.role === "Technician" && (
                <div className="flex flex-col gap-3">
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
    );
};

export default TicketControls;
