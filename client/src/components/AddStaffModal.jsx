import { useState, useEffect } from "react";
import { X, UserPlus, Building2, AlertTriangle, CheckCircle2, MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { axiosInstance } from "../axiosCalls/axios";

const AddStaffModal = ({ isOpen, onClose, onStaffAdded }) => {
    const { user } = useAuth();
    const defaultHostel = user?.hostel || "Neeladri Hostel";

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        password: "",
        role: "Technician",
        hostel: defaultHostel,
        specialization: "Plumbing",
        phone: ""
    });

    const resetForm = () => {
        setFormData({
            fullname: "",
            email: "",
            password: "",
            role: "Technician",
            hostel: user?.hostel || "Neeladri Hostel",
            specialization: "Plumbing",
            phone: ""
        });
        setError(null);
        setSuccessMsg(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    useEffect(() => {
        if (isOpen) {
            setFormData((prev) => ({
                ...prev,
                hostel: user?.hostel || "Neeladri Hostel"
            }));
        }
    }, [isOpen, user]);

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
        setSuccessMsg(null);

        try {
            const res = await axiosInstance.post("/users/staff", formData);
            if (res.data?.success) {
                setSuccessMsg(`Account successfully created for ${formData.fullname}!`);
                if (onStaffAdded) onStaffAdded(res.data.staff);
                setTimeout(() => {
                    handleClose();
                }, 1400);
            } else {
                setError(res.data?.message || "Failed to onboard staff.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Error creating account. Ensure email is unique.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="rounded-[6px] bg-[#0e0e0e] border border-[#222222] max-w-lg w-full p-6 text-[#f2f2f2] relative my-8 shadow-2xl">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#222222]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#141414] border border-[#222222] flex items-center justify-center">
                            <UserPlus className="w-4 h-4 text-[#3fd6c6]" />
                        </div>
                        <div>
                            <h2 className="text-base font-medium text-[#f2f2f2] tracking-tight">
                                Onboard Staff Member
                            </h2>
                            <p className="text-xs text-[#8a8d91]">
                                Provision verified credentials for hostel operations.
                            </p>
                        </div>
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

                {successMsg && (
                    <div className="mb-4 p-3 bg-[#0a180e] border border-emerald-800/50 rounded-[6px] text-xs text-emerald-200/90 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#3fd6c6] shrink-0" />
                        <span>{successMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                    <div>
                        <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                            Staff Full Name *
                        </label>
                        <input
                            type="text"
                            name="fullname"
                            required
                            placeholder="e.g. Ramesh Patel"
                            value={formData.fullname}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] placeholder-[#8a8d91] focus:outline-none focus:border-[#3fd6c6]"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                            Official Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="e.g. ramesh.tech@scaler.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] placeholder-[#8a8d91] focus:outline-none focus:border-[#3fd6c6]"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                            Temporary Password *
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            placeholder="Temporary login password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] placeholder-[#8a8d91] focus:outline-none focus:border-[#3fd6c6]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                                Staff Role *
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] focus:outline-none focus:border-[#3fd6c6]"
                            >
                                <option value="Technician">Technician</option>
                                <option value="Warden">Assistant Warden</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                                Assigned Hostel *
                            </label>
                            <select
                                name="hostel"
                                value={formData.hostel}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] focus:outline-none focus:border-[#3fd6c6]"
                            >
                                <option value="Neeladri Hostel">Neeladri Hostel</option>
                                <option value="Velankani Hostel">Velankani Hostel</option>
                            </select>
                        </div>
                    </div>

                    {formData.role === "Technician" && (
                        <div>
                            <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                                Trade Specialization *
                            </label>
                            <select
                                name="specialization"
                                value={formData.specialization}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] focus:outline-none focus:border-[#3fd6c6]"
                            >
                                <option value="Plumbing">Plumbing &amp; Water Systems</option>
                                <option value="Electrical">Electrical &amp; Power</option>
                                <option value="IT & Network">IT, Wi-Fi &amp; Network</option>
                                <option value="Housekeeping">Housekeeping &amp; Hygiene</option>
                                <option value="Carpentry">Carpentry &amp; Furniture</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                            Contact Phone (Optional)
                        </label>
                        <input
                            type="text"
                            name="phone"
                            placeholder="+91 98765 00000"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] placeholder-[#8a8d91] focus:outline-none focus:border-[#3fd6c6]"
                        />
                    </div>

                    {/* Operational Location Preview */}
                    <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-3 rounded-[6px] text-xs font-mono">
                        <div className="flex items-center gap-1.5 text-[#8a8d91] uppercase text-[10px] mb-1">
                            <MapPin className="w-3.5 h-3.5 text-[#3fd6c6]" />
                            <span>Designated Operational Location:</span>
                        </div>
                        <p className="text-[#f2f2f2] font-medium">
                            {formData.hostel}, {formData.role === "Warden" ? "Warden Administration Office" : `Maintenance (${formData.specialization})`}
                        </p>
                        <p className="text-[10px] text-[#8a8d91] mt-0.5">
                            This staff member can only be assigned tickets originating from {formData.hostel}.
                        </p>
                    </div>

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
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>{submitting ? "Provisioning..." : "Provision Account"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStaffModal;
