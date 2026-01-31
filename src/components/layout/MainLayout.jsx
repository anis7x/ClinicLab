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

const SocialLink = ({ href, icon: Icon, label, hoverClass, tooltipClass, arrowClass }) => (
    <a
        href={href}
        className={cn("relative group text-slate-400 transition-colors transform hover:scale-110", hoverClass)}
    >
        <Icon className="h-5 w-5" />
        <span className={cn(
            "absolute bottom-full mb-2 px-2 py-1 text-xs font-bold text-white bg-slate-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg pointer-events-none",
            tooltipClass || "left-1/2 -translate-x-1/2"
        )}>
            {label}
            <span className={cn(
                "absolute top-full -mt-1 border-4 border-transparent border-t-slate-900",
                arrowClass || "left-1/2 -translate-x-1/2"
            )}></span>
        </span>
    </a>
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
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-gradient-to-tr from-accent to-primary p-2 rounded-lg transition-transform group-hover:scale-105 shadow-lg shadow-primary/20">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-slate-900 tracking-wide">
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
                                        ? "text-primary"
                                        : "text-slate-600"
                                )}
                            >
                                {link.name}
                                <span className={cn(
                                    "absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full",
                                    location.pathname === link.path ? "w-full" : ""
                                )} />
                            </Link>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/auth/login" className="text-slate-600 hover:text-primary transition-colors text-sm font-medium">
                            دخول المرضى
                        </Link>
                        <Link
                            to="/auth/register"
                            className="bg-primary text-white hover:bg-primary/90 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95"
                        >
                            انضم إلينا كشريك
                        </Link>
                    </div>

                    {/* Mobile Menu Button - Enhanced Design */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center justify-center p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-primary hover:text-white transition-all duration-300 shadow-sm border border-slate-200"
                            aria-label="Toggle Menu"
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
                        className="md:hidden bg-white border-b border-slate-200 overflow-hidden shadow-xl"
                    >
                        <div className="px-4 py-4 space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className="block text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                                <Link
                                    to="/auth/login"
                                    onClick={() => setIsOpen(false)}
                                    className="text-center text-slate-600 hover:text-primary py-2 font-medium"
                                >
                                    دخول المرضى
                                </Link>
                                <Link
                                    to="/auth/register"
                                    onClick={() => setIsOpen(false)}
                                    className="bg-primary text-white text-center py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
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
    <footer className="relative z-10 border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">

            {/* Copyright */}
            <div className="text-slate-500 text-sm order-2 md:order-1 font-medium">
                © 2026 ClinicLab. جميع الحقوق محفوظة.
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-6 order-1 md:order-2">
                <SocialLink href="#" icon={Facebook} label="فيسبوك" hoverClass="hover:text-[#1877F2]" />
                <SocialLink href="#" icon={Instagram} label="انستغرام" hoverClass="hover:text-[#E4405F]" />
                <SocialLink href="#" icon={TiktokIcon} label="تيك توك" hoverClass="hover:text-slate-900" />
                <SocialLink href="#" icon={WhatsappIcon} label="واتساب" hoverClass="hover:text-[#25D366]" />
                <SocialLink
                    href="#"
                    icon={Mail}
                    label="البريد الإلكتروني"
                    hoverClass="hover:text-primary"
                    tooltipClass="left-0 translate-x-[-10%]"
                    arrowClass="left-[30%]"
                />
            </div>
        </div>
    </footer>
);

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary/30 selection:text-primary">
            <Navbar />
            <main className="pt-20 min-h-screen">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
