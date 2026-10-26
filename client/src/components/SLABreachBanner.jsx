import { AlertOctagon, X, ArrowRight } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";

const SLABreachBanner = () => {
    const { slaAlerts, dismissAlert } = useSocket();
    const navigate = useNavigate();

    if (!slaAlerts || slaAlerts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
            {slaAlerts.map((alert) => (
                <div
                    key={alert.id}
                    className="pointer-events-auto bg-[#140b0b] text-[#f2f2f2] border border-red-800/60 p-4 rounded-[6px] shadow-2xl flex flex-col gap-2.5 transition-all"
                >
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className="p-1 rounded-[4px] bg-red-950/80 border border-red-800/50 text-red-400">
                                <AlertOctagon className="w-4 h-4" />
                            </span>
                            <span className="font-mono text-[10px] tracking-wider uppercase bg-[#1a0f0f] border border-red-900/40 text-red-300 px-2 py-0.5 rounded-full">
                                Priority Escalation Alert
                            </span>
                        </div>
                        <button
                            onClick={() => dismissAlert(alert.id)}
                            className="text-[#8a8d91] hover:text-[#f2f2f2] cursor-pointer transition-colors p-1"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div>
                        <h4 className="font-medium text-xs text-[#f2f2f2] leading-tight bg-[#0a0a0a] p-2.5 border border-[#222222] rounded-[6px]">
                            {alert.title}
                        </h4>
                        <p className="text-[11px] text-[#8a8d91] mt-1.5 flex items-center justify-between">
                            <span>Location: <span className="text-[#f2f2f2] font-mono">{alert.studentLocation || "Hostel Campus"}</span></span>
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#222222]">
                        <div className="text-[11px] font-mono text-[#8a8d91]">
                            Priority: <span className="line-through opacity-60">{alert.oldPriority}</span> → <span className="text-amber-400 font-semibold">{alert.newPriority}</span>
                        </div>
                        <button
                            onClick={() => {
                                dismissAlert(alert.id);
                                navigate(`/tickets/${alert.ticketId}`);
                            }}
                            className="inline-flex items-center gap-1.5 bg-[#f2f2f2] text-[#0a0a0a] hover:bg-white text-xs font-medium px-3 py-1 rounded-full cursor-pointer transition-colors"
                        >
                            <span>Inspect Issue</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SLABreachBanner;
