import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import wilayas from '../../data/wilayas.json';

const pricingPlans = [
    {
        name: "الباقة الفضية",
        price: "5,000 د.ج",
        period: "/شهرياً",
        description: "باقة الظهور للعيادات الناشئة",
        features: [
            "قائمة وتشكيل جانبي على الإنترنت",
            "استقبال الحجوزات والمواعيد",
            "تحليلات أساسية",
            "دعم عبر البريد الإلكتروني"
        ],
        cta: "ابدأ الفضية",
        highlight: false
    },
    {
        name: "الباقة الذهبية",
        price: "10,000 د.ج",
        period: "/شهرياً",
        description: "نظام إدارة شامل للمختبرات المحترفة",
        features: [
            "كل شيء في الباقة الفضية",
            "نظام إدارة عيادة كامل",
            "تقارير مالية وإدارة الموظفين",
            "قاعدة بيانات سجلات المرضى",
            "دعم ذو أولوية 24/7"
        ],
        cta: "اختر الذهبية",
        highlight: true
    }
];

export default function LandingPage() {
    const [wilayaSearch, setWilayaSearch] = useState('');
    const [showWilayaSuggestions, setShowWilayaSuggestions] = useState(false);
    const [serviceSearch, setServiceSearch] = useState('');
    const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen relative overflow-x-hidden">
            {/* Subtle Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light z-0"></div>

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center pt-20">
                {/* Animated Background Blobs */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                        className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            rotate: [0, -60, 0],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                        className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[100px]"
                    />
                </div>

                <div className="container relative z-10 px-4 md:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-8 tracking-tight drop-shadow-sm">
                            مستقبل <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                                التواصل
                            </span>
                            <br />في الرعاية الصحية
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                            نظام متكامل يربطك بأفضل المختبرات والعيادات. <br className="hidden md:block" /> سرعة، أمان، وموثوقية في مكان واحد.
                        </p>

                        {/* Search Bar - Floating Glass */}
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            className="glass p-3 rounded-full max-w-4xl mx-auto flex flex-col md:flex-row gap-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 shadow-2xl shadow-primary/5 ring-1 ring-white/20 relative z-50"
                        >
                            <div className="flex-1 flex items-center px-6 bg-white/50 dark:bg-slate-900/50 rounded-full h-16 shadow-inner transition-colors hover:bg-white/70 dark:hover:bg-slate-800/70 group relative z-50">
                                <Search className="text-slate-400 group-focus-within:text-primary w-6 h-6 ml-4 transition-colors" />
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        value={serviceSearch}
                                        onChange={(e) => {
                                            setServiceSearch(e.target.value);
                                            setShowServiceSuggestions(true);
                                        }}
                                        onFocus={() => setShowServiceSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowServiceSuggestions(false), 200)}
                                        placeholder="الخدمة (مثال: تحليل دم، رنين مغناطيسي)"
                                        className="w-full bg-transparent outline-none text-lg text-slate-700 dark:text-white placeholder-slate-400"
                                    />
                                    {/* Service Suggestions Dropdown */}
                                    {showServiceSuggestions && serviceSearch && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden max-h-[140px] overflow-y-auto z-[100] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                                            {medicalServices
                                                .filter(s => s.name.includes(serviceSearch))
                                                .map((service) => (
                                                    <button
                                                        key={service.id}
                                                        onClick={() => {
                                                            setServiceSearch(service.name);
                                                            setShowServiceSuggestions(false);
                                                        }}
                                                        className="w-full text-right px-6 py-4 md:py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between group border-b border-slate-50 dark:border-slate-700/50 last:border-none"
                                                    >
                                                        <span className="text-slate-800 dark:text-slate-200 font-medium text-base">{service.name}</span>
                                                        <span className="text-xs text-primary bg-primary/10 dark:bg-primary/20 px-2 py-1 rounded-md font-mono">{service.category}</span>
                                                    </button>
                                                ))}
                                            {medicalServices.filter(s => s.name.includes(serviceSearch)).length === 0 && (
                                                <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm py-6">
                                                    لا توجد نتائج مطابقة
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-700 h-10 self-center mx-2"></div>
                            <div className="flex-1 flex items-center px-6 bg-white/50 dark:bg-slate-900/50 rounded-full h-16 shadow-inner transition-colors hover:bg-white/70 dark:hover:bg-slate-800/70 group">
                                <MapPin className="text-slate-400 group-focus-within:text-accent w-6 h-6 ml-4 transition-colors" />
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        value={wilayaSearch}
                                        onChange={(e) => {
                                            setWilayaSearch(e.target.value);
                                            setShowWilayaSuggestions(true);
                                        }}
                                        onFocus={() => setShowWilayaSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowWilayaSuggestions(false), 200)}
                                        placeholder="الموقع (الولاية)"
                                        className="w-full bg-transparent outline-none text-lg text-slate-700 dark:text-white placeholder-slate-400"
                                    />
                                    {/* Wilaya Suggestions Dropdown */}
                                    {showWilayaSuggestions && wilayaSearch && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden max-h-[140px] overflow-y-auto z-[100] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                                            {wilayas
                                                .filter(w =>
                                                    w.ar_name.includes(wilayaSearch) ||
                                                    w.name.toLowerCase().includes(wilayaSearch.toLowerCase()) ||
                                                    w.id.includes(wilayaSearch)
                                                )
                                                .map((wilaya) => (
                                                    <button
                                                        key={wilaya.id}
                                                        onClick={() => {
                                                            setWilayaSearch(wilaya.ar_name);
                                                            setShowWilayaSuggestions(false);
                                                        }}
                                                        className="w-full text-right px-6 py-4 md:py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between group border-b border-slate-50 dark:border-slate-700/50 last:border-none"
                                                    >
                                                        <span className="text-slate-800 dark:text-slate-200 font-medium text-base">{wilaya.ar_name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-slate-400 font-normal hidden sm:inline-block">{wilaya.name}</span>
                                                            <span className="text-xs text-primary bg-primary/10 dark:bg-primary/20 px-2 py-1 rounded-md font-mono">{wilaya.id}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            {wilayas.filter(w => w.ar_name.includes(wilayaSearch) || w.name.toLowerCase().includes(wilayaSearch.toLowerCase()) || w.id.includes(wilayaSearch)).length === 0 && (
                                                <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm py-6">
                                                    لا توجد نتائج مطابقة
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-primary/50 transform active:scale-95">
                                بحث
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24 relative z-10">
                <div className="container px-4 md:px-8 mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                            خطط مصممة لنموك
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-lg">
                            سواء كنت عيادة ناشئة أو مختبراً كبيراً، لدينا الأدوات التي تحتاجها للنجاح.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {pricingPlans.map((plan, index) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -10 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className={`relative p-8 rounded-3xl border transition-all duration-300 ${plan.highlight
                                    ? 'bg-gradient-to-b from-slate-900 to-slate-800 border-accent/30 shadow-2xl shadow-accent/10'
                                    : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-xl hover:shadow-2xl'
                                    }`}
                            >
                                {plan.highlight && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-slate-900 text-sm font-bold px-6 py-2 rounded-full shadow-lg shadow-accent/30">
                                        الأكثر شيوعاً
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                        {plan.name}
                                    </h3>
                                    <p className={`text-sm ${plan.highlight ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="mb-8 pb-8 border-b border-slate-100 dark:border-slate-700/50">
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-5xl font-bold tracking-tight ${plan.highlight ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                            {plan.price}
                                        </span>
                                        <span className={`text-lg font-medium ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {plan.period}
                                        </span>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-10">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className={`mt-1 p-1 rounded-full flex-shrink-0 ${plan.highlight ? 'bg-accent/20 text-accent' : 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light'}`}>
                                                <Check className="w-4 h-4" />
                                            </div>
                                            <span className={`text-base ${plan.highlight ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    to="/auth/register"
                                    className={`block w-full text-center py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${plan.highlight
                                        ? 'bg-accent hover:bg-accent-hover text-slate-900 shadow-lg shadow-accent/20'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white'
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
