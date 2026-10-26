import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { axiosInstance } from "../axiosCalls/axios";
import AddStaffModal from "./AddStaffModal";
import {
    LogOut,
    RefreshCw,
    Layers,
    MapPin,
    UserPlus
} from "lucide-react";

const Navbar = () => {
    const { user, logout } = useAuth();
    const { connected } = useSocket();
    const navigate = useNavigate();

    const [triggeringCheck, setTriggeringCheck] = useState(false);
    const [checkMessage, setCheckMessage] = useState(null);
    const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const handleTriggerCheck = async () => {
        setTriggeringCheck(true);
        setCheckMessage(null);
        try {
            const res = await axiosInstance.post("/sla/trigger-check");
            setCheckMessage(`Resolution audit complete: ${res.data.breachedCount || 0} issue(s) reviewed.`);
            setTimeout(() => setCheckMessage(null), 3500);
        } catch {
            setCheckMessage("Audit check temporarily unavailable.");
            setTimeout(() => setCheckMessage(null), 3000);
        } finally {
            setTriggeringCheck(false);
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case "Warden":
                return "border-red-900/60 bg-red-950/30 text-red-300";
            case "Technician":
                return "border-emerald-900/60 bg-emerald-950/30 text-emerald-300";
            case "Student":
            default:
                return "border-[#303030] bg-[#141414] text-[#a6a9ad]";
        }
    };

    return (
        <>
            <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-md border-b border-[#222222]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    
                    {/* Brand Identity */}
                    <div className="flex items-center gap-3.5">
                        <Link to="/dashboard" className="flex items-center gap-2.5 group">
                            <div className="bg-[#0e0e0e] border border-[#222222] group-hover:border-[#303030] p-1.5 rounded-[6px] transition-colors">
                                <Layers className="w-4 h-4 text-[#f2f2f2]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm tracking-tight text-[#f2f2f2] flex items-center gap-1 leading-none">
                                    HOSTEL<span className="text-[#3fd6c6]">FLOW</span>
                                </span>
                                <span className="text-[10px] text-[#717478] font-mono tracking-wider uppercase mt-0.5">
                                    Campus Maintenance
                                </span>
                            </div>
                        </Link>

                        {/* Subtle Live Sync Indicator */}
                        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#0e0e0e] border border-[#222222] rounded-full text-[11px] font-mono">
                            <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-[#3fd6c6]" : "bg-red-500"}`} />
                            <span className="text-[#a6a9ad] text-[10px] tracking-wide">
                                {connected ? "Live Sync" : "Reconnecting"}
                            </span>
                        </div>
                    </div>

                    {/* Operational Controls */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        
                        {/* Warden Action: Onboard Staff */}
                        {user && user.role === "Warden" && (
                            <button
                                onClick={() => setIsAddStaffOpen(true)}
                                title="Onboard new Technician or Assistant Warden"
                                className="neo-btn bg-[#0e0e0e] text-[#f2f2f2] border border-[#222222] hover:border-[#303030] hover:bg-[#141414] px-3.5 py-1.5 text-xs rounded-full flex items-center gap-1.5"
                            >
                                <UserPlus className="w-3.5 h-3.5 text-[#3fd6c6]" />
                                <span>Onboard Staff</span>
                            </button>
                        )}

                        {/* Warden Action: Verify Resolution Deadlines */}
                        {user && user.role === "Warden" && (
                            <div className="relative">
                                <button
                                    onClick={handleTriggerCheck}
                                    disabled={triggeringCheck}
                                    title="Audit and verify issue resolution timelines"
                                    className="neo-btn bg-[#0e0e0e] text-[#f2f2f2] border border-[#222222] hover:border-[#303030] hover:bg-[#141414] px-3 py-1.5 text-xs rounded-full hidden md:flex items-center gap-1.5"
                                >
                                    <RefreshCw className={`w-3 h-3 text-[#a6a9ad] ${triggeringCheck ? "animate-spin" : ""}`} />
                                    <span>Verify Deadlines</span>
                                </button>
                                {checkMessage && (
                                    <div className="absolute right-0 top-9 whitespace-nowrap bg-[#0e0e0e] text-[#f2f2f2] text-[11px] font-mono px-3 py-1.5 rounded border border-[#222222] shadow-xl z-50">
                                        {checkMessage}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* User Profile Capsule */}
                        {user && (
                            <Link
                                to="/profile"
                                title="Account Settings & Profile"
                                className="flex items-center gap-2.5 border border-[#222222] bg-[#0e0e0e] hover:border-[#303030] hover:bg-[#121212] px-3 py-1 rounded-full transition-colors group cursor-pointer"
                            >
                                <div className="flex flex-col text-right">
                                    <span className="font-medium text-xs text-[#f2f2f2] leading-tight truncate max-w-[130px]">
                                        {user.fullname}
                                    </span>
                                    <div className="flex items-center justify-end gap-1 text-[10px] text-[#717478] truncate max-w-[130px]">
                                        <MapPin className="w-2.5 h-2.5 text-[#55585d]" />
                                        <span>{user.location}</span>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-mono font-medium px-2 py-0.5 border rounded-full ${getRoleBadge(user.role)}`}>
                                    {user.role}
                                </span>
                            </Link>
                        )}

                        {/* Sign Out */}
                        {user && (
                            <button
                                onClick={handleLogout}
                                title="Sign out"
                                className="neo-btn bg-[#0e0e0e] text-[#717478] hover:text-[#f2f2f2] border border-[#222222] hover:border-[#303030] p-1.5 rounded-full"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <AddStaffModal
                isOpen={isAddStaffOpen}
                onClose={() => setIsAddStaffOpen(false)}
            />
        </>
    );
};

export default Navbar;
