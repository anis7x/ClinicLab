import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedPasswordInput from '../../components/ui/AnimatedPasswordInput';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPatient() {
    const navigate = useNavigate();
    const { registerPatient } = useAuth();
    const [form, setForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const updateField = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.full_name || !form.email || !form.password) {
            setError('الاسم، البريد الإلكتروني وكلمة المرور مطلوبة');
            return;
        }
        if (form.password.length < 6) {
            setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        setLoading(true);
        try {
            await registerPatient(form);
            navigate('/');
        } catch (err) {
            setError(err.message || 'حدث خطأ أثناء إنشاء الحساب');
        } finally {
            setLoading(false);
        }
    };

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
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">الاسم الكامل</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                value={form.full_name}
                                onChange={updateField('full_name')}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-10 text-slate-900 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all focus:bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-600 mb-1">البريد الإلكتروني</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="email"
                                value={form.email}
                                onChange={updateField('email')}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-10 text-slate-900 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all focus:bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-600 mb-1">رقم الهاتف</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={updateField('phone')}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-10 text-slate-900 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all focus:bg-white"
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
                                    value={form.date_of_birth}
                                    onChange={updateField('date_of_birth')}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-10 text-slate-900 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all [color-scheme:light] focus:bg-white"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-600 mb-1">الجنس</label>
                            <select
                                value={form.gender}
                                onChange={updateField('gender')}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all focus:bg-white"
                            >
                                <option value="">اختر...</option>
                                <option value="male">ذكر</option>
                                <option value="female">أنثى</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-600 mb-1">كلمة المرور</label>
                        <AnimatedPasswordInput
                            value={form.password}
                            onChange={updateField('password')}
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    إنشاء الحساب
                                    <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform rotate-180" />
                                </>
                            )}
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
