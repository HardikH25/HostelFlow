import { Link } from 'react-router-dom';
import {
    Clock,
    ShieldCheck,
    Layers,
    ArrowRight,
    MessageSquare,
    Building2,
    CheckCircle2,
    Users,
    FileText,
    KeyRound,
    Sparkles
} from 'lucide-react';

const Landing = () => {
    return (
        <div className="min-h-screen bg-[#FFFDF5] text-black font-sans selection:bg-[#FFD93D] selection:text-black">

            {/* Top Bar */}
            <div className="border-b-3 border-black bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-2">
                    <div className="bg-[#FFD93D] border-2 border-black p-1.5 rounded neo-shadow-sm">
                        <Layers className="w-5 h-5 text-black" />
                    </div>
                    <span className="font-extrabold text-xl tracking-tight text-black">
                        HOSTEL<span className="bg-black text-[#FFD93D] px-1 rounded ml-0.5">FLOW</span>
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/login"
                        className="neo-btn bg-white hover:bg-gray-100 text-black text-xs px-4 py-2"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/signup"
                        className="neo-btn bg-[#FFD93D] text-black text-xs px-4 py-2 font-black uppercase"
                    >
                        Create Account
                    </Link>
                </div>
            </div>

            {/* Hero Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFD93D] border-2 border-black rounded-full font-mono text-xs font-black uppercase neo-shadow-sm mb-4">
                        <Building2 className="w-3.5 h-3.5 text-black" />
                        <span>Neeladri & Velankani Campus Living Operations</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-black text-black tracking-tight leading-[1.05] mb-6">
                        Hostel Issue Resolution with <span className="underline decoration-[#FF5252] decoration-4">Zero Compromise</span> SLA.
                    </h1>

                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-medium max-w-2xl mx-auto mb-8">
                        Production-grade maintenance infrastructure for campus residents. Automated 30-minute SLA evaluations, priority escalations, real-time Socket.io bi-directional messaging, and verifiable document attachments.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link
                            to="/signup"
                            className="neo-btn bg-[#FFD93D] text-black text-sm px-6 py-3 font-black uppercase flex items-center gap-2"
                        >
                            <span>Register as Student</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            to="/login"
                            className="neo-btn bg-black text-[#FFD93D] text-sm px-6 py-3 font-black uppercase flex items-center gap-2"
                        >
                            <span>Access Operations Portal</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Architecture Highlights Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="neo-card p-6 bg-white flex flex-col justify-between">
                        <div>
                            <div className="w-10 h-10 bg-[#FFD93D] border-2 border-black rounded-lg flex items-center justify-center mb-4 neo-shadow-sm">
                                <Clock className="w-5 h-5 text-black" />
                            </div>
                            <h3 className="text-lg font-black text-black mb-2">Automated SLA Cron Engine</h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Evaluates active tickets every 30 minutes via <code className="bg-gray-100 px-1 py-0.5 rounded border text-black font-mono">node-cron</code>. Unresolved tickets automatically escalate from Low → Medium → High → Critical and broadcast live WebSocket breach alarms.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-200 text-[11px] font-mono font-bold text-gray-500">
                            Automatic SLA Pause & Resume
                        </div>
                    </div>

                    <div className="neo-card p-6 bg-white flex flex-col justify-between">
                        <div>
                            <div className="w-10 h-10 bg-[#FF5252] border-2 border-black rounded-lg flex items-center justify-center mb-4 neo-shadow-sm">
                                <MessageSquare className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-black text-black mb-2">Real-Time WebSockets & Notes</h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Bi-directional <code className="bg-gray-100 px-1 py-0.5 rounded border text-black font-mono">Socket.io</code> ticket channels. Staff can post hidden internal notes with strict RBAC filtering to coordinate repairs without confusing students.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-200 text-[11px] font-mono font-bold text-gray-500">
                            Instant zero-refresh delivery
                        </div>
                    </div>

                    <div className="neo-card p-6 bg-white flex flex-col justify-between">
                        <div>
                            <div className="w-10 h-10 bg-[#38E54D] border-2 border-black rounded-lg flex items-center justify-center mb-4 neo-shadow-sm">
                                <ShieldCheck className="w-5 h-5 text-black" />
                            </div>
                            <h3 className="text-lg font-black text-black mb-2">Interactive Warden Kanban</h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Drag-and-drop workflow built with <code className="bg-gray-100 px-1 py-0.5 rounded border text-black font-mono">@hello-pangea/dnd</code>. Move tickets between Open, Assigned, Awaiting-Student-Reply, and Resolved with live visual alerts.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-200 text-[11px] font-mono font-bold text-gray-500">
                            HttpOnly JWT Cookie Auth
                        </div>
                    </div>
                </div>

                {/* Production Role & Security Architecture Showcase */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">

                    {/* Student Resident Portal Card */}
                    <div className="neo-card p-8 bg-white border-3 border-black flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-mono text-xs font-black bg-[#FFD93D] text-black px-2.5 py-1 rounded uppercase border border-black">
                                    Resident Services
                                </span>
                                <span className="text-xs font-bold text-gray-500">Neeladri & Velankani</span>
                            </div>
                            <h2 className="text-2xl font-black text-black mb-3">
                                Student Living Portal
                            </h2>
                            <p className="text-xs text-gray-600 leading-relaxed mb-6">
                                Designed specifically for hostel boarders to submit maintenance requests with verified room numbers, attach photo or PDF documentation, and track SLA countdown clocks in real-time.
                            </p>

                            <div className="space-y-3 font-mono text-xs text-gray-700">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Verified hostel & room numbering structure</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Upload repair photos, bills, and PDF documents</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Real-time chat with technicians over WebSockets</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Auto-resume paused SLA upon replying to queries</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t-2 border-black/10">
                            <Link
                                to="/signup"
                                className="neo-btn bg-[#FFD93D] text-black text-xs py-3 w-full font-black uppercase text-center block"
                            >
                                Register Student Account
                            </Link>
                        </div>
                    </div>

                    {/* Warden & Staff Command Card */}
                    <div className="neo-card p-8 bg-white border-3 border-black flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-mono text-xs font-black bg-[#FF5252] text-white px-2.5 py-1 rounded uppercase border border-black">
                                    Administrative Command
                                </span>
                                <span className="text-xs font-bold text-gray-500">Wardens & Technicians</span>
                            </div>
                            <h2 className="text-2xl font-black text-black mb-3">
                                Hostel Staff Operations
                            </h2>
                            <p className="text-xs text-gray-600 leading-relaxed mb-6">
                                Comprehensive workflow automation for Chief Wardens, Assistant Wardens, and Maintenance Technicians with strict cryptographic access control.
                            </p>

                            <div className="space-y-3 font-mono text-xs text-gray-700">
                                <div className="flex items-start gap-2">
                                    <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                    <span>Zero Privilege Escalation (Secured via Master Staff Key)</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Drag & Drop Kanban ticket lifecycle dispatch</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Internal staff notes hidden from students</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Wardens can onboard assistant wardens & technicians</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t-2 border-black/10">
                            <Link
                                to="/login"
                                className="neo-btn bg-black text-[#FFD93D] text-xs py-3 w-full font-black uppercase text-center block"
                            >
                                Staff & Warden Sign In
                            </Link>
                        </div>
                    </div>

                </div>

            </div>

            {/* Footer */}
            <footer className="border-t-3 border-black bg-white py-6 text-center text-xs font-mono font-bold text-gray-600">
                HOSTELFLOW // Scaler Campus Operations Infrastructure • All rights reserved
            </footer>
        </div>
    );
};

export default Landing;
