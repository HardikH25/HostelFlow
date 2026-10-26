import { AlertOctagon, X, ArrowRight } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const SLABreachBanner = () => {
    const { slaAlerts, dismissAlert } = useSocket();
    const navigate = useNavigate();

    if (!slaAlerts || slaAlerts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
            {slaAlerts.map((alert) => (
                <div
                    key={alert.id}
                    className="pointer-events-auto bg-[#FF5252] text-white border-3 border-black p-4 neo-shadow-md rounded-lg flex flex-col gap-2 transition-all animate-bounce"
                    style={{ animationIterationCount: 2 }}
                >
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className="p-1 bg-black text-[#FFD93D] rounded border border-black">
                                <AlertOctagon className="w-5 h-5" />
                            </span>
                            <span className="font-mono font-black text-xs tracking-wider uppercase bg-black text-white px-2 py-0.5 rounded">
                                SLA BREACH ESCALATION
                            </span>
                        </div>
                        <button
                            onClick={() => dismissAlert(alert.id)}
                            className="text-white hover:text-black cursor-pointer transition-colors p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div>
                        <h4 className="font-bold text-sm text-black leading-tight bg-white p-2 border-2 border-black rounded shadow-[2px_2px_0px_0px_#000]">
                            {alert.title}
                        </h4>
                        <p className="text-xs text-white font-medium mt-1">
                            Location: <span className="font-bold text-black bg-[#FFD93D] px-1 rounded">{alert.studentLocation || 'Hostel Campus'}</span>
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-red-300">
                        <div className="text-[11px] font-mono text-black font-bold">
                            Priority: <span className="line-through opacity-75">{alert.oldPriority}</span> → <span className="text-white bg-black px-1.5 py-0.5 rounded">{alert.newPriority}</span>
                        </div>
                        <button
                            onClick={() => {
                                dismissAlert(alert.id);
                                navigate(`/tickets/${alert.ticketId}`);
                            }}
                            className="inline-flex items-center gap-1 bg-white text-black text-xs font-bold px-2.5 py-1 border-2 border-black rounded shadow-[2px_2px_0px_0px_#000] hover:bg-[#FFD93D] cursor-pointer transition-colors"
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
