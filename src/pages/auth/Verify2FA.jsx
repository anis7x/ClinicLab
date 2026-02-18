import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Verify2FA() {
    const navigate = useNavigate();
    const { verify2FA, pending2FA } = useAuth();
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [trustDevice, setTrustDevice] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (!pending2FA) {
            navigate('/auth/login');
        }
    }, [pending2FA, navigate]);

    useEffect(() => {
        // Auto-focus first input
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleDigitChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newDigits = [...digits];
        newDigits[index] = value.slice(-1);
        setDigits(newDigits);

        // Auto-advance to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits entered
        const fullCode = newDigits.join('');
        if (fullCode.length === 6) {
            handleSubmit(fullCode);
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newDigits = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
        setDigits(newDigits);
        if (pasted.length === 6) {
            handleSubmit(pasted);
        }
    };

    const handleSubmit = async (codeStr) => {
        const code = codeStr || digits.join('');
        if (code.length !== 6) {
            setError('أدخل الرمز المكون من 6 أرقام');
            return;
        }

        setError('');
        setLoading(true);
        try {
            const result = await verify2FA(code, trustDevice);
            const role = result.user?.role;
            if (role === 'CLINIC_ADMIN' || role === 'LAB_ADMIN') {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'الرمز غير صحيح');
            setDigits(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    if (!pending2FA) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-auto"
        >
            <div className="glass p-8 rounded-2xl bg-white border border-slate-200 shadow-xl">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Shield className="w-7 h-7 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">التحقق بخطوتين</h2>
                    <p className="text-sm text-slate-500">
                        أدخل الرمز من تطبيق المصادقة
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* 6-digit input */}
                <div className="flex justify-center gap-2 mb-6" dir="ltr">
                    {digits.map((digit, i) => (
                        <input
                            key={i}
                            ref={el => inputRefs.current[i] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleDigitChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            onPaste={handlePaste}
                            className="w-12 h-14 text-center text-2xl font-mono font-bold bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    ))}
                </div>

                <label className="flex items-center gap-2 mb-4 cursor-pointer justify-center text-sm text-slate-600">
                    <input
                        type="checkbox"
                        checked={trustDevice}
                        onChange={(e) => setTrustDevice(e.target.checked)}
                        className="rounded bg-slate-100 border-slate-300 text-primary focus:ring-primary"
                    />
                    الوثوق بهذا الجهاز لمدة 30 يوم
                </label>

                <button
                    onClick={() => handleSubmit()}
                    disabled={loading || digits.join('').length !== 6}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            تسجيل الدخول
                            <ArrowRight className="w-4 h-4 rotate-180" />
                        </>
                    )}
                </button>

                <div className="text-center mt-4">
                    <button
                        onClick={() => navigate('/auth/login')}
                        className="text-sm text-slate-400 hover:text-primary transition-colors"
                    >
                        استخدام رمز استرداد
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
