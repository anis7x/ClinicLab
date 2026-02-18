import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Users, CalendarDays, Receipt, TrendingUp,
    Activity, Clock, ArrowUpRight, ArrowDownRight,
    Stethoscope, TestTubes, BedDouble, Bell
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, change, changeType, color }) => (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-slate-500 mb-1">{label}</p>
                <p className="text-3xl font-bold text-slate-900">{value}</p>
                {change && (
                    <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${changeType === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {changeType === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {change}
                    </div>
                )}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    </div>
);

const QuickAction = ({ icon: Icon, label, onClick, color }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all hover:scale-105 group"
    >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-xs font-medium text-slate-700">{label}</span>
    </button>
);

export default function DashboardHome() {
    const { org, user } = useAuth();

    const orgName = org?.name || user?.business_name || 'عيادتي';
    const now = new Date();
    const timeStr = now.toLocaleDateString('ar-DZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        مرحباً بك في <span className="text-primary">{orgName}</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">{timeStr}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-100">
                        <Activity className="w-3.5 h-3.5 inline ml-1" />
                        النظام يعمل
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Users}
                    label="المرضى اليوم"
                    value="0"
                    change="بدء الاستخدام"
                    changeType="up"
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                    icon={CalendarDays}
                    label="مواعيد اليوم"
                    value="0"
                    change="لا توجد مواعيد"
                    changeType="up"
                    color="bg-gradient-to-br from-violet-500 to-violet-600"
                />
                <StatCard
                    icon={Receipt}
                    label="فواتير اليوم"
                    value="0 د.ج"
                    color="bg-gradient-to-br from-emerald-500 to-emerald-600"
                />
                <StatCard
                    icon={BedDouble}
                    label="أسرّة متاحة"
                    value="—"
                    color="bg-gradient-to-br from-amber-500 to-amber-600"
                />
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3">الإجراءات السريعة</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    <QuickAction icon={Users} label="مريض جديد" color="bg-blue-500" />
                    <QuickAction icon={CalendarDays} label="موعد جديد" color="bg-violet-500" />
                    <QuickAction icon={Receipt} label="فاتورة جديدة" color="bg-emerald-500" />
                    <QuickAction icon={Stethoscope} label="زيارة طبية" color="bg-rose-500" />
                    <QuickAction icon={TestTubes} label="طلب تحاليل" color="bg-cyan-500" />
                    <QuickAction icon={BedDouble} label="إدخال مريض" color="bg-amber-500" />
                </div>
            </div>

            {/* Recent Activity & Today's Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Schedule */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            جدول اليوم
                        </h3>
                    </div>
                    <div className="text-center py-12 text-slate-400">
                        <CalendarDays className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                        <p className="text-sm">لا توجد مواعيد لهذا اليوم</p>
                        <button className="mt-4 text-primary text-sm font-medium hover:underline">
                            إضافة موعد جديد
                        </button>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-primary" />
                            آخر الأنشطة
                        </h3>
                    </div>
                    <div className="text-center py-12 text-slate-400">
                        <Activity className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                        <p className="text-sm">ابدأ باستخدام النظام لرؤية الأنشطة هنا</p>
                    </div>
                </div>
            </div>

            {/* System Info */}
            <div className="bg-gradient-to-l from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/10">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                        <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 mb-1">نظام ClinicLab ERP</h3>
                        <p className="text-sm text-slate-600">
                            نظام إدارة شامل يدعم CNAS و CHIFA وفق المعايير الجزائرية. يشمل إدارة المرضى، المواعيد، الفوترة بنظام NGAP، المختبر، والمحاسبة SCF.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
