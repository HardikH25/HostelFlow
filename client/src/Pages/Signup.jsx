import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { axiosInstance } from "../axiosCalls/axios";
import { Layers, ArrowRight, AlertTriangle, ShieldCheck, Building2, MapPin } from "lucide-react";

const Signup = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        password: "",
        hostel: "Neeladri Hostel",
        roomNumber: "",
        phone: ""
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.roomNumber.trim()) {
            setError("Please enter your assigned hostel room number.");
            return;
        }

        setSubmitting(true);
        const cleanRoom = formData.roomNumber.trim().toUpperCase();

        try {
            const payload = {
                fullname: formData.fullname.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                role: "Student",
                hostel: formData.hostel,
                roomNumber: cleanRoom,
                location: `${formData.hostel}, Room ${cleanRoom}`,
                phone: formData.phone.trim()
            };

            const res = await axiosInstance.post("/auth/register", payload);
            if (res.data?.success) {
                if (res.data.user) {
                    setUser(res.data.user);
                }
                navigate("/dashboard");
            } else {
                setError(res.data?.message || "Failed to register. Please check details.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Account creation failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#050505] text-[#f2f2f2] font-sans selection:bg-[#3fd6c6] selection:text-[#050505] relative overflow-hidden">
            {/* Radial light pool */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] pointer-events-none opacity-30"
                style={{
                    background: "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.12) 0%, transparent 60%)"
                }}
            />

            {/* LEFT PANEL — Brand Showcase */}
            <div className="hidden lg:flex lg:w-[48%] relative flex-col justify-between p-12 border-r border-[#222222] bg-[#090909]">
                <div>
                    <Link to="/" className="inline-flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-[6px] bg-[#141414] border border-[#222222] flex items-center justify-center">
                            <Layers className="w-4 h-4 text-[#f2f2f2]" />
                        </div>
                        <span className="font-semibold text-base tracking-tight text-[#f2f2f2]">
                            HOSTELFLOW
                        </span>
                        <span className="text-[11px] font-mono text-[#8a8d91] border-l border-[#222222] pl-2">
                            Campus Operations
                        </span>
                    </Link>

                    <div className="mt-20 max-w-md">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#141414] border border-[#222222] text-[10px] font-mono text-[#3fd6c6] mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3fd6c6]" />
                            <span>Resident Services Onboarding</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-normal text-[#f2f2f2] leading-tight tracking-tight mb-4">
                            Direct accountability for hostel maintenance.
                        </h2>
                        <p className="text-xs sm:text-sm text-[#a6a9ad] leading-relaxed mb-6 font-normal">
                            Register your student room to submit facility maintenance requests with verified room location, attach documentation, and track guaranteed resolution timelines in real-time.
                        </p>
                    </div>
                </div>

                {/* Operations badge */}
                <div className="rounded-[6px] bg-[#0e0e0e] border border-[#222222] p-4 text-xs font-mono">
                    <span className="text-[#f2f2f2] block mb-1 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#3fd6c6]" />
                        <span>Neeladri &amp; Velankani Hostels</span>
                    </span>
                    <span className="text-[#8a8d91] block text-[11px]">
                        Campus-verified room numbering • Encrypted resident sessions • Live status alerts
                    </span>
                </div>
            </div>

            {/* RIGHT PANEL — Sign Up Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10 overflow-y-auto">
                <div className="max-w-md w-full rounded-[6px] bg-[#0e0e0e] border border-[#222222] p-8 shadow-2xl my-auto">
                    
                    <div className="mb-6">
                        <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-[6px] bg-[#141414] border border-[#222222] flex items-center justify-center">
                                <Layers className="w-3.5 h-3.5 text-[#f2f2f2]" />
                            </div>
                            <span className="font-semibold text-sm text-[#f2f2f2]">
                                HOSTELFLOW
                            </span>
                        </Link>
                        <h1 className="text-2xl font-normal text-[#f2f2f2] tracking-tight">
                            Register Student Account
                        </h1>
                        <p className="text-xs text-[#8a8d91] mt-1">
                            Enter your details to create your hostel resident profile.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-[#180a0a] border border-red-800/50 rounded-[6px] text-xs text-red-200/90 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                        <div>
                            <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="fullname"
                                required
                                placeholder="e.g. Lionel Messi"
                                value={formData.fullname}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] placeholder-[#8a8d91] focus:outline-none focus:border-[#3fd6c6]"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                                Student Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="e.g. messi.25BCS10000@sst.scaler.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] placeholder-[#8a8d91] focus:outline-none focus:border-[#3fd6c6]"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                                Password *
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                placeholder="Minimum 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] placeholder-[#8a8d91] focus:outline-none focus:border-[#3fd6c6]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5 flex items-center gap-1">
                                    <Building2 className="w-3 h-3 text-[#8a8d91]" />
                                    <span>Hostel *</span>
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

                            <div>
                                <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-[#8a8d91]" />
                                    <span>Room No. *</span>
                                </label>
                                <input
                                    type="text"
                                    name="roomNumber"
                                    required
                                    placeholder="e.g. A2-010"
                                    value={formData.roomNumber}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] uppercase font-mono placeholder-[#8a8d91] focus:outline-none focus:border-[#3fd6c6]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                                Phone Number (Optional)
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="e.g. +91 9876543210"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] placeholder-[#8a8d91] focus:outline-none focus:border-[#3fd6c6]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-2.5 rounded-full bg-[#f2f2f2] text-[#0a0a0a] hover:bg-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors mt-2 disabled:opacity-50 cursor-pointer"
                        >
                            <span>{submitting ? "Registering..." : "Create Student Account"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-[#1f1f1f] text-center text-xs text-[#8a8d91]">
                        Already have an account?{" "}
                        <Link to="/login" className="text-[#f2f2f2] hover:underline font-medium">
                            Sign In Here
                        </Link>
                    </div>

                    <div className="mt-3 text-center text-[11px] text-[#8a8d91] font-mono">
                        Staff / Warden? Please use your provisioned credentials to <Link to="/login" className="text-[#f2f2f2] underline">Sign In</Link>.
                    </div>

                </div>
            </div>

        </div>
    );
};

export default Signup;
