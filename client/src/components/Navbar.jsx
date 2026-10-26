import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { axiosInstance } from '../axiosCalls/axios';
import AddStaffModal from './AddStaffModal';
import {
    ShieldAlert,
    UserCheck,
    LogOut,
    RefreshCw,
    Activity,
    Layers,
    MapPin,
    UserPlus
} from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { connected } = useSocket();
    const navigate = useNavigate();

    const [triggeringCron, setTriggeringCron] = useState(false);
    const [cronMessage, setCronMessage] = useState(null);
    const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleTriggerCron = async () => {
        setTriggeringCron(true);
        setCronMessage(null);
        try {
            const res = await axiosInstance.post('/sla/trigger-check');
            setCronMessage(`SLA Cron executed: ${res.data.breachedCount} breached ticket(s) evaluated.`);
            setTimeout(() => setCronMessage(null), 4000);
        } catch (err) {
            setCronMessage('Cron evaluation failed.');
            setTimeout(() => setCronMessage(null), 3000);
        } finally {
            setTriggeringCron(false);
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'Warden':
                return 'bg-[#FF5252] text-white';
            case 'Technician':
                return 'bg-[#38E54D] text-black';
            case 'Student':
            default:
                return 'bg-[#FFD93D] text-black';
        }
    };

    return (
        <>
            <header className="sticky top-0 z-40 bg-white border-b-3 border-black shadow-[0_4px_0_0_#000]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
                    
                    {/* Brand / Logo */}
                    <div className="flex items-center gap-3">
                        <Link to="/dashboard" className="flex items-center gap-2 group">
                            <div className="bg-[#FFD93D] border-2 border-black p-2 rounded neo-shadow-sm group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
                                <Layers className="w-5 h-5 text-black" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-extrabold text-xl tracking-tight text-black flex items-center gap-1 leading-none">
                                    HOSTEL<span className="bg-black text-[#FFD93D] px-1 rounded">FLOW</span>
                                </span>
                                <span className="font-mono text-[10px] text-gray-600 font-bold tracking-widest uppercase">
                                    SLA-Driven Resolution Hub
                                </span>
                            </div>
                        </Link>

                        {/* WebSocket status pill */}
                        <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 border border-black rounded text-[11px] font-mono">
                            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            <span className="text-gray-700 font-bold">{connected ? 'WS LIVE' : 'WS OFFLINE'}</span>
                        </div>
                    </div>

                    {/* Right controls */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        
                        {/* Warden Action: Onboard Staff */}
                        {user && user.role === 'Warden' && (
                            <button
                                onClick={() => setIsAddStaffOpen(true)}
                                title="Onboard new Technician or Assistant Warden"
                                className="neo-btn bg-[#FF5252] text-white text-xs px-2.5 py-1.5 flex items-center gap-1.5"
                            >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span className="font-bold">Onboard Staff</span>
                            </button>
                        )}

                        {/* SLA Cron Manual Trigger (Staff only) */}
                        {user && user.role === 'Warden' && (
                            <div className="relative">
                                <button
                                    onClick={handleTriggerCron}
                                    disabled={triggeringCron}
                                    title="Run automated 30-min SLA check now"
                                    className="neo-btn bg-[#FFD93D] text-black text-xs px-2.5 py-1.5 hidden md:flex items-center gap-1.5"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${triggeringCron ? 'animate-spin' : ''}`} />
                                    <span className="font-bold">Run SLA Cron</span>
                                </button>
                                {cronMessage && (
                                    <div className="absolute right-0 top-10 whitespace-nowrap bg-black text-[#FFD93D] text-[11px] font-mono font-bold px-2 py-1 rounded shadow-lg border border-[#FFD93D] z-50">
                                        {cronMessage}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* User profile capsule */}
                        {user && (
                            <Link
                                to="/profile"
                                title="Account Profile & Settings (Click to manage)"
                                className="flex items-center gap-2 border-2 border-black bg-white hover:bg-[#FFFDF5] px-2.5 py-1 rounded neo-shadow-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer group"
                            >
                                <div className="flex flex-col text-right">
                                    <span className="font-extrabold text-xs text-black leading-tight truncate max-w-[140px] group-hover:underline">
                                        {user.fullname}
                                    </span>
                                    <div className="flex items-center justify-end gap-1 text-[10px] text-gray-500 truncate max-w-[140px]">
                                        <MapPin className="w-2.5 h-2.5 text-gray-400" />
                                        <span>{user.location}</span>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 border border-black rounded ${getRoleBadgeColor(user.role)}`}>
                                    {user.role}
                                </span>
                            </Link>
                        )}

                        {/* Logout */}
                        {user && (
                            <button
                                onClick={handleLogout}
                                title="Sign out of account"
                                className="neo-btn bg-white hover:bg-rose-50 text-black p-2"
                            >
                                <LogOut className="w-4 h-4 text-rose-600" />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Warden Staff Provisioning Modal */}
            <AddStaffModal
                isOpen={isAddStaffOpen}
                onClose={() => setIsAddStaffOpen(false)}
            />
        </>
    );
};

export default Navbar;
