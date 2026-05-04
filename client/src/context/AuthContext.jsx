import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Initial Handshake: Ask the server "Who am I?"
    const checkAuth = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/me`, {
                withCredentials: true
            });
            if (res.data.user) {
                setUser(res.data.user);
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch (err) {
            console.error("Auth check failed status:", err.response?.status);
            console.error("Auth check failed message:", err.response?.data?.message || err.message);
            setUser(null);
            setIsAuthenticated(false);
            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        try {
            // Call a server-side logout to clear cookies
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/logout`, {}, { withCredentials: true });
            setUser(null);
            setIsAuthenticated(false);
            localStorage.clear(); // Clear any remaining legacy items
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, checkAuth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
