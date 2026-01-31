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
                <h2 className="text-3xl font-bold text-slate-900 mb-2">تسجيل شريك جديد</h2>
                <p className="text-slate-500">انضم إلى شبكتنا الطبية ووسع نطاق خدماتك</p>
            </div>

            <div className="glass p-8 rounded-2xl bg-white border border-slate-200 shadow-xl">
                <form className="space-y-6">
                    {/* Account Type Selection */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700">نوع الحساب</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div
                                onClick={() => setAccountType('clinic')}
                                className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${accountType === 'clinic'
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                    }`}
                            >
                                <Stethoscope className={`w-8 h-8 ${accountType === 'clinic' ? 'text-primary' : 'text-slate-400'}`} />
                                <span className="font-semibold">عيادة</span>
                            </div>
                            <div
                                onClick={() => setAccountType('lab')}
                                className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${accountType === 'lab'
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                    }`}
                            >
                                <Microscope className={`w-8 h-8 ${accountType === 'lab' ? 'text-primary' : 'text-slate-400'}`} />
                                <span className="font-semibold">مختبر</span>
                            </div>
                        </div>
                    </div>

                    {/* Organization Details */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-600 mb-1">اسم المؤسسة</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all focus:bg-white"
                                placeholder=""
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-600 mb-1">رقم الهاتف</label>
                            <input
                                type="tel"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all focus:bg-white"
                                placeholder=""
                            />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">البريد الإلكتروني المهني</label>
                        <input
                            type="email"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all focus:bg-white"
                            placeholder=""
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="block text-sm text-slate-600 mb-1">كلمة المرور</label>
                            <AnimatedPasswordInput />
                        </div>
                        <div className="relative">
                            <label className="block text-sm text-slate-600 mb-1">تأكيد كلمة المرور</label>
                            <AnimatedPasswordInput />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">العنوان / الموقع</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all focus:bg-white"
                                placeholder=""
                            />
                            <button type="button" className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-3 rounded-lg transition-colors border border-slate-200">
                                <Building2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group text-lg">
                            إتمام التسجيل
                            <ChevronRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform rotate-180" />
                        </button>
                    </div>
                </form>
            </div>

            <div className="text-center mt-6">
                <Link to="/auth/register" className="text-slate-500 hover:text-primary flex items-center gap-2 justify-center transition-colors">
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                    <span>العودة للاختيار</span>
                </Link>
            </div>
        </motion.div>
    );
}
