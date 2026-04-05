import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const VerifyError = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const message = params.get('message') || 'The verification link is invalid or has expired.';

    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a] text-white">
            <div className="text-center">
                <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
                <h1 className="text-3xl font-bold">Verification Failed</h1>
                <p className="mt-4 text-gray-400 max-w-sm mx-auto">
                    {message}
                </p>
                <div className="mt-8 space-y-4">
                    <Link
                        to="/register"
                        className="block rounded-lg bg-[#3b82f6] px-8 py-3 font-semibold text-white transition hover:bg-opacity-90"
                    >
                        Try Registering Again
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyError;
