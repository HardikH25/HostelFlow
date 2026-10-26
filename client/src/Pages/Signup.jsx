import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { axiosInstance } from '../axiosCalls/axios';
import { Layers, ArrowRight, AlertTriangle, ShieldCheck, Building2, MapPin } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        hostel: 'Neeladri Hostel',
        roomNumber: '',
        phone: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.roomNumber.trim()) {
            setError('Please enter your assigned hostel room number.');
            return;
        }

        setSubmitting(true);
        const cleanRoom = formData.roomNumber.trim().toUpperCase();
        const fullLocation = `${formData.hostel}, Room ${cleanRoom}`;

        try {
            const res = await axiosInstance.post('/auth/register', {
                ...formData,
                roomNumber: cleanRoom,
                location: fullLocation
            });

            if (res.data?.success) {
                setUser(res.data.user);
                navigate('/dashboard');
            } else {
                setError(res.data?.message || 'Registration failed.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#FFFDF5] text-black font-sans selection:bg-[#FFD93D] selection:text-black">
            
            {/* LEFT PANEL — Brand Showcase */}
            <div
                className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12 border-r-3 border-black bg-[#C4B5FD]"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            >
                <div>
                    <Link to="/" className="inline-flex items-center gap-2 group">
                        <div className="bg-white border-2 border-black p-2 rounded neo-shadow-sm group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
                            <Layers className="w-6 h-6 text-black" />
                        </div>
                        <span className="font-black text-2xl tracking-tight text-black">
                            HOSTEL<span className="bg-black text-[#FFD93D] px-1 rounded ml-0.5">FLOW</span>
                        </span>
                    </Link>

                    <div className="mt-16 max-w-md">
                        <div className="inline-block bg-black text-white text-[11px] font-mono font-black uppercase px-2.5 py-1 rounded mb-4">
                            Student Resident Portal
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-black leading-tight tracking-tight mb-4">
                            Official Campus Issue Resolution.
                        </h2>
                        <p className="text-xs sm:text-sm text-black/80 font-medium leading-relaxed mb-6">
                            Register your student room account to report maintenance issues, track 24-hour SLA countdowns in real-time, and chat directly with technicians.
                        </p>
                    </div>
                </div>

                <div className="bg-white border-2 border-black p-4 rounded-lg neo-shadow-sm text-xs font-mono">
                    <span className="font-black block uppercase text-black mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Role-Based Access Control</span>
                    </span>
                    <span className="text-gray-600 block">
                        Student accounts are tied to verified hostel blocks. Staff and Warden accounts are provisioned exclusively by the Chief Warden.
                    </span>
                </div>
            </div>

            {/* RIGHT PANEL — Student Sign Up Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 overflow-y-auto">
                <div className="max-w-md w-full my-auto">
                    
                    <div className="mb-6">
                        <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-3">
                            <div className="bg-[#FFD93D] border-2 border-black p-1.5 rounded neo-shadow-sm">
                                <Layers className="w-5 h-5 text-black" />
                            </div>
                            <span className="font-black text-xl text-black">
                                HOSTELFLOW
                            </span>
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                            Register Student Account
                        </h1>
                        <p className="text-xs text-gray-600 mt-0.5">
                            Enter your details to create your hostel resident profile.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 rounded text-xs text-red-800 font-bold flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                        <div>
                            <label className="block text-xs font-bold text-black uppercase mb-1">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="fullname"
                                required
                                placeholder="e.g. Lionel Messi"
                                value={formData.fullname}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-xs border-2 border-black rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-black uppercase mb-1">
                                Student Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="e.g. messi.25BCS10000@sst.scaler.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-xs border-2 border-black rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-black uppercase mb-1">
                                Password *
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                placeholder="Minimum 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-xs border-2 border-black rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-black uppercase mb-1 flex items-center gap-1">
                                    <Building2 className="w-3 h-3 text-black" />
                                    <span>Hostel *</span>
                                </label>
                                <select
                                    name="hostel"
                                    value={formData.hostel}
                                    onChange={handleChange}
                                    className="w-full px-2.5 py-2 text-xs border-2 border-black rounded bg-white font-medium focus:outline-none"
                                >
                                    <option value="Neeladri Hostel">Neeladri Hostel</option>
                                    <option value="Velankani Hostel">Velankani Hostel</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-black uppercase mb-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-black" />
                                    <span>Room No. *</span>
                                </label>
                                <input
                                    type="text"
                                    name="roomNumber"
                                    required
                                    placeholder="e.g. A2-010"
                                    value={formData.roomNumber}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-xs border-2 border-black rounded bg-white uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-black uppercase mb-1">
                                Phone Number (Optional)
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="e.g. +91 9876543210"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-xs border-2 border-black rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="neo-btn bg-[#FFD93D] hover:bg-[#ffe066] text-black text-xs py-2.5 font-black uppercase mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <span>{submitting ? 'Registering...' : 'Create Student Account'}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t-2 border-black/10 text-center text-xs text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-extrabold text-black underline hover:text-[#FF5252]">
                            Sign In Here
                        </Link>
                    </div>

                    <div className="mt-3 text-center text-[11px] text-gray-500 font-mono">
                        Staff / Warden? Please use your provisioned credentials to <Link to="/login" className="underline font-bold text-black">Sign In</Link>.
                    </div>

                </div>
            </div>

        </div>
    );
};

export default Signup;
