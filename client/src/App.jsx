import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import SLABreachBanner from './components/SLABreachBanner';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Landing from './Pages/Landing';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import Dashboard from './Pages/Dashboard';
import TicketDetails from './Pages/TicketDetails';
import Profile from './Pages/Profile';

function AppContent() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen flex flex-col bg-[#FFFDF5]">
            {user && <Navbar />}
            <main className="flex-1">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <PublicRoute>
                                <Landing />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/signup"
                        element={
                            <PublicRoute>
                                <Signup />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/tickets/:id"
                        element={
                            <ProtectedRoute>
                                <TicketDetails />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            <SLABreachBanner />
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <SocketProvider>
                    <AppContent />
                </SocketProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
