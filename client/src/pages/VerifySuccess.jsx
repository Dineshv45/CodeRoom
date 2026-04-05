import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const VerifySuccess = () => {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a] text-white">
            <div className="text-center">
                <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
                <h1 className="text-3xl font-bold">Email Verified!</h1>
                <p className="mt-4 text-gray-400 max-w-md mx-auto">
                    Your email address has been successfully verified. You can now log in to the CodeRoom.
                </p>
                <div className="mt-8">
                    <Link
                        to="/login"
                        className="rounded-lg bg-[#3b82f6] px-8 py-3 font-semibold text-white transition hover:bg-opacity-90"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerifySuccess;
