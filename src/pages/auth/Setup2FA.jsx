import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, CheckCircle2, Copy, Download, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Setup2FA() {
    const navigate = useNavigate();
    const { totpUri, setup2FA, user, isAuthenticated, clearTotpUri } = useAuth();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [recoveryCodes, setRecoveryCodes] = useState(null);
    const [step, setStep] = useState('scan'); // 'scan' | 'verify' | 'recovery' | 'done'

    useEffect(() => {
        if (!isAuthenticated || !totpUri) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, totpUri, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (code.length !== 6) {
            setError('الرمز يجب أن يكون 6 أرقام');
            return;
        }

        setError('');
        setLoading(true);
        try {
            const result = await setup2FA(code);
            setRecoveryCodes(result.recovery_codes);
            setStep('recovery');
        } catch (err) {
            setError(err.message || 'الرمز غير صحيح');
        } finally {
            setLoading(false);
        }
    };

    const handleCodeChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
        setCode(val);
    };

    const handleCopyRecovery = () => {
        if (recoveryCodes) {
            navigator.clipboard.writeText(recoveryCodes.join('\n'));
        }
    };

    const handleDownloadRecovery = () => {
        if (recoveryCodes) {
            const text = `ClinicLab - رموز الاسترداد\n${'='.repeat(30)}\n\n${recoveryCodes.join('\n')}\n\nاحتفظ بهذه الرموز في مكان آمن. كل رمز يستخدم مرة واحدة فقط.`;
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cliniclab-recovery-codes.txt';
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const handleComplete = () => {
        clearTotpUri();
        navigate('/dashboard');
    };

    if (!totpUri) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg mx-auto"
        >
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">المصادقة الثنائية</h2>
                <p className="text-slate-500">أضف طبقة حماية إضافية لحسابك</p>
            </div>

            <div className="glass p-8 rounded-2xl bg-white border border-slate-200 shadow-xl">
                {(step === 'scan' || step === 'verify') && (
                    <>
                        {/* Step 1: QR Code */}
                        <div className="text-center mb-6">
                            <p className="text-sm text-slate-600 mb-4">
                                امسح رمز QR باستخدام تطبيق المصادقة
                                <br />
                                <span className="text-xs text-slate-400">(Google Authenticator, Authy, Microsoft Authenticator)</span>
                            </p>
                            <div className="inline-block p-4 bg-white rounded-xl border-2 border-slate-100 shadow-sm">
                                <QRCodeSVG
                                    value={totpUri}
                                    size={200}
                                    level="M"
                                    includeMargin={false}
                                />
                            </div>
                        </div>

                        {/* Step 2: Enter Code */}
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-600 mb-2 text-center">
                                    أدخل الرمز المكون من 6 أرقام
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={code}
                                    onChange={handleCodeChange}
                                    maxLength={6}
                                    placeholder="000000"
                                    autoFocus
                                    className="w-full text-center text-3xl font-mono tracking-[0.5em] bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-slate-900 focus:border-emerald-500 outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || code.length !== 6}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Shield className="w-5 h-5" />
                                        تأكيد التفعيل
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                )}

                {step === 'recovery' && recoveryCodes && (
                    <div className="space-y-4">
                        <div className="text-center">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                            <h3 className="text-lg font-bold text-slate-900">تم تفعيل المصادقة الثنائية!</h3>
                            <p className="text-sm text-slate-500 mt-1">احفظ رموز الاسترداد التالية في مكان آمن</p>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="text-xs text-amber-700 mb-3 text-center font-medium">
                                ⚠️ هذه الرموز تظهر مرة واحدة فقط — احفظها الآن
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {recoveryCodes.map((code, i) => (
                                    <div key={i} className="bg-white rounded-lg py-2 px-3 text-center font-mono text-sm text-slate-800 border border-amber-100">
                                        {code}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleCopyRecovery}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
                            >
                                <Copy className="w-4 h-4" />
                                نسخ
                            </button>
                            <button
                                onClick={handleDownloadRecovery}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
                            >
                                <Download className="w-4 h-4" />
                                تحميل
                            </button>
                        </div>

                        <button
                            onClick={handleComplete}
                            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-primary/20"
                        >
                            الانتقال إلى لوحة التحكم ←
                        </button>
                    </div>
                )}
            </div>

            {(step === 'scan' || step === 'verify') && (
                <div className="text-center mt-4">
                    <button
                        onClick={() => { clearTotpUri(); navigate('/dashboard'); }}
                        className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        تخطي الآن (يمكنك التفعيل لاحقاً)
                    </button>
                </div>
            )}
        </motion.div>
    );
}
