import { useEffect, useState, useContext, createContext, useCallback } from "react";
import { axiosInstance } from "../axiosCalls/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        try {
            const res = await axiosInstance.get('/auth/me');
            if (res.data?.success) {
                setUser(res.data.user);
            } else {
                setUser(null);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (email, password) => {
        try {
            const res = await axiosInstance.post('/auth/login', { email, password });
            if (res.data?.success) {
                setUser(res.data.user);
                return { success: true, user: res.data.user };
            }
            return { success: false, message: res.data?.message };
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
            return { success: false, message: msg };
        }
    };

    const register = async (formData) => {
        try {
            const res = await axiosInstance.post('/auth/register', formData);
            if (res.data?.success) {
                setUser(res.data.user);
                return { success: true, user: res.data.user };
            }
            return { success: false, message: res.data?.message };
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed.';
            return { success: false, message: msg };
        }
    };

    const logout = async () => {
        try {
            await axiosInstance.post('/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
        }
    };


    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                login,
                register,
                logout,
                checkAuth
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
