import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const AuthSuccess = () => {
    const navigate = useNavigate();
    const { checkAuth } = useAuth();
    const hasCalled = useRef(false);

    useEffect(() => {
        if (hasCalled.current) return;
        hasCalled.current = true;

        const finalizeAuth = async () => {
            const success = await checkAuth();
            if (success) {
                toast.success('Successfully logged in with Google!');
                navigate('/');
            } else {
                toast.error('Authentication failed. Please login again.');
                navigate('/login');
            }
        };
        finalizeAuth();
    }, [navigate, checkAuth]);

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
