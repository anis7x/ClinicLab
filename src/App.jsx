import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import LandingPage from './pages/public/LandingPage';
import Login from './pages/auth/Login';
import RegisterProfessional from './pages/auth/RegisterProfessional';
import RegisterPatient from './pages/auth/RegisterPatient';

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

            {/* Redirects */}
            <Route index element={<Navigate to="/auth/login" replace />} />
          </Route>

          {/* Dashboard (placeholder for ERP) */}
          <Route path="/dashboard" element={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-slate-900">🎉 مرحباً في لوحة التحكم</h1>
                <p className="text-slate-500">لوحة التحكم قيد التطوير. ستكون متاحة قريباً.</p>
                <a href="/#/" className="text-primary hover:underline">← العودة للرئيسية</a>
              </div>
            </div>
          } />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;

