import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import LandingPage from './pages/public/LandingPage';
import Login from './pages/auth/Login';
import RegisterProfessional from './pages/auth/RegisterProfessional';
import RegisterPatient from './pages/auth/RegisterPatient';
import Setup2FA from './pages/auth/Setup2FA';
import Verify2FA from './pages/auth/Verify2FA';

// Dashboard
import DashboardHome from './pages/dashboard/DashboardHome';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="services" element={<div className="p-20 text-center">Services Page (Coming Soon)</div>} />
            <Route path="contact" element={<div className="p-20 text-center">Contact Page (Coming Soon)</div>} />
          </Route>

          {/* Auth Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Navigate to="/auth/register/professional" replace />} />
            <Route path="register/professional" element={<RegisterProfessional />} />
            <Route path="register/patient" element={<RegisterPatient />} />
            <Route path="setup-2fa" element={<Setup2FA />} />
            <Route path="verify-2fa" element={<Verify2FA />} />
            <Route index element={<Navigate to="/auth/login" replace />} />
          </Route>

          {/* ERP Dashboard (Protected) */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['CLINIC_ADMIN', 'LAB_ADMIN', 'PLATFORM_ADMIN']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="reception" element={<ComingSoon title="الاستقبال" />} />
            <Route path="patients" element={<ComingSoon title="المرضى" />} />
            <Route path="appointments" element={<ComingSoon title="المواعيد" />} />
            <Route path="billing" element={<ComingSoon title="الفوترة" />} />
            <Route path="hospitalization" element={<ComingSoon title="الإقامة" />} />
            <Route path="surgery" element={<ComingSoon title="غرفة العمليات" />} />
            <Route path="lab" element={<ComingSoon title="المختبر" />} />
            <Route path="hr" element={<ComingSoon title="الموارد البشرية" />} />
            <Route path="accounting" element={<ComingSoon title="المحاسبة" />} />
            <Route path="settings" element={<ComingSoon title="الإعدادات" />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

// Placeholder for modules not yet built
function ComingSoon({ title }) {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-500">هذا القسم قيد التطوير</p>
      </div>
    </div>
  );
}

export default App;
