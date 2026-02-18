import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Users, CalendarDays, Receipt, LogIn,
    LogOut, ChevronRight, ChevronLeft, Menu, X,
    Building2, Settings, Bell, Search, UserCircle,
    TestTubes, BedDouble, Scissors, DollarSign, UserCog
} from 'lucide-react';

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'لوحة القيادة', labelFr: 'Tableau de bord', end: true },
    { path: '/dashboard/reception', icon: LogIn, label: 'الاستقبال', labelFr: 'Accueil' },
    { path: '/dashboard/patients', icon: Users, label: 'المرضى', labelFr: 'Patients' },
    { path: '/dashboard/appointments', icon: CalendarDays, label: 'المواعيد', labelFr: 'Rendez-vous' },
    { path: '/dashboard/billing', icon: Receipt, label: 'الفوترة', labelFr: 'Facturation' },
    { divider: true, label: 'العمليات السريرية' },
    { path: '/dashboard/hospitalization', icon: BedDouble, label: 'الإقامة', labelFr: 'Hospitalisation' },
    { path: '/dashboard/surgery', icon: Scissors, label: 'غرفة العمليات', labelFr: 'Bloc Opératoire' },
    { path: '/dashboard/lab', icon: TestTubes, label: 'المختبر', labelFr: 'Laboratoire' },
    { divider: true, label: 'الإدارة' },
    { path: '/dashboard/hr', icon: UserCog, label: 'الموارد البشرية', labelFr: 'RH' },
    { path: '/dashboard/accounting', icon: DollarSign, label: 'المحاسبة', labelFr: 'Comptabilité' },
    { path: '/dashboard/settings', icon: Settings, label: 'الإعدادات', labelFr: 'Paramètres' },
];

export default function DashboardLayout() {
    const { user, org, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/auth/login');
    };

    const orgName = org?.name || user?.business_name || 'ClinicLab';
    const orgType = org?.org_type === 'LAB' ? 'مختبر' : 'عيادة';

    return (
        <div className="min-h-screen bg-slate-50 flex" dir="rtl">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 right-0 z-30 bg-white border-l border-slate-200 shadow-xl transition-all duration-300 flex flex-col
                    ${sidebarOpen ? 'w-64' : 'w-20'}
                    ${mobileMenuOpen ? 'translate-x-0' : 'max-md:translate-x-full'}
                    md:translate-x-0 md:static`}
            >
                {/* Org header */}
                <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        {sidebarOpen && (
                            <div className="min-w-0">
                                <h3 className="font-bold text-slate-900 text-sm truncate">{orgName}</h3>
                                <span className="text-xs text-primary/70 font-medium">{orgType}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-3 px-2">
                    {navItems.map((item, i) => {
                        if (item.divider) {
                            return sidebarOpen ? (
                                <div key={i} className="px-3 py-2 mt-2">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{item.label}</span>
                                </div>
                            ) : <div key={i} className="my-2 border-t border-slate-100" />;
                        }

                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                onClick={() => setMobileMenuOpen(false)}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all group
                                    ${isActive
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                                    ${!sidebarOpen ? 'justify-center' : ''}
                                `}
                            >
                                <Icon className="w-5 h-5 shrink-0" />
                                {sidebarOpen && (
                                    <span className="text-sm font-medium truncate">{item.label}</span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="border-t border-slate-100 p-3">
                    {sidebarOpen ? (
                        <div className="flex items-center gap-3 mb-3 px-2">
                            <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                                <UserCircle className="w-5 h-5 text-slate-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{user?.email}</p>
                                <p className="text-xs text-slate-400">{user?.role === 'CLINIC_ADMIN' ? 'مدير' : 'مستخدم'}</p>
                            </div>
                        </div>
                    ) : null}
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-sm
                            ${!sidebarOpen ? 'justify-center' : ''}`}
                    >
                        <LogOut className="w-5 h-5" />
                        {sidebarOpen && <span>تسجيل الخروج</span>}
                    </button>
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="hidden md:flex items-center justify-center absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition-colors z-10"
                >
                    {sidebarOpen
                        ? <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
                        : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                </button>
            </aside>

            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-20 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-4 md:px-6">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg hover:bg-slate-100"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>

                            <div className="hidden md:flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 w-72 border border-slate-100">
                                <Search className="w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="بحث..."
                                    className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 w-full"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
                                <Bell className="w-5 h-5 text-slate-500" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
