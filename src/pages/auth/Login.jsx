import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedPasswordInput from '../../components/ui/AnimatedPasswordInput';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);
            // Redirect based on role
            const role = result.user?.role;
            if (role === 'CLINIC_ADMIN' || role === 'LAB_ADMIN') {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 rounded-2xl bg-white border border-slate-200 shadow-xl"
        >
            <h2 className="text-2xl font-bold mb-6 text-center text-slate-900">مرحباً بعودتك</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm text-slate-600 mb-1">البريد الإلكتروني</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary transition-colors focus:bg-white"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-slate-600 mb-1">كلمة المرور</label>
                    <AnimatedPasswordInput
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                        <input type="checkbox" className="rounded bg-slate-100 border-slate-300 text-primary focus:ring-primary" />
                        تذكرني
                    </label>
                    <Link to="/auth/forgot-password" className="text-primary hover:text-primary-dark">
                        نسيت كلمة المرور؟
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-semibold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            تسجيل الدخول
                            <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform rotate-180" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
                ليس لديك حساب؟{' '}
                <Link to="/auth/register/patient" className="text-primary hover:text-primary-dark font-medium">
                    إنشاء حساب مريض
                </Link>
            </div>
        </motion.div >
    );
}
