import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a] text-white">
                <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-blue-500 mx-auto"></div>
                    <h1 className="text-xl font-bold">Checking session...</h1>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
