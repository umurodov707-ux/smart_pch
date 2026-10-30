import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import MainDashboard from './pages/MainDashboard';
import HrPortal from './pages/HrPortal';
import LeaveManagement from './pages/LeaveManagement';
import IzostiklarPage from './pages/IzostiklarPage';
import MetrologyPage from './pages/MetrologyPage';
import AppealCenterPage from './pages/AppealCenterPage';
import Pu74Page from './pages/Pu74Page';
import MechanicsPage from './pages/MechanicsPage';
import ComingSoonPage from './pages/ComingSoonPage';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-gold-500">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route wrapper component (prevents going to login/landing if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={
        <PublicRoute>
          <LandingPage />
        </PublicRoute>
      } />

      {/* Login Page */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<MainDashboard />} />
              <Route path="/hr" element={<HrPortal />} />
              <Route path="/leave" element={<LeaveManagement />} />
              <Route path="/izostiklar" element={<IzostiklarPage />} />
              <Route path="/metrology" element={<MetrologyPage />} />
              <Route path="/appeals" element={<AppealCenterPage />} />

              {/* PU-74 — sidebar'da tugma bor edi, lekin route yo'q edi:
                  shu sababli tugma bosilganda pastdagi "*" qoidasi
                  foydalanuvchini jimgina /dashboard ga qaytarib yuborardi. */}
              <Route path="/pu74" element={<Pu74Page />} />
              <Route path="/mechanics" element={<MechanicsPage />} />

              {/* Menyudagi qolgan bo'limlar: React versiyasi hali yo'q,
                  lekin endi hech bo'lmasa aniq xabar ko'rsatiladi. */}
              <Route
                path="/pu29"
                element={
                  <ComingSoonPage
                    title="PU-29 Jurnal"
                    description="Strelkali o'tkazgichlar ko'rigi jurnalining yangi interfeysi tayyorlanmoqda."
                  />
                }
              />
              <Route
                path="/dispatcher"
                element={
                  <ComingSoonPage
                    title="AI Dispetcher"
                    description="Dispetcherlik markazining yangi interfeysi tayyorlanmoqda."
                  />
                }
              />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}
