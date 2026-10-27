import { useState } from "react";
import { X, Send, AlertTriangle, Paperclip, MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { axiosInstance } from "../axiosCalls/axios";
import FileUploadZone from "./FileUploadZone";

const CreateTicketModal = ({ isOpen, onClose, onCreated, onTicketCreated }) => {
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const initialFormData = {
        title: "",
        category: "Plumbing",
        priority: "Medium",
        description: "",
        customDeadlineHours: 24,
        attachments: []
    };

    const [formData, setFormData] = useState(initialFormData);

    const [locationScope, setLocationScope] = useState("my_room");
    const [commonAreaLocation, setCommonAreaLocation] = useState("Corridor / Water Dispenser");

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleClose = () => {
        setError(null);
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const userHostel = user?.hostel || (user?.location?.includes("Velankani") ? "Velankani Hostel" : "Neeladri Hostel");
        const finalLocation = locationScope === "my_room"
            ? (user?.location || `${userHostel}, Room ${user?.roomNumber || "A1-101"}`)
            : `${userHostel}, ${commonAreaLocation}`;

        const payload = {
            ...formData,
            hostel: userHostel,
            locationSnapshot: finalLocation
        };

        try {
            const res = await axiosInstance.post("/tickets", payload);
            if (res.data?.success) {
                const callback = onTicketCreated || onCreated;
                if (typeof callback === "function") {
                    callback(res.data.ticket);
                }
                setFormData(initialFormData);
                setError(null);
                onClose();
            } else {
                setError(res.data?.message || "Failed to create ticket.");
            }
        } catch (err) {
            console.error("Error creating ticket:", err);
            setError(err.response?.data?.message || err.message || "Error submitting ticket. Please check fields.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="rounded-[6px] bg-[#0e0e0e] border border-[#222222] max-w-xl w-full p-6 text-[#f2f2f2] relative my-8 shadow-2xl">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#222222]">
                    <div>
                        <h2 className="text-lg font-medium text-[#f2f2f2] tracking-tight">
                            Report Maintenance Issue
                        </h2>
                        <p className="text-xs text-[#8a8d91] mt-0.5">
                            Submit a facility request for fast resolution by campus staff.
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1.5 rounded-full hover:bg-[#1a1a1a] text-[#8a8d91] hover:text-[#f2f2f2] transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-[#180a0a] border border-red-800/50 rounded-[6px] text-xs text-red-200/90 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Title */}
                    <div>
                        <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                            Issue Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            required
                            placeholder="e.g. Geyser leaking water or ceiling fan speed switch broken"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] placeholder-[#8a8d91] focus:outline-none focus:border-[#3fd6c6]"
                        />
                    </div>

                    {/* Category & Priority */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] focus:outline-none focus:border-[#3fd6c6]"
                            >
                                <option value="Plumbing">Plumbing</option>
                                <option value="Electrical">Electrical</option>
                                <option value="IT">IT &amp; Network</option>
                                <option value="Housekeeping">Housekeeping</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                                Priority Level *
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] focus:outline-none focus:border-[#3fd6c6]"
                            >
                                <option value="Low">Low (Standard maintenance window)</option>
                                <option value="Medium">Medium (Regular daily priority)</option>
                                <option value="High">High (Impacting room living)</option>
                                <option value="Critical">Critical (Immediate urgency / safety hazard)</option>
                            </select>
                        </div>
                    </div>

                    {/* Location Selection: Room vs Common Area */}
                    <div className="p-3.5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-[6px] text-xs flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] text-[#8a8d91] uppercase flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#3fd6c6]" />
                                <span>Issue Location</span>
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#141414] border border-[#222222] text-[#8a8d91]">
                                {user?.hostel || "Hostel Campus"}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setLocationScope("my_room")}
                                className={`flex-1 py-1.5 px-3 text-xs rounded-full border transition-colors cursor-pointer ${
                                    locationScope === "my_room"
                                        ? "bg-[#f2f2f2] text-[#0a0a0a] border-[#f2f2f2] font-medium"
                                        : "bg-[#141414] border-[#222222] text-[#a6a9ad] hover:border-[#303030]"
                                }`}
                            >
                                My Room ({user?.roomNumber ? `Room ${user?.roomNumber}` : user?.location})
                            </button>
                            <button
                                type="button"
                                onClick={() => setLocationScope("common_area")}
                                className={`flex-1 py-1.5 px-3 text-xs rounded-full border transition-colors cursor-pointer ${
                                    locationScope === "common_area"
                                        ? "bg-[#f2f2f2] text-[#0a0a0a] border-[#f2f2f2] font-medium"
                                        : "bg-[#141414] border-[#222222] text-[#a6a9ad] hover:border-[#303030]"
                                }`}
                            >
                                Common Area
                            </button>
                        </div>

                        {locationScope === "common_area" && (
                            <select
                                value={commonAreaLocation}
                                onChange={(e) => setCommonAreaLocation(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] focus:outline-none focus:border-[#3fd6c6]"
                            >
                                <option value="Corridor / Water Dispenser">Corridor / Water Dispenser</option>
                                <option value="Floor Washroom / Geyser">Floor Washroom / Geyser</option>
                                <option value="Common Study Room">Common Study Room</option>
                                <option value="Hostel Mess / Dining Hall">Hostel Mess / Dining Hall</option>
                                <option value="Staircase / Lift Lobby">Staircase / Lift Lobby</option>
                            </select>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                            Detailed Description *
                        </label>
                        <textarea
                            name="description"
                            rows={3}
                            required
                            placeholder="Provide details about what is malfunctioning and any specific symptoms..."
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] placeholder-[#8a8d91] focus:outline-none focus:border-[#3fd6c6]"
                        />
                    </div>

                    {/* Documents & Image Attachments */}
                    <div>
                        <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <Paperclip className="w-3.5 h-3.5 text-[#8a8d91]" />
                                <span>Evidence &amp; Documentation (PDF / Images)</span>
                            </span>
                            <span className="text-[10px] text-[#8a8d91] font-mono">
                                Optional
                            </span>
                        </label>
                        <FileUploadZone
                            attachments={formData.attachments}
                            onChange={(newAttachments) =>
                                setFormData((prev) => ({ ...prev, attachments: newAttachments }))
                            }
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1f1f1f] mt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 rounded-full bg-[#141414] border border-[#222222] hover:border-[#303030] text-[#a6a9ad] hover:text-[#f2f2f2] text-xs font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2 rounded-full bg-[#f2f2f2] text-[#0a0a0a] hover:bg-white text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                            <Send className="w-3.5 h-3.5" />
                            <span>{submitting ? "Submitting..." : "Submit Maintenance Request"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTicketModal;
