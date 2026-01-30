import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedPasswordInput from '../../components/ui/AnimatedPasswordInput';

export default function Login() {
    // const [showPassword, setShowPassword] = React.useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 rounded-2xl bg-white/10 dark:bg-slate-800/50"
        >
            <h2 className="text-2xl font-bold mb-6 text-center">مرحباً بعودتك</h2>

            <form className="space-y-4">
                <div>
                    <label className="block text-sm text-slate-300 mb-1">البريد الإلكتروني</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="email"
                            placeholder=""
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-accent transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-slate-300 mb-1">كلمة المرور</label>
                    <AnimatedPasswordInput />
                </div>

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input type="checkbox" className="rounded bg-white/10 border-white/20 text-accent focus:ring-accent" />
                        تذكرني
                    </label>
                    <Link to="/auth/forgot-password" className="text-accent hover:text-accent-hover">
                        نسيت كلمة المرور؟
                    </Link>
                </div>

                <button className="w-full bg-primary hover:bg-primary-light text-white py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-primary/50 flex items-center justify-center gap-2 group">
                    تسجيل الدخول
                    <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform rotate-180" />
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
                ليس لديك حساب؟{' '}
                <Link to="/auth/register" className="text-white hover:text-accent font-medium">
                    إنشاء حساب
                </Link>
            </div>
        </motion.div>
    );
}
