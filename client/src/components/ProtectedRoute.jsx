import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFFDF5]">
                <div className="neo-card p-8 flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-black border-t-[#FFD93D] rounded-full animate-spin" />
                    <span className="font-bold text-sm tracking-wider uppercase">Authenticating Session...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
