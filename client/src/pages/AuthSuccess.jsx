import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const refreshToken = params.get('refreshToken');

        if (token && refreshToken) {
            // Store tokens in localStorage
            localStorage.setItem('accessToken', token);
            localStorage.setItem('refreshToken', refreshToken);
            
            toast.success('Successfully logged in with Google!');
            
            // Redirect to home or dashboard
            navigate('/');
        } else {
            toast.error('Authentication failed. Please try again.');
            navigate('/login');
        }
    }, [location, navigate]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a] text-white">
            <div className="text-center">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-primary mx-auto"></div>
                <h1 className="text-2xl font-bold">Completing Authentication...</h1>
                <p className="mt-2 text-gray-400">Please wait while we set up your session.</p>
            </div>
        </div>
    );
};

export default AuthSuccess;
