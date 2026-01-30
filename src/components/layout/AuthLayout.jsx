import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function AuthLayout() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-900 text-white">
            {/* Background Mesh Gradient */}
            {/* Background Mesh Gradient */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="mb-8 text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-3xl font-bold text-white mb-2">
                        <Activity className="h-8 w-8 text-accent" />
                        <span>ClinicLab</span>
                    </Link>
                    <p className="text-slate-400">مستقبل التواصل في الرعاية الصحية</p>
                </div>

                <Outlet />
            </div>
        </div>
    );
}
