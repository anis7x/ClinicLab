import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, MapPin, Star, Clock, Phone, Building2,
    Stethoscope, Microscope, ArrowRight, Filter,
    ChevronDown, User, Cpu, DollarSign, X
} from 'lucide-react';
import mockProviders from '../../data/mock_providers.json';
import wilayas from '../../data/wilayas.json';
import medicalServices from '../../data/medical_services.json';

export default function SearchResults() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('rating');

    const serviceQuery = searchParams.get('service') || '';
    const wilayaQuery = searchParams.get('wilaya') || '';

    const [localService, setLocalService] = useState(serviceQuery);
    const [localWilaya, setLocalWilaya] = useState(wilayaQuery);

    const filteredResults = useMemo(() => {
        let results = [];

        mockProviders.forEach(provider => {
            const matchesWilaya = !wilayaQuery ||
                provider.wilaya.includes(wilayaQuery) ||
                provider.wilayaId === wilayaQuery;

            if (!matchesWilaya) return;

            const matchingServices = provider.services.filter(service =>
                !serviceQuery || service.name.includes(serviceQuery)
            );

            if (matchingServices.length > 0) {
                results.push({
                    ...provider,
                    matchedServices: matchingServices
                });
            }
        });

        if (sortBy === 'rating') {
            results.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'price') {
            results.sort((a, b) => {
                const aMin = Math.min(...a.matchedServices.map(s => s.price));
                const bMin = Math.min(...b.matchedServices.map(s => s.price));
                return aMin - bMin;
            });
        }

        return results;
    }, [serviceQuery, wilayaQuery, sortBy]);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (localService) params.set('service', localService);
        if (localWilaya) params.set('wilaya', localWilaya);
        setSearchParams(params);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('ar-DZ').format(price) + ' د.ج';
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="bg-gradient-to-b from-primary/5 to-transparent pt-8 pb-12">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                        <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
                        <span>/</span>
                        <span className="text-slate-900">نتائج البحث</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                        {serviceQuery || wilayaQuery ? (
                            <>نتائج البحث عن <span className="text-primary">{serviceQuery || 'جميع الخدمات'}</span> في <span className="text-primary">{wilayaQuery || 'كل الولايات'}</span></>
                        ) : 'جميع مقدمي الخدمات'}
                    </h1>

                    <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-100 flex flex-col md:flex-row gap-4">
                        <div className="flex-1 flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                            <Search className="w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={localService}
                                onChange={(e) => setLocalService(e.target.value)}
                                placeholder="ابحث عن خدمة..."
                                className="flex-1 bg-transparent outline-none text-slate-700"
                            />
                            {localService && (
                                <button onClick={() => setLocalService('')} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="flex-1 flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                            <MapPin className="w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={localWilaya}
                                onChange={(e) => setLocalWilaya(e.target.value)}
                                placeholder="الولاية..."
                                className="flex-1 bg-transparent outline-none text-slate-700"
                            />
                            {localWilaya && (
                                <button onClick={() => setLocalWilaya('')} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={handleSearch}
                            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                            <Search className="w-5 h-5" />
                            بحث
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-16">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-slate-600">
                        <span className="font-bold text-slate-900">{filteredResults.length}</span> نتيجة
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 text-slate-600"
                        >
                            <Filter className="w-4 h-4" />
                            فلترة
                        </button>
                        <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-3 py-2">
                            <span className="text-sm text-slate-500">ترتيب:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent outline-none text-slate-700 font-medium text-sm"
                            >
                                <option value="rating">الأعلى تقييماً</option>
                                <option value="price">الأقل سعراً</option>
                            </select>
                        </div>
                    </div>
                </div>

                {filteredResults.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-12 h-12 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد نتائج</h3>
                        <p className="text-slate-500 mb-6">جرب تغيير معايير البحث أو توسيع نطاقه</p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                        >
                            <ArrowRight className="w-4 h-4 rotate-180" />
                            العودة للصفحة الرئيسية
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <AnimatePresence>
                            {filteredResults.map((provider, index) => (
                                <motion.div
                                    key={provider.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                                >
                                    <div className="flex flex-col lg:flex-row">
                                        <div className="lg:w-64 h-48 lg:h-auto relative">
                                            <img
                                                src={provider.image}
                                                alt={provider.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                <span className="font-bold text-slate-900 text-sm">{provider.rating}</span>
                                                <span className="text-slate-400 text-xs">({provider.reviewsCount})</span>
                                            </div>
                                            <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${provider.type === 'lab'
                                                    ? 'bg-cyan-100 text-cyan-700'
                                                    : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                {provider.type === 'lab' ? 'مختبر' : 'عيادة'}
                                            </div>
                                        </div>

                                        <div className="flex-1 p-6">
                                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900 mb-1">{provider.name}</h3>
                                                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            {provider.city}، {provider.wilaya}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {provider.openHours}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="w-4 h-4" />
                                                            {provider.phone}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {provider.matchedServices.map((service, sIdx) => (
                                                    <div
                                                        key={sIdx}
                                                        className="bg-slate-50 rounded-xl p-4 border border-slate-100"
                                                    >
                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-slate-900 mb-2">{service.name}</h4>
                                                                <div className="flex flex-wrap gap-4 text-sm">
                                                                    {service.doctor && (
                                                                        <div className="flex items-center gap-2 text-slate-600">
                                                                            <User className="w-4 h-4 text-primary" />
                                                                            <span>{service.doctor.name}</span>
                                                                            <span className="text-slate-400">({service.doctor.specialty})</span>
                                                                        </div>
                                                                    )}
                                                                    {service.equipment && (
                                                                        <div className="flex items-center gap-2 text-slate-600">
                                                                            <Cpu className="w-4 h-4 text-cyan-500" />
                                                                            <span>{service.equipment.name}</span>
                                                                            <span className="text-slate-400">({service.equipment.origin})</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex items-center gap-2 text-slate-600">
                                                                        <Clock className="w-4 h-4 text-amber-500" />
                                                                        <span>{service.turnaround}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <div className="text-left">
                                                                    <p className="text-2xl font-bold text-primary">{formatPrice(service.price)}</p>
                                                                </div>
                                                                <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-bold transition-all text-sm whitespace-nowrap">
                                                                    احجز الآن
                                                                </button>
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
        </div>
    );
}
