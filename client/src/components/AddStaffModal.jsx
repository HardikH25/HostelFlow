import { useState, useEffect } from 'react';
import { X, UserPlus, Shield, Building2, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { axiosInstance } from '../axiosCalls/axios';

const AddStaffModal = ({ isOpen, onClose, onStaffAdded }) => {
    const { user } = useAuth();
    const defaultHostel = user?.hostel || 'Neeladri Hostel';

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        role: 'Technician',
        hostel: defaultHostel,
        specialization: 'Plumbing',
        phone: ''
    });

    const resetForm = () => {
        setFormData({
            fullname: '',
            email: '',
            password: '',
            role: 'Technician',
            hostel: user?.hostel || 'Neeladri Hostel',
            specialization: 'Plumbing',
            phone: ''
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
            setFormData({
                fullname: '',
                email: '',
                password: '',
                role: 'Technician',
                hostel: user?.hostel || 'Neeladri Hostel',
                specialization: 'Plumbing',
                phone: ''
            });
            setError(null);
            setSuccessMsg(null);
        }
    }, [isOpen, user?.hostel]);

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
            const payload = {
                ...formData,
                specialization: formData.role === 'Technician' ? formData.specialization : ''
            };
            const res = await axiosInstance.post('/users/staff', payload);
            if (res.data?.success) {
                setSuccessMsg(res.data.message || 'Staff member onboarded successfully!');
                if (onStaffAdded) onStaffAdded(res.data.staff);
                // Clean the onboarding form after provision account is created
                setFormData({
                    fullname: '',
                    email: '',
                    password: '',
                    role: 'Technician',
                    hostel: user?.hostel || 'Neeladri Hostel',
                    specialization: 'Plumbing',
                    phone: ''
                });
                setTimeout(() => {
                    setSuccessMsg(null);
                    onClose();
                }, 1500);
            } else {
                setError(res.data?.message || 'Failed to onboard staff.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to onboard staff member.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white border-3 border-black rounded-xl max-w-md w-full p-6 neo-shadow-lg relative animate-in fade-in duration-200">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-1.5 border-2 border-black rounded hover:bg-gray-100 cursor-pointer"
                >
                    <X className="w-4 h-4 text-black" />
                </button>

                <div className="mb-4 pb-3 border-b-2 border-black">
                    <span className="font-mono text-xs font-black bg-[#FF5252] text-white px-2 py-0.5 rounded uppercase">
                        Administrative Authority
                    </span>
                    <h2 className="text-xl font-black text-black mt-1">
                        Onboard Staff Member
                    </h2>
                    <p className="text-xs text-gray-600 mt-0.5">
                        Provision authorized Technician or Warden accounts for hostel operations.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 rounded text-xs text-red-800 font-bold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="mb-4 p-3 bg-emerald-100 border-2 border-emerald-500 rounded text-xs text-emerald-800 font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{successMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                            Staff Full Name *
                        </label>
                        <input
                            type="text"
                            name="fullname"
                            required
                            placeholder="e.g. Ramesh Patel"
                            value={formData.fullname}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-xs border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                            Official Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="e.g. ramesh.tech@scaler.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-xs border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                            Initial Temporary Password *
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            placeholder="Temporary login password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-xs border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-black uppercase mb-1">
                                Staff Role *
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-xs border-2 border-black rounded bg-white font-medium"
                            >
                                <option value="Technician">Technician</option>
                                <option value="Warden">Assistant Warden</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-black uppercase mb-1">
                                Assigned Hostel *
                            </label>
                            <select
                                name="hostel"
                                value={formData.hostel}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-xs border-2 border-black rounded bg-white font-medium"
                            >
                                <option value="Neeladri Hostel">Neeladri Hostel</option>
                                <option value="Velankani Hostel">Velankani Hostel</option>
                            </select>
                        </div>
                    </div>

                    {formData.role === 'Technician' && (
                        <div>
                            <label className="block text-xs font-bold text-black uppercase mb-1">
                                Trade Specialization *
                            </label>
                            <select
                                name="specialization"
                                value={formData.specialization}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-xs border-2 border-black rounded bg-white font-medium"
                            >
                                <option value="Plumbing">Plumbing & Water Systems</option>
                                <option value="Electrical">Electrical & Power MCB</option>
                                <option value="IT & Network">IT, Wi-Fi & Network</option>
                                <option value="Housekeeping">Housekeeping & Hygiene</option>
                                <option value="Carpentry">Carpentry & Furniture</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                            Contact Phone (Optional)
                        </label>
                        <input
                            type="text"
                            name="phone"
                            placeholder="+91 98765 00000"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-xs border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                        />
                    </div>

                    {/* Dynamic Location & Office Preview */}
                    <div className="bg-[#FFFDF5] border-2 border-dashed border-black p-2.5 rounded text-xs font-mono">
                        <div className="flex items-center gap-1.5 text-black font-black uppercase text-[10px] mb-1">
                            <MapPin className="w-3.5 h-3.5 text-black" />
                            <span>Designated Operational Location:</span>
                        </div>
                        <p className="text-black font-bold">
                            {formData.hostel}, {formData.role === 'Warden' ? 'Warden Administration Office' : `Maintenance (${formData.specialization})`}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                            This staff member can only be assigned tickets originating from {formData.hostel}.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black mt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="neo-btn bg-white hover:bg-gray-100 text-black text-xs px-3 py-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="neo-btn bg-[#FF5252] text-white text-xs px-4 py-2 font-bold uppercase"
                        >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>{submitting ? 'Onboarding...' : 'Provision Account'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStaffModal;
