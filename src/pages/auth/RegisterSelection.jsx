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
                <Link to="/auth/register/patient" className="group block p-6 bg-white rounded-2xl hover:shadow-xl transition-all cursor-pointer border border-slate-200 hover:border-primary/50 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <User className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">أنا مريض</h3>
                            <p className="text-slate-500 text-sm">أنشئ حساباً مجانياً لحجز المواعيد وعرض النتائج.</p>
                        </div>
                        <ArrowRight className="text-slate-400 group-hover:text-primary group-hover:-translate-x-1 transition-all rotate-180" />
                    </div>
                </Link>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Link to="/auth/register/professional" className="group block p-6 bg-white rounded-2xl hover:shadow-xl transition-all cursor-pointer border border-slate-200 hover:border-primary/50 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <Building2 className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">أنا مهني</h3>
                            <p className="text-slate-500 text-sm">سجل مختبرك أو عيادتك لتنمية أعمالك.</p>
                        </div>
                        <ArrowRight className="text-slate-400 group-hover:text-emerald-600 group-hover:-translate-x-1 transition-all rotate-180" />
                    </div>
                </Link>
            </motion.div>

            <div className="text-center mt-4 text-sm text-slate-500">
                لديك حساب بالفعل؟{' '}
                <Link to="/auth/login" className="text-primary hover:text-primary-dark font-medium">
                    تسجيل الدخول
                </Link>
            </div>
        </div>
    );
}
