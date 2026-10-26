import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFFDF5]">
                <div className="neo-card p-6 flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-black border-t-[#FFD93D] rounded-full animate-spin" />
                    <span className="font-bold text-xs uppercase tracking-wider">Loading...</span>
                </div>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default PublicRoute;
