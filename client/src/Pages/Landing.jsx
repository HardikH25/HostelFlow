import { Link } from "react-router-dom";
import {
    Clock,
    ShieldCheck,
    Layers,
    ArrowRight,
    MessageSquare,
    Building2,
    CheckCircle2,
    Users,
    KeyRound,
    Sparkles,
    Check
} from "lucide-react";

const Landing = () => {
    return (
        <div className="min-h-screen bg-[#050505] text-[#f2f2f2] font-sans selection:bg-[#3fd6c6] selection:text-[#050505] relative overflow-hidden">
            {/* Subtle radial light pool across hero */}
            <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] pointer-events-none opacity-40"
                style={{
                    background: "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 45%, transparent 70%)"
                }}
            />

            {/* Top Navigation */}
            <header className="border-b border-[#222222] bg-[#0e0e0e]/80 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-[1360px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[6px] bg-[#141414] border border-[#222222] flex items-center justify-center">
                            <Layers className="w-4 h-4 text-[#f2f2f2]" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-base tracking-tight text-[#f2f2f2]">
                                HOSTELFLOW
                            </span>
                            <span className="text-[11px] font-mono text-[#8a8d91] hidden sm:inline-block border-l border-[#222222] pl-2">
                                Campus Operations
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/login"
                            className="text-xs font-medium text-[#a6a9ad] hover:text-[#f2f2f2] px-4 py-2 rounded-full border border-[#222222] hover:border-[#303030] transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/signup"
                            className="text-xs font-medium bg-[#f2f2f2] text-[#0a0a0a] hover:bg-white px-4 py-2 rounded-full transition-colors flex items-center gap-1.5"
                        >
                            <span>Create Account</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-[1360px] mx-auto px-6 md:px-12 pt-16 pb-24 relative z-10">
                {/* Hero 12-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
                    {/* Left: Opening Statement */}
                    <div className="lg:col-span-7 flex flex-col justify-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-[#222222] text-[11px] font-mono text-[#a6a9ad] w-fit mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3fd6c6] animate-pulse" />
                            <span className="text-[#3fd6c6] font-medium">Scaler School of Technology</span>
                            {/* <span className="text-[#55585d]">•</span> */}
                            {/* <span>Neeladri &amp; Velankani Hostels</span> */}
                        </div>

                        <h1 className="text-4xl sm:text-6xl xl:text-7xl font-normal text-[#f2f2f2] tracking-tight leading-[1.05] mb-6">
                            SST hostel issue resolution with guaranteed timelines.
                        </h1>

                        <p className="text-base sm:text-lg text-[#a6a9ad] leading-relaxed font-normal max-w-xl mb-8">
                            Dedicated facility management for Scaler School of Technology campus residents across Neeladri &amp; Velankani hostels. Continuous resolution monitoring, automated priority escalation, instant messaging, and verifiable accountability.
                        </p>

                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                to="/signup"
                                className="px-6 py-3 rounded-full bg-[#f2f2f2] text-[#0a0a0a] hover:bg-white text-xs font-medium flex items-center gap-2 transition-all shadow-sm"
                            >
                                <span>Register as SST Student</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                to="/login"
                                className="px-6 py-3 rounded-full bg-[#0e0e0e] border border-[#222222] hover:border-[#303030] text-[#f2f2f2] text-xs font-medium flex items-center gap-2 transition-colors"
                            >
                                <span>Staff &amp; Warden Access</span>
                                <ArrowRight className="w-4 h-4 text-[#8a8d91]" />
                            </Link>
                        </div>
                    </div>

                    {/* Right: Graphite Product Object Preview */}
                    <div className="lg:col-span-5">
                        <div className="rounded-[6px] bg-[#0e0e0e] border border-[#222222] p-5 shadow-2xl relative">
                            {/* Window header */}
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#222222]">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] border border-[#e0443e]/40 shadow-sm" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] border border-[#dea123]/40 shadow-sm" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f] border border-[#1aab29]/40 shadow-sm" />
                                    <span className="text-[11px] font-mono text-[#8a8d91] ml-2 font-medium">Console</span>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#141414] border border-[#222222] text-[10px] font-mono text-[#3fd6c6]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#3fd6c6]" />
                                    Campus Network
                                </span>
                            </div>

                            {/* Ticket preview card */}
                            <div className="space-y-3">
                                <div className="p-3.5 rounded-[6px] bg-[#141414] border border-[#222222]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-mono text-[#8a8d91]">#HF-8291 • Electrical</span>
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
                                            3h 42m remaining
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-[#f2f2f2] mb-1">
                                        Ceiling fan regulator short-circuit in Room B2-304
                                    </p>
                                    <div className="flex items-center justify-between text-[11px] text-[#8a8d91] pt-2 border-t border-[#1f1f1f]">
                                        <span>Neeladri Hostel • Block B</span>
                                        <span className="text-[#a6a9ad]">Assigned: Ramesh K.</span>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-[6px] bg-[#141414] border border-[#222222]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-mono text-[#8a8d91]">#HF-8288 • Plumbing</span>
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/40 text-amber-300">
                                            Paused (Awaiting Reply)
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-[#f2f2f2] mb-1">
                                        Water heater pipe leakage in 3rd floor bathroom
                                    </p>
                                    <div className="flex items-center justify-between text-[11px] text-[#8a8d91] pt-2 border-t border-[#1f1f1f]">
                                        <span>SST Velankani Hostel • 3rd Floor</span>
                                        <span className="text-[#a6a9ad]">Assigned: Suresh V.</span>
                                    </div>
                                </div>

                                <div className="p-3 rounded-[6px] bg-[#090909] border border-[#1a1a1a] flex items-center justify-between text-[11px] text-[#8a8d91]">
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-[#3fd6c6]" />
                                        <span>Resolution Sweeps Active</span>
                                    </span>
                                    <span className="font-mono text-[#a6a9ad]">Zero Breaches Today</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ruled Row of Facts */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-[#222222] mb-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-normal text-[#f2f2f2] tracking-tight mb-1.5">
                            100%
                        </div>
                        <div className="text-xs font-mono text-[#8a8d91] uppercase tracking-wider">
                            Accountability Coverage
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-normal text-[#f2f2f2] tracking-tight mb-1.5">
                            3-Way Chat
                        </div>
                        <div className="text-xs font-mono text-[#8a8d91] uppercase tracking-wider">
                            Students, Wardens &amp; Staff
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-normal text-[#f2f2f2] tracking-tight mb-1.5">
                            2 SST Hostels
                        </div>
                        <div className="text-xs font-mono text-[#8a8d91] uppercase tracking-wider">
                            Neeladri &amp; Velankani
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-normal text-[#f2f2f2] tracking-tight mb-1.5">
                            Zero Delay
                        </div>
                        <div className="text-xs font-mono text-[#8a8d91] uppercase tracking-wider">
                            Synchronized Updates
                        </div>
                    </div>
                </div>

                {/* 3-Column Core Capabilities Grid */}
                <div className="mb-20">
                    <div className="max-w-xl mb-10">
                        <span className="text-xs font-mono uppercase tracking-wider text-[#3fd6c6] block mb-2">
                            Infrastructure Architecture
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-normal text-[#f2f2f2] tracking-tight">
                            Engineered for rapid campus issue resolution.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-[6px] bg-[#0e0e0e] border border-[#222222] flex flex-col justify-between">
                            <div>
                                <div className="w-9 h-9 rounded-[6px] bg-[#141414] border border-[#222222] flex items-center justify-center mb-5">
                                    <Clock className="w-4 h-4 text-[#f2f2f2]" />
                                </div>
                                <h3 className="text-base font-medium text-[#f2f2f2] mb-2">
                                    Guaranteed Resolution Timelines
                                </h3>
                                <p className="text-xs text-[#a6a9ad] leading-relaxed">
                                    Continuous background evaluation monitors every active maintenance request. Tickets nearing deadlines escalate automatically to guarantee swift resolution.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-[#1f1f1f] text-[11px] font-mono text-[#8a8d91]">
                                Auto-pause on clarification
                            </div>
                        </div>

                        <div className="p-6 rounded-[6px] bg-[#0e0e0e] border border-[#222222] flex flex-col justify-between">
                            <div>
                                <div className="w-9 h-9 rounded-[6px] bg-[#141414] border border-[#222222] flex items-center justify-center mb-5">
                                    <MessageSquare className="w-4 h-4 text-[#f2f2f2]" />
                                </div>
                                <h3 className="text-base font-medium text-[#f2f2f2] mb-2">
                                    Real-Time Live Coordination
                                </h3>
                                <p className="text-xs text-[#a6a9ad] leading-relaxed">
                                    Instant communication between students, wardens, and technicians. Staff can record private internal notes to diagnose and coordinate repairs effectively.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-[#1f1f1f] text-[11px] font-mono text-[#8a8d91]">
                                Instant zero-refresh sync
                            </div>
                        </div>

                        <div className="p-6 rounded-[6px] bg-[#0e0e0e] border border-[#222222] flex flex-col justify-between">
                            <div>
                                <div className="w-9 h-9 rounded-[6px] bg-[#141414] border border-[#222222] flex items-center justify-center mb-5">
                                    <ShieldCheck className="w-4 h-4 text-[#f2f2f2]" />
                                </div>
                                <h3 className="text-base font-medium text-[#f2f2f2] mb-2">
                                    Streamlined Dispatch Operations
                                </h3>
                                <p className="text-xs text-[#a6a9ad] leading-relaxed">
                                    Visual board allowing hostel administrators to rapidly route, assign, and track maintenance tasks across all campus blocks with verified role permissions.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-[#1f1f1f] text-[11px] font-mono text-[#8a8d91]">
                                Secure role boundaries
                            </div>
                        </div>
                    </div>
                </div>

                {/* Role Portals Showcase */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    {/* Student Portal Card */}
                    <div className="p-8 rounded-[6px] bg-[#0e0e0e] border border-[#222222] flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-mono text-[11px] text-[#a6a9ad] uppercase tracking-wider">
                                    Resident Services
                                </span>
                                <span className="text-[11px] font-mono text-[#8a8d91]">
                                    Neeladri &amp; Velankani
                                </span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-normal text-[#f2f2f2] tracking-tight mb-3">
                                Student Living Portal
                            </h2>
                            <p className="text-xs text-[#a6a9ad] leading-relaxed mb-6">
                                Designed specifically for SST hostel residents to submit maintenance requests with verified room numbers, attach photo or PDF documentation, and track guaranteed resolution timelines.
                            </p>

                            <div className="space-y-3 font-mono text-xs text-[#a6a9ad]">
                                <div className="flex items-start gap-2.5">
                                    <Check className="w-4 h-4 text-[#3fd6c6] shrink-0 mt-0.5" />
                                    <span>SST hostel &amp; room numbering structure</span>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <Check className="w-4 h-4 text-[#3fd6c6] shrink-0 mt-0.5" />
                                    <span>Upload repair photos, bills, and PDF documents</span>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <Check className="w-4 h-4 text-[#3fd6c6] shrink-0 mt-0.5" />
                                    <span>Direct live coordination with maintenance staff</span>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <Check className="w-4 h-4 text-[#3fd6c6] shrink-0 mt-0.5" />
                                    <span>Auto-resume paused timelines upon replying</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-[#1f1f1f]">
                            <Link
                                to="/signup"
                                className="w-full py-3 rounded-full bg-[#f2f2f2] text-[#0a0a0a] hover:bg-white text-xs font-medium text-center block transition-colors"
                            >
                                Register SST Student Account
                            </Link>
                        </div>
                    </div>

                    {/* Warden & Staff Command Card */}
                    <div className="p-8 rounded-[6px] bg-[#0e0e0e] border border-[#222222] flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-mono text-[11px] text-[#a6a9ad] uppercase tracking-wider">
                                    Administrative Command
                                </span>
                                <span className="text-[11px] font-mono text-[#8a8d91]">
                                    SST Wardens &amp; Technicians
                                </span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-normal text-[#f2f2f2] tracking-tight mb-3">
                                Hostel Staff Operations
                            </h2>
                            <p className="text-xs text-[#a6a9ad] leading-relaxed mb-6">
                                Comprehensive workflow automation for Chief Wardens, Assistant Wardens, and Maintenance Technicians with strict hostel data isolation.
                            </p>

                            <div className="space-y-3 font-mono text-xs text-[#a6a9ad]">
                                <div className="flex items-start gap-2.5">
                                    <Check className="w-4 h-4 text-[#3fd6c6] shrink-0 mt-0.5" />
                                    <span>Escalations by wardens</span>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <Check className="w-4 h-4 text-[#3fd6c6] shrink-0 mt-0.5" />
                                    <span>Interactive visual ticket dispatch and assignment</span>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <Check className="w-4 h-4 text-[#3fd6c6] shrink-0 mt-0.5" />
                                    <span>Internal staff notes hidden from students</span>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <Check className="w-4 h-4 text-[#3fd6c6] shrink-0 mt-0.5" />
                                    <span>Wardens onboard assistant wardens &amp; technicians</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-[#1f1f1f]">
                            <Link
                                to="/login"
                                className="w-full py-3 rounded-full bg-[#141414] border border-[#222222] hover:border-[#303030] text-[#f2f2f2] text-xs font-medium text-center block transition-colors"
                            >
                                Staff &amp; Warden Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-[#222222] bg-[#080808] py-8">
                <div className="max-w-[1360px] mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#8a8d91]">
                    <div>
                        HostelFlow
                    </div>
                    <div>
                        Neeladri &amp; Velankani Hostels • All rights reserved
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
