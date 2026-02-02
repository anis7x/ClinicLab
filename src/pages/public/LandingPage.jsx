import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Check, ArrowRight, Star, Clock, Phone, User, Cpu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import wilayas from '../../data/wilayas.json';
import medicalServices from '../../data/medical_services.json';
import mockProviders from '../../data/mock_providers.json';

const pricingPlans = [
    {
        name: "الباقة الفضية",
        price: "5,000 د.ج",
        period: "/شهرياً",
        description: "باقة الظهور للعيادات و المختبرات الناشئة",
        features: [
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
        description: "نظام إدارة شامل للمختبرات و العيادات المحترفة",
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
    const navigate = useNavigate();
    const [wilayaSearch, setWilayaSearch] = useState('');
    const [showWilayaSuggestions, setShowWilayaSuggestions] = useState(false);
    const [serviceSearch, setServiceSearch] = useState('');
    const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);
    const [searchResults, setSearchResults] = useState(null);
    const [sortBy, setSortBy] = useState('rating');

    const handleSearch = () => {
        let results = [];

        mockProviders.forEach(provider => {
            const matchesWilaya = !wilayaSearch ||
                provider.wilaya.includes(wilayaSearch) ||
                provider.wilayaId === wilayaSearch;

            if (!matchesWilaya) return;

            const matchingServices = provider.services.filter(service =>
                !serviceSearch || service.name.includes(serviceSearch)
            );

            if (matchingServices.length > 0) {
                results.push({
                    ...provider,
                    matchedServices: matchingServices
                });
            }
        });

        // Sort results
        if (sortBy === 'rating') {
            results.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'price') {
            results.sort((a, b) => {
                const aMin = Math.min(...a.matchedServices.map(s => s.price));
                const bMin = Math.min(...b.matchedServices.map(s => s.price));
                return aMin - bMin;
            });
        }

        setSearchResults(results);

        // Scroll to results
        setTimeout(() => {
            document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('ar-DZ').format(price) + ' د.ج';
    };

    const clearSearch = () => {
        setSearchResults(null);
        setServiceSearch('');
        setWilayaSearch('');
    };

    return (
        <div className="bg-slate-50 min-h-screen relative overflow-x-hidden">
            {/* Subtle Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-20 pointer-events-none mix-blend-soft-light z-0"></div>

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
                        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 tracking-tight drop-shadow-sm">
                            مستقبل <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                                التواصل
                            </span>
                            <br />في الرعاية الصحية
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                            نظام متكامل يربطك بأفضل المختبرات والعيادات. <br className="hidden md:block" /> سرعة، أمان، وموثوقية في مكان واحد.
                        </p>

                        {/* Search Bar - Floating Glass */}
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            className="glass p-3 md:p-3 rounded-[2.5rem] md:rounded-full max-w-4xl mx-auto flex flex-col md:flex-row gap-6 md:gap-2 bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl shadow-primary/5 ring-1 ring-white/20 relative z-50"
                        >
                            <div className="flex-1 flex items-center px-6 bg-white/50 rounded-full h-28 md:h-20 shadow-inner transition-colors hover:bg-white/70 group relative z-50">
                                <Search className="text-slate-400 group-focus-within:text-primary w-5 h-5 md:w-6 md:h-6 ml-4 transition-colors" />
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
                                        placeholder="الخدمة (مثال: تحليل دم)"
                                        className="w-full bg-transparent outline-none text-base md:text-lg text-slate-700 placeholder-slate-400"
                                    />
                                    {/* Service Suggestions Dropdown */}
                                    {showServiceSuggestions && serviceSearch && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden max-h-[140px] overflow-y-auto z-[100] scrollbar-thin scrollbar-thumb-slate-200">
                                            {(Array.isArray(medicalServices) ? medicalServices : [])
                                                .filter(s => s?.name && s.name.toLowerCase().includes(serviceSearch.toLowerCase()))
                                                .map((service) => (
                                                    <button
                                                        key={service.id || Math.random()}
                                                        onClick={() => {
                                                            setServiceSearch(service.name);
                                                            setShowServiceSuggestions(false);
                                                        }}
                                                        className="w-full text-right px-6 py-4 md:py-3 hover:bg-slate-50 transition-colors flex items-center justify-between group border-b border-slate-50 last:border-none"
                                                    >
                                                        <span className="text-slate-800 font-medium text-base">{service.name}</span>
                                                        <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-md font-mono">{service.category}</span>
                                                    </button>
                                                ))}
                                            {(Array.isArray(medicalServices) ? medicalServices : []).filter(s => s?.name && s.name.toLowerCase().includes(serviceSearch.toLowerCase())).length === 0 && (
                                                <div className="p-4 text-center text-slate-500 text-sm py-6">
                                                    لا توجد نتائج مطابقة
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="hidden md:block w-px bg-slate-200 h-10 self-center mx-2"></div>
                            <div className="flex-1 flex items-center px-6 bg-white/50 rounded-full h-28 md:h-20 shadow-inner transition-colors hover:bg-white/70 group">
                                <MapPin className="text-slate-400 group-focus-within:text-accent w-5 h-5 md:w-6 md:h-6 ml-4 transition-colors" />
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
                                        className="w-full bg-transparent outline-none text-base md:text-lg text-slate-700 placeholder-slate-400"
                                    />
                                    {/* Wilaya Suggestions Dropdown */}
                                    {showWilayaSuggestions && wilayaSearch && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden max-h-[140px] overflow-y-auto z-[100] scrollbar-thin scrollbar-thumb-slate-200">
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
                                                        className="w-full text-right px-6 py-4 md:py-3 hover:bg-slate-50 transition-colors flex items-center justify-between group border-b border-slate-50 last:border-none"
                                                    >
                                                        <span className="text-slate-800 font-medium text-base">{wilaya.ar_name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-slate-400 font-normal hidden sm:inline-block">{wilaya.name}</span>
                                                            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-md font-mono">{wilaya.id}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            {wilayas.filter(w => w.ar_name.includes(wilayaSearch) || w.name.toLowerCase().includes(wilayaSearch.toLowerCase()) || w.id.includes(wilayaSearch)).length === 0 && (
                                                <div className="p-4 text-center text-slate-500 text-sm py-6">
                                                    لا توجد نتائج مطابقة
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={handleSearch}
                                className="w-full md:w-auto bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-white px-10 py-2.5 md:py-4 rounded-full font-bold text-base md:text-lg transition-all shadow-lg hover:shadow-primary/50 transform active:scale-95"
                            >
                                بحث
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Search Results Section */}
            {searchResults !== null && (
                <section id="search-results" className="py-16 relative z-10 bg-gradient-to-b from-slate-100 to-slate-50">
                    <div className="container px-4 md:px-8 mx-auto">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                                    نتائج البحث
                                </h2>
                                <p className="text-slate-600">
                                    <span className="font-bold text-primary">{searchResults.length}</span> نتيجة
                                    {serviceSearch && <span> لـ "{serviceSearch}"</span>}
                                    {wilayaSearch && <span> في {wilayaSearch}</span>}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-3 py-2">
                                    <span className="text-sm text-slate-500">ترتيب:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => {
                                            setSortBy(e.target.value);
                                            handleSearch();
                                        }}
                                        className="bg-transparent outline-none text-slate-700 font-medium text-sm"
                                    >
                                        <option value="rating">الأعلى تقييماً</option>
                                        <option value="price">الأقل سعراً</option>
                                    </select>
                                </div>
                                <button
                                    onClick={clearSearch}
                                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    مسح
                                </button>
                            </div>
                        </div>

                        {searchResults.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-12 h-12 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد نتائج</h3>
                                <p className="text-slate-500 mb-6">جرب تغيير معايير البحث أو توسيع نطاقه</p>
                            </div>
                        ) : (
                            <div className="grid gap-8">
                                <AnimatePresence>
                                    {searchResults.map((provider, index) => (
                                        <motion.div
                                            key={provider.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
                                            className="group bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1"
                                        >
                                            <div className="flex flex-col lg:flex-row">
                                                {/* Enhanced Image Section */}
                                                <div className="lg:w-80 h-64 lg:h-auto relative overflow-hidden m-3 rounded-[1.5rem] shadow-inner">
                                                    <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-slate-900/80 to-transparent z-10" />
                                                    <img
                                                        src={provider.image}
                                                        alt={provider.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                    {/* Rating Badge */}
                                                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg z-20 border border-white/50">
                                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                        <span className="font-bold text-slate-900 text-sm">{provider.rating}</span>
                                                    </div>
                                                    {/* Type Badge */}
                                                    <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg z-20 border border-white/20 backdrop-blur-md ${provider.type === 'lab'
                                                            ? 'bg-cyan-500/90 text-white'
                                                            : 'bg-emerald-500/90 text-white'
                                                        }`}>
                                                        {provider.type === 'lab' ? '🔬 مختبر' : '🏥 عيادة'}
                                                    </div>
                                                    {/* Provider Name on Image (Mobile) */}
                                                    <div className="absolute bottom-4 right-4 left-4 z-20 lg:hidden">
                                                        <h3 className="text-xl font-bold text-white drop-shadow-md">{provider.name}</h3>
                                                        <p className="text-white/90 text-sm flex items-center gap-1 mt-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {provider.city}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Content Section */}
                                                <div className="flex-1 p-6 lg:p-8">
                                                    {/* Header */}
                                                    <div className="hidden lg:block mb-6">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="text-2xl font-bold text-slate-900 mb-2">{provider.name}</h3>
                                                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
                                                                        <MapPin className="w-3.5 h-3.5 text-primary" />
                                                                        {provider.city}، {provider.wilaya}
                                                                    </span>
                                                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
                                                                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                                                        {provider.openHours}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                                                <span>{provider.reviewsCount} تقييم</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Services */}
                                                    <div className="space-y-4">
                                                        {provider.matchedServices.map((service, sIdx) => (
                                                            <div
                                                                key={sIdx}
                                                                className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 hover:border-primary/20 transition-colors"
                                                            >
                                                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                                                                    <div className="flex-1 space-y-4">
                                                                        <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                                                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                                                                            {service.name}
                                                                        </h4>

                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                            {service.doctor && (
                                                                                <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                                                                                        <User className="w-4 h-4 text-blue-600" />
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-xs font-bold text-slate-400 block mb-0.5">الطبيب المشرف</span>
                                                                                        <span className="text-sm font-bold text-slate-800 block">{service.doctor.name}</span>
                                                                                        <span className="text-xs text-slate-500">{service.doctor.specialty}</span>
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {service.equipment && (
                                                                                <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                                                    <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                                                                                        <Cpu className="w-4 h-4 text-purple-600" />
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-xs font-bold text-slate-400 block mb-0.5">التجهيزات</span>
                                                                                        <span className="text-sm font-bold text-slate-800 block">{service.equipment.name}</span>
                                                                                        <span className="text-xs text-slate-500">{service.equipment.origin}</span>
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                                                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                                                                                    <Clock className="w-4 h-4 text-amber-600" />
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-xs font-bold text-slate-400 block mb-0.5">مدة الانتظار</span>
                                                                                    <span className="text-sm font-bold text-slate-800">{service.turnaround}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center justify-between lg:flex-col lg:items-end lg:justify-center gap-4 pl-2 border-t lg:border-t-0 lg:border-r border-slate-200 pt-4 lg:pt-0 lg:pr-6 mt-2 lg:mt-0">
                                                                        <div className="text-right">
                                                                            <span className="text-xs text-slate-400 font-medium block mb-1">سعر الخدمة</span>
                                                                            <p className="text-2xl font-black text-primary">{formatPrice(service.price)}</p>
                                                                        </div>
                                                                        <Link
                                                                            to="/auth/register/patient"
                                                                            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 text-sm flex items-center gap-2"
                                                                        >
                                                                            احجز موعد
                                                                            <ArrowRight className="w-4 h-4 rotate-180" />
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Pricing Section */}
            <section className="py-24 relative z-10">
                <div className="container px-4 md:px-8 mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
                            خطط مصممة لنموك
                        </h2>
                        <p className="text-slate-600 max-w-xl mx-auto text-lg">
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
                                    ? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 border-yellow-400/50 shadow-2xl shadow-amber-500/30 ring-1 ring-white/50'
                                    : 'bg-white border-slate-200 shadow-xl hover:shadow-2xl'
                                    }`}
                            >
                                {plan.highlight && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-amber-600 text-sm font-bold px-6 py-2 rounded-full shadow-lg shadow-black/5 ring-4 ring-white/20">
                                        الأكثر شيوعاً
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className={`text-2xl font-bold mb-2 text-slate-900`}>
                                        {plan.name}
                                    </h3>
                                    <p className={`text-sm ${plan.highlight ? 'text-slate-800' : 'text-slate-500'}`}>
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="mb-8 pb-8 border-b border-slate-100">
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-5xl font-bold tracking-tight text-slate-900`}>
                                            {plan.price}
                                        </span>
                                        <span className={`text-lg font-medium ${plan.highlight ? 'text-slate-800' : 'text-slate-500'}`}>
                                            {plan.period}
                                        </span>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-10">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className={`mt-1 p-1 rounded-full flex-shrink-0 ${plan.highlight ? 'bg-white/20 text-slate-900' : 'bg-primary/10 text-primary'}`}>
                                                <Check className="w-4 h-4" />
                                            </div>
                                            <span className={`text-base ${plan.highlight ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    to="/auth/register/professional"
                                    className={`block w-full text-center py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${plan.highlight
                                        ? 'bg-white hover:bg-slate-50 text-amber-600 shadow-lg shadow-black/10'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
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
