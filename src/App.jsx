import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import LandingPage from './pages/public/LandingPage';
import SearchResults from './pages/public/SearchResults';
import Login from './pages/auth/Login';
import RegisterProfessional from './pages/auth/RegisterProfessional';

import RegisterPatient from './pages/auth/RegisterPatient';

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="search" element={<SearchResults />} />
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

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
