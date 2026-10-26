import { useState } from 'react';
import { X, Send, AlertTriangle, Sparkles, Paperclip, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { axiosInstance } from '../axiosCalls/axios';
import FileUploadZone from './FileUploadZone';

const CreateTicketModal = ({ isOpen, onClose, onCreated }) => {
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        category: 'Plumbing',
        priority: 'Medium',
        description: '',
        customDeadlineHours: 24,
        attachments: []
    });

    const [locationScope, setLocationScope] = useState('my_room');
    const [commonAreaLocation, setCommonAreaLocation] = useState('Corridor / Water Dispenser');

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const userHostel = user?.hostel || (user?.location?.includes('Velankani') ? 'Velankani Hostel' : 'Neeladri Hostel');
        const finalLocation = locationScope === 'my_room'
            ? (user?.location || `${userHostel}, Room ${user?.roomNumber || 'A1-101'}`)
            : `${userHostel}, ${commonAreaLocation}`;

        const payload = {
            ...formData,
            hostel: userHostel,
            locationSnapshot: finalLocation
        };

        try {
            const res = await axiosInstance.post('/tickets', payload);
            if (res.data?.success) {
                if (onCreated) onCreated(res.data.ticket);
                onClose();
            } else {
                setError(res.data?.message || 'Failed to submit ticket');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating ticket');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white border-3 border-black rounded-xl max-w-lg w-full p-6 neo-shadow-lg relative animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 border-2 border-black rounded hover:bg-gray-100 cursor-pointer transition-colors"
                >
                    <X className="w-4 h-4 text-black" />
                </button>

                {/* Header */}
                <div className="mb-5 pb-3 border-b-2 border-black">
                    <span className="font-mono text-xs font-bold bg-[#FFD93D] text-black px-2 py-0.5 border border-black rounded uppercase">
                        New Maintenance Request
                    </span>
                    <h2 className="text-xl font-black text-black mt-1">
                        Report Hostel Issue
                    </h2>
                    <p className="text-xs text-gray-600 mt-0.5">
                        Your request initiates an automated 24-hour SLA resolution clock.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 rounded text-xs text-red-800 font-bold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                            Issue Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            required
                            placeholder="e.g. Water filter leaking in corridor - 2nd floor"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                        />
                    </div>

                    {/* Category & Priority */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-black uppercase mb-1">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm border-2 border-black rounded bg-white font-medium focus:outline-none"
                            >
                                <option value="Plumbing">Plumbing</option>
                                <option value="Electrical">Electrical</option>
                                <option value="IT">IT & Network</option>
                                <option value="Housekeeping">Housekeeping</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-black uppercase mb-1">
                                Initial Priority *
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm border-2 border-black rounded bg-white font-medium focus:outline-none"
                            >
                                <option value="Low">Low (Minor cosmetic issue)</option>
                                <option value="Medium">Medium (Standard repair)</option>
                                <option value="High">High (Impacting daily work)</option>
                                <option value="Critical">Critical (Hazardous / Emergency)</option>
                            </select>
                        </div>
                    </div>

                    {/* Location Selection: Room vs Common Area */}
                    <div className="bg-[#FFFDF5] p-3 border-2 border-dashed border-black rounded text-xs flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-black uppercase flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-black" />
                                <span>Issue Location in {user?.hostel || 'Hostel'}</span>
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-[#FFD93D] px-1.5 py-0.5 border border-black rounded">
                                {user?.hostel || 'Hostel Campus'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setLocationScope('my_room')}
                                className={`flex-1 py-1.5 px-2 text-xs font-bold rounded border cursor-pointer transition-colors ${
                                    locationScope === 'my_room'
                                        ? 'bg-black text-[#FFD93D] border-black'
                                        : 'bg-white text-gray-700 border-gray-300'
                                }`}
                            >
                                My Room ({user?.roomNumber ? `Room ${user?.roomNumber}` : user?.location})
                            </button>
                            <button
                                type="button"
                                onClick={() => setLocationScope('common_area')}
                                className={`flex-1 py-1.5 px-2 text-xs font-bold rounded border cursor-pointer transition-colors ${
                                    locationScope === 'common_area'
                                        ? 'bg-black text-[#FFD93D] border-black'
                                        : 'bg-white text-gray-700 border-gray-300'
                                }`}
                            >
                                Common Area
                            </button>
                        </div>

                        {locationScope === 'common_area' && (
                            <select
                                value={commonAreaLocation}
                                onChange={(e) => setCommonAreaLocation(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs border-2 border-black rounded bg-white font-medium focus:outline-none"
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
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                            Detailed Description *
                        </label>
                        <textarea
                            name="description"
                            rows={3}
                            required
                            placeholder="Provide details about what is malfunctioning, room numbers affected, and any safety hazards..."
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                        />
                    </div>

                    {/* Documents & Image Attachments */}
                    <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <Paperclip className="w-3.5 h-3.5 text-black" />
                                <span>Evidence & Documents (PDF / Images)</span>
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
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
                    <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="neo-btn bg-white hover:bg-gray-100 text-black text-xs px-4 py-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="neo-btn bg-[#FFD93D] hover:bg-[#ffe066] text-black text-xs px-5 py-2 font-black uppercase"
                        >
                            <Send className="w-3.5 h-3.5" />
                            <span>{submitting ? 'Submitting...' : 'Submit & Start SLA Clock'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTicketModal;
