import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Menu, X, Facebook, Instagram, Mail } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// Social Icons Components for those not in Lucide or for specific styling
const TiktokIcon = ({ className }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

const WhatsappIcon = ({ className }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
    </svg>
);

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { name: 'الرئيسية', path: '/' },
        { name: 'خدماتنا', path: '/services' },
        { name: 'اتصل بنا', path: '/contact' },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 bg-gradient-to-r from-slate-900 via-[#0B1120] to-slate-900 backdrop-blur-md border-b border-white/5 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-gradient-to-tr from-accent to-primary p-2 rounded-lg transition-transform group-hover:scale-105 shadow-lg shadow-primary/20">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-wide">
                            ClinicLab
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={cn(
                                    "text-sm font-medium transition-all duration-300 hover:text-accent relative group",
                                    location.pathname === link.path
                                        ? "text-accent"
                                        : "text-slate-300"
                                )}
                            >
                                {link.name}
                                <span className={cn(
                                    "absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full",
                                    location.pathname === link.path ? "w-full" : ""
                                )} />
                            </Link>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/auth/login" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
                            دخول المرضى
                        </Link>
                        <Link
                            to="/auth/register"
                            className="bg-white text-slate-900 hover:bg-slate-100 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] active:scale-95"
                        >
                            انضم إلينا كشريك
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-slate-300 hover:text-white p-2 transition-colors"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-slate-900 border-b border-white/10 overflow-hidden"
                    >
                        <div className="px-4 py-4 space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className="block text-base font-medium text-slate-300 hover:text-accent"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                                <Link
                                    to="/auth/login"
                                    onClick={() => setIsOpen(false)}
                                    className="text-center text-slate-300 hover:text-white py-2"
                                >
                                    دخول المرضى
                                </Link>
                                <Link
                                    to="/auth/register"
                                    onClick={() => setIsOpen(false)}
                                    className="bg-white text-slate-900 text-center py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                                >
                                    انضم إلينا كشريك
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

const Footer = () => (
    <footer className="relative z-10 border-t border-white/5 bg-gradient-to-r from-slate-900 via-[#0B1120] to-slate-900 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">

            {/* Copyright */}
            <div className="text-slate-400 text-sm order-2 md:order-1">
                © 2026 ClinicLab. جميع الحقوق محفوظة.
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-6 order-1 md:order-2">
                <a href="#" className="text-slate-400 hover:text-[#1877F2] transition-colors transform hover:scale-110">
                    <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-[#E4405F] transition-colors transform hover:scale-110">
                    <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors transform hover:scale-110">
                    <TiktokIcon className="h-5 w-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-[#25D366] transition-colors transform hover:scale-110">
                    <WhatsappIcon className="h-5 w-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-accent transition-colors transform hover:scale-110">
                    <Mail className="h-5 w-5" />
                </a>
            </div>
        </div>
    </footer>
);

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-accent/30 selection:text-white">
            <Navbar />
            <main className="pt-20 min-h-screen">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
