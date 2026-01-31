import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';

export default function AuthLayout() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 text-slate-900">
            {/* Background Mesh Gradient */}
            {/* Background Mesh Gradient */}
            {/* Background Mesh Gradient - Subtler for Light Mode */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px]" />
            </div>

            {/* Return to Home Button */}
            <Link
                to="/"
                className="absolute top-6 left-6 z-20 flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md"
            >
                <ArrowRight className="w-5 h-5 flip-rtl" />
                <span>العودة للرئيسية</span>
            </Link>

            <div className="relative z-10 w-full max-w-md">
                <div className="mb-8 text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-3xl font-bold text-slate-900 mb-2">
                        <Activity className="h-8 w-8 text-primary" />
                        <span>ClinicLab</span>
                    </Link>
                    <p className="text-slate-500">مستقبل التواصل في الرعاية الصحية</p>
                </div>

                <Outlet />
            </div>
        </div>
    );
}
