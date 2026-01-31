import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, Calendar, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedPasswordInput from '../../components/ui/AnimatedPasswordInput';

export default function RegisterPatient() {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto"
        >
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">إنشاء حساب مريض</h2>
                <p className="text-slate-500">سجل الآن لمتابعة صحتك وحجز مواعيدك بسهولة</p>
            </div>

            <div className="glass p-8 rounded-2xl bg-white border border-slate-200 shadow-xl">
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">الاسم الكامل</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-10 text-slate-900 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all focus:bg-white"
                                placeholder=""
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-600 mb-1">البريد الإلكتروني</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="email"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-10 text-slate-900 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all focus:bg-white"
                                placeholder=""
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-600 mb-1">رقم الهاتف</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="tel"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-10 text-slate-900 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all focus:bg-white"
                                placeholder=""
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-600 mb-1">تاريخ الميلاد</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="date"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-10 text-slate-900 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all [color-scheme:light] focus:bg-white"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-600 mb-1">الجنس</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all focus:bg-white">
                                <option value="">اختر...</option>
                                <option value="male">ذكر</option>
                                <option value="female">أنثى</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-600 mb-1">كلمة المرور</label>
                        <AnimatedPasswordInput />
                    </div>

                    <div className="pt-2">
                        <button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group">
                            إنشاء الحساب
                            <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform rotate-180" />
                        </button>
                    </div>
                </form>
            </div>

            <div className="text-center mt-6">
                <Link to="/auth/login" className="text-slate-500 hover:text-primary flex items-center gap-2 justify-center transition-colors">
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                    <span>العودة لتسجيل الدخول</span>
                </Link>
            </div>
        </motion.div>
    );
}
