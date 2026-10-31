import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationsProvider, Skeleton } from './components/ui';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import MainDashboard from './pages/MainDashboard';

// Katta bo'limlar faqat ochilganda yuklanadi (birinchi yuklanish tezroq)
const HrPortal = lazy(() => import('./pages/HrPortal'));
const LeaveManagement = lazy(() => import('./pages/LeaveManagement'));
const IzostiklarPage = lazy(() => import('./pages/IzostiklarPage'));
const MetrologyPage = lazy(() => import('./pages/MetrologyPage'));
const AppealCenterPage = lazy(() => import('./pages/AppealCenterPage'));
const Pu74Page = lazy(() => import('./pages/Pu74Page'));
const Pu29Page = lazy(() => import('./pages/Pu29Page'));
const DispatcherPage = lazy(() => import('./pages/DispatcherPage'));
const MechanicsPage = lazy(() => import('./pages/MechanicsPage'));

function PageFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-56" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  );
}

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
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
            <Suspense fallback={<PageFallback />}>
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
              <Route path="/pu29" element={<Pu29Page />} />
              <Route path="/mechanics" element={<MechanicsPage />} />

              {/* Dispetcherlik: kunlik hisobotlar (bo'linma yuboradi, dispetcher qabul qiladi) */}
              <Route path="/dispatcher" element={<DispatcherPage />} />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            </Suspense>
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
      <ThemeProvider>
        <NotificationsProvider>
          <AuthProvider>
            <SocketProvider>
              <AppContent />
            </SocketProvider>
          </AuthProvider>
        </NotificationsProvider>
      </ThemeProvider>
    </Router>
  );
}
