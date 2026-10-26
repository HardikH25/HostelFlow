import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Layers, ArrowRight, AlertTriangle, ShieldCheck } from "lucide-react";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
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
        setSubmitting(true);
        setError("");

        const res = await login(formData.email, formData.password);
        setSubmitting(false);

        if (res.success) {
            navigate("/dashboard");
        } else {
            setError(res.message || "Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="min-h-screen flex bg-[#050505] text-[#f2f2f2] font-sans selection:bg-[#3fd6c6] selection:text-[#050505] relative overflow-hidden">
            {/* Subtle radial light pool */}
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
                            <span>Campus Resolution Engine</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-normal text-[#f2f2f2] leading-tight tracking-tight mb-4">
                            Guaranteed hostel issue resolution.
                        </h2>
                        <p className="text-xs sm:text-sm text-[#a6a9ad] leading-relaxed mb-6 font-normal">
                            Eliminating delays in student facility maintenance. Automated timeline monitoring, instant staff dispatch, and verified location telemetry.
                        </p>
                    </div>
                </div>

                {/* Operations badge */}
                <div className="rounded-[6px] bg-[#0e0e0e] border border-[#222222] p-4 text-xs font-mono">
                    <span className="text-[#f2f2f2] block mb-1 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#3fd6c6]" />
                        <span>Verified Role Boundaries</span>
                    </span>
                    <span className="text-[#8a8d91] block text-[11px]">
                        Neeladri &amp; Velankani Hostels • Cryptographic Session Authentication • Instant Coordination
                    </span>
                </div>
            </div>

            {/* RIGHT PANEL — Sign In Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
                <div className="max-w-md w-full rounded-[6px] bg-[#0e0e0e] border border-[#222222] p-8 shadow-2xl">
                    
                    {/* Header */}
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
                            Sign In to Portal
                        </h1>
                        <p className="text-xs text-[#8a8d91] mt-1">
                            Enter your registered student or staff account credentials.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-[#180a0a] border border-red-800/50 rounded-[6px] text-xs text-red-200/90 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Standard Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="e.g. name.2XBCS1XXXX@sst.scaler.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] placeholder-[#8a8d91] focus:outline-none focus:border-[#3fd6c6]"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-[11px] font-mono text-[#8a8d91] uppercase">
                                    Password
                                </label>
                                <span className="text-[10px] text-[#8a8d91] font-mono">
                                    Encrypted &amp; Verified
                                </span>
                            </div>
                            <input
                                type="password"
                                name="password"
                                required
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] placeholder-[#8a8d91] focus:outline-none focus:border-[#3fd6c6]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-2.5 rounded-full bg-[#f2f2f2] text-[#0a0a0a] hover:bg-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors mt-2 disabled:opacity-50"
                        >
                            <span>{submitting ? "Authenticating..." : "Sign In to Operations"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-[#1f1f1f] text-center text-xs text-[#8a8d91]">
                        Don&apos;t have a student account?{" "}
                        <Link to="/signup" className="text-[#f2f2f2] hover:underline font-medium">
                            Register New Student
                        </Link>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default Login;
