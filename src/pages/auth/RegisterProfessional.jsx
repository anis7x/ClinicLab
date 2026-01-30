import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, ChevronRight, ArrowLeft, Stethoscope, Microscope } from 'lucide-react';
import AnimatedPasswordInput from '../../components/ui/AnimatedPasswordInput';
import { Link } from 'react-router-dom';

export default function RegisterProfessional() {
    // Default account type can be empty or set to one of them
    const [accountType, setAccountType] = useState('clinic'); // 'clinic' or 'lab'
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto"
        >
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">تسجيل شريك جديد</h2>
                <p className="text-slate-400">انضم إلى شبكتنا الطبية ووسع نطاق خدماتك</p>
            </div>

            <div className="glass p-8 rounded-2xl bg-white/5 border-white/10 shadow-xl">
                <form className="space-y-6">
                    {/* Account Type Selection */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-300">نوع الحساب</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div
                                onClick={() => setAccountType('clinic')}
                                className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${accountType === 'clinic'
                                    ? 'bg-primary/20 border-accent text-white'
                                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                    }`}
                            >
                                <Stethoscope className={`w-8 h-8 ${accountType === 'clinic' ? 'text-accent' : 'text-slate-500'}`} />
                                <span className="font-semibold">عيادة</span>
                            </div>
                            <div
                                onClick={() => setAccountType('lab')}
                                className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${accountType === 'lab'
                                    ? 'bg-primary/20 border-accent text-white'
                                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                    }`}
                            >
                                <Microscope className={`w-8 h-8 ${accountType === 'lab' ? 'text-accent' : 'text-slate-500'}`} />
                                <span className="font-semibold">مختبر</span>
                            </div>
                        </div>
                    </div>

                    {/* Organization Details */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-300 mb-1">اسم المؤسسة</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none focus:ring-1 focus:ring-accent transition-all"
                                placeholder=""
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 mb-1">رقم الهاتف</label>
                            <input
                                type="tel"
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none focus:ring-1 focus:ring-accent transition-all"
                                placeholder=""
                            />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <label className="block text-sm text-slate-300 mb-1">البريد الإلكتروني المهني</label>
                        <input
                            type="email"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none focus:ring-1 focus:ring-accent transition-all"
                            placeholder=""
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="block text-sm text-slate-300 mb-1">كلمة المرور</label>
                            <AnimatedPasswordInput />
                        </div>
                        <div className="relative">
                            <label className="block text-sm text-slate-300 mb-1">تأكيد كلمة المرور</label>
                            <AnimatedPasswordInput />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm text-slate-300 mb-1">العنوان / الموقع</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none focus:ring-1 focus:ring-accent transition-all"
                                placeholder=""
                            />
                            <button type="button" className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-colors border border-white/10">
                                <Building2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button className="w-full bg-primary hover:bg-primary-light text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group text-lg">
                            إتمام التسجيل
                            <ChevronRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform rotate-180" />
                        </button>
                    </div>
                </form>
            </div>

            <div className="text-center mt-6">
                <Link to="/auth/register" className="text-slate-400 hover:text-white flex items-center gap-2 justify-center transition-colors">
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                    <span>العودة للاختيار</span>
                </Link>
            </div>
        </motion.div>
    );
}
