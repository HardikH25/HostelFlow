import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
        setSubmitting(true);
        setError('');

        const res = await login(formData.email, formData.password);
        setSubmitting(false);

        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.message || 'Login failed. Please check credentials.');
        }
    };

    return (
        <div className="min-h-screen flex bg-[#FFFDF5] text-black font-sans selection:bg-[#FFD93D] selection:text-black">
            
            {/* LEFT PANEL — Brand Showcase */}
            <div
                className="hidden lg:flex lg:w-[50%] relative overflow-hidden flex-col justify-between p-12 border-r-3 border-black bg-[#FFD93D]"
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
                            SLA Enforcement Platform
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-black leading-tight tracking-tight mb-4">
                            Mission-Critical Campus Issue Resolution.
                        </h2>
                        <p className="text-xs sm:text-sm text-black/80 font-medium leading-relaxed mb-6">
                            Ensuring student complaints never get lost in bureaucratic limbo. Guaranteed resolution deadlines, automated escalations, and real-time technician telemetry.
                        </p>
                    </div>
                </div>

                {/* Architecture badge */}
                <div className="bg-white border-2 border-black p-4 rounded-lg neo-shadow-sm text-xs font-mono">
                    <span className="font-black block uppercase text-black mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Security & Architecture</span>
                    </span>
                    <span className="text-gray-600 block">
                        HttpOnly SameSite JWT Session Tokens • Role-Based Access Control • WebSockets Ticket Rooms
                    </span>
                </div>
            </div>

            {/* RIGHT PANEL — Sign In Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12">
                <div className="max-w-md w-full">
                    
                    {/* Header */}
                    <div className="mb-6">
                        <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-4">
                            <div className="bg-[#FFD93D] border-2 border-black p-1.5 rounded neo-shadow-sm">
                                <Layers className="w-5 h-5 text-black" />
                            </div>
                            <span className="font-black text-xl text-black">
                                HOSTELFLOW
                            </span>
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                            Sign In to Portal
                        </h1>
                        <p className="text-xs text-gray-600 mt-1">
                            Enter your registered student or staff account credentials.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 rounded text-xs text-red-800 font-bold flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Standard Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-bold text-black uppercase mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="e.g. name.2XBCS1XXXX@sst.scaler.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm border-2 border-black rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-bold text-black uppercase">
                                    Password
                                </label>
                                <span className="text-[10px] text-gray-500 font-mono">
                                    Encrypted & Verified
                                </span>
                            </div>
                            <input
                                type="password"
                                name="password"
                                required
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm border-2 border-black rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="neo-btn bg-[#FFD93D] hover:bg-[#ffe066] text-black text-xs py-2.5 font-black uppercase mt-2"
                        >
                            <span>{submitting ? 'Authenticating...' : 'Sign In with HttpOnly Cookie'}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t-2 border-black/10 text-center text-xs text-gray-600">
                        Don't have a student account?{' '}
                        <Link to="/signup" className="font-extrabold text-black underline hover:text-[#FF5252]">
                            Register New Student
                        </Link>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default Login;
