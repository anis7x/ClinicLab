import React from 'react';
import { Link } from 'react-router-dom';
import { User, Building2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterSelection() {
    return (
        <div className="grid gap-6">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <Link to="/auth/register/patient" className="group block p-6 glass rounded-2xl hover:bg-white/20 transition-all cursor-pointer border border-white/10 hover:border-accent/50">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-full bg-primary/20 text-primary-light group-hover:bg-accent group-hover:text-slate-900 transition-colors">
                            <User className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-accent transition-colors">أنا مريض</h3>
                            <p className="text-slate-400 text-sm">أنشئ حساباً مجانياً لحجز المواعيد وعرض النتائج.</p>
                        </div>
                        <ArrowRight className="text-slate-500 group-hover:text-white group-hover:-translate-x-1 transition-all rotate-180" />
                    </div>
                </Link>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Link to="/auth/register/professional" className="group block p-6 glass rounded-2xl hover:bg-white/20 transition-all cursor-pointer border border-white/10 hover:border-accent/50">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <Building2 className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">أنا مهني</h3>
                            <p className="text-slate-400 text-sm">سجل مختبرك أو عيادتك لتنمية أعمالك.</p>
                        </div>
                        <ArrowRight className="text-slate-500 group-hover:text-white group-hover:-translate-x-1 transition-all rotate-180" />
                    </div>
                </Link>
            </motion.div>

            <div className="text-center mt-4 text-sm text-slate-400">
                لديك حساب بالفعل؟{' '}
                <Link to="/auth/login" className="text-white hover:text-accent font-medium">
                    تسجيل الدخول
                </Link>
            </div>
        </div>
    );
}
