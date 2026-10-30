import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString('uz-UZ'));

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileSidebarOpen(false); // Reset mobile sidebar when switching to desktop
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile sidebar on navigation
  useEffect(() => {
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Close services dropdown on outside click
  useEffect(() => {
    if (!servicesOpen) return;
    const handler = (e) => {
      if (!e.target.closest('.services-dropdown-container')) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [servicesOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileSidebarOpen]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('uz-UZ'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNavigate = useCallback((path) => {
    navigate(path);
    if (isMobile) setMobileSidebarOpen(false);
  }, [navigate, isMobile]);

  const menuItems = [
    { path: '/dashboard', label: 'Asosiy panel', icon: 'fas fa-chart-pie' },
    { path: '/dashboard/dispatcher', label: 'AI Dispetcher', icon: 'fas fa-network-wired' },
    { path: '/dashboard/pu29', label: 'PU-29 Jurnal', icon: 'fas fa-file-invoice' },
    { path: '/dashboard/pu74', label: 'PU-74 Jurnal', icon: 'fas fa-calculator' },
    { path: '/dashboard/hr', label: 'Xodimlar (HR)', icon: 'fas fa-users' },
    { path: '/dashboard/leave', label: "Ta'tillar boshqaruvi", icon: 'fas fa-calendar-alt' },
    { path: '/dashboard/izostiklar', label: 'Izostiklar', icon: 'fas fa-microchip' },
    { path: '/dashboard/metrology', label: 'Metrologiya', icon: 'fas fa-microscope' },
    { path: '/dashboard/mechanics', label: 'Mexanika bo\'limi', icon: 'fas fa-truck-monster' },
    { path: '/dashboard/appeals', label: 'Raqamli Murojaat', icon: 'fas fa-headset' },
  ];

  // Determine if sidebar should show labels (desktop expanded or mobile open)
  const showLabels = isMobile ? true : sidebarOpen;

  // Build sidebar content (shared between desktop and mobile)
  const sidebarContent = (
    <>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0 h-14">
        {showLabels ? (
          <span className="text-xs font-bold text-slate-500 tracking-wider">BO'LIMLAR BOSHQARMASI</span>
        ) : (
          <i className="fas fa-bars text-slate-500 mx-auto"></i>
        )}
        {/* Close button - only on mobile */}
        {isMobile && (
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Yopish"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        )}
      </div>

      {/* Menu Items */}
      <ul className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path}>
              <button
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl transition-all text-sm font-semibold relative group ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/10 to-amber-600/5 text-amber-400 border-l-2 border-amber-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <i className={`${item.icon} text-base shrink-0 w-5 text-center ${isActive ? 'text-amber-500' : 'text-slate-500 group-hover:text-slate-300'}`}></i>
                {showLabels && <span>{item.label}</span>}
                {/* Tooltip for collapsed desktop sidebar */}
                {!showLabels && !isMobile && (
                  <div className="absolute left-16 bg-slate-900 border border-slate-800 text-slate-200 text-xs px-2 py-1.5 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Sidebar Footer - collapse toggle (desktop only) */}
      {!isMobile && (
        <div className="p-3 border-t border-slate-800 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full py-2 bg-slate-950 hover:bg-slate-800/60 border border-slate-800 text-slate-500 hover:text-slate-300 rounded-xl transition flex items-center justify-center text-xs"
          >
            <i className={`fas ${sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
          </button>
        </div>
      )}

      {/* Mobile: User info at sidebar bottom */}
      {isMobile && (
        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0">
              {user?.username?.substring(0, 1).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-slate-200 truncate">{user?.name || user?.username || 'Foydalanuvchi'}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user?.role || 'operator'}</div>
            </div>
            <button
              onClick={logout}
              className="text-slate-500 hover:text-red-400 p-2 transition rounded-lg hover:bg-red-500/10 shrink-0"
              title="Chiqish"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <nav className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 shrink-0 z-30">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Button — only visible on mobile */}
          {isMobile && (
            <button
              id="mobile-hamburger-btn"
              onClick={() => setMobileSidebarOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-400 hover:text-amber-300 hover:border-amber-400/50 transition-all duration-200 active:scale-90 shadow-lg shadow-amber-500/5"
              aria-label="Menyuni ochish"
            >
              <i className="fas fa-bars text-lg"></i>
            </button>
          )}

          <img 
            src="/img/logo.png" 
            alt="Logo" 
            className="w-10 h-10 object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="hidden sm:block">
            <span className="text-sm font-black tracking-wider block bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-400">SMART PCH</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">O'zbekiston Temir Yo'llari</span>
          </div>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-md mx-6 hidden md:block">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-full py-1.5 pl-9 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition"
              placeholder="Qidiruv (xodim, poyezd yoki hujjat)..."
            />
          </div>
        </div>

        {/* Right side navigation details */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Services toggle */}
          <div className="relative services-dropdown-container">
            <button
              onClick={() => setServicesOpen(!servicesOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 hover:border-amber-500/30 text-xs font-bold text-slate-300 transition"
            >
              <i className="fas fa-th text-amber-500"></i>
              <span className="hidden sm:inline">XIZMATLAR</span>
              <i className={`fas fa-chevron-down text-[10px] transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {servicesOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-4 grid grid-cols-1 gap-2 z-50">
                <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest pb-1 border-b border-slate-800 mb-2">Smart Xizmatlar</div>
                <button className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded-xl transition text-left text-xs">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <i className="fas fa-map"></i>
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">PCh Xaritasi</div>
                    <div className="text-[10px] text-slate-500">Hududlar onlayn monitoringi</div>
                  </div>
                </button>
                <button 
                  onClick={() => {
                    setServicesOpen(false);
                    if (window.openHRMurojaatInboxModal) {
                      window.openHRMurojaatInboxModal();
                    } else {
                      alert('Murojaat qutisi yuklanmoqda...');
                    }
                  }}
                  className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded-xl transition text-left text-xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <i className="fas fa-inbox"></i>
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">Murojaatlar qutisi</div>
                    <div className="text-[10px] text-slate-500">Kelgan arizalar va tasdiqlash</div>
                  </div>
                </button>
                <button className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded-xl transition text-left text-xs">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <i className="fas fa-hard-hat"></i>
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">Smart-Monter</div>
                    <div className="text-[10px] text-slate-500">Ovozli oflayn mobil interfeys</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Clock */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full font-semibold text-xs tracking-wider">
            <i className="fas fa-clock"></i>
            <span>{time}</span>
          </div>

          {/* User profile (hidden on mobile — shown in sidebar instead) */}
          <div className={`${isMobile ? 'hidden' : 'flex'} items-center gap-3 border-l border-slate-800 pl-4`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black flex items-center justify-center text-sm shadow-md">
              {user?.username?.substring(0, 1).toUpperCase() || 'U'}
            </div>
            <div className="hidden xl:block">
              <div className="text-xs font-bold text-slate-200 leading-none">{user?.name || user?.username || 'Foydalanuvchi'}</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{user?.role || 'operator'}</div>
            </div>
            <button
              onClick={logout}
              className="text-slate-500 hover:text-red-400 p-1.5 transition rounded-lg hover:bg-red-500/5"
              title="Chiqish"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex min-h-0 relative">

        {/* ===== MOBILE: Overlay + Slide-in Sidebar ===== */}
        {isMobile && (
          <>
            {/* Dark overlay */}
            <div
              className={`fixed inset-0 z-40 transition-all duration-300 ${
                mobileSidebarOpen
                  ? 'bg-black/60 backdrop-blur-sm opacity-100 pointer-events-auto'
                  : 'opacity-0 pointer-events-none'
              }`}
              onClick={() => setMobileSidebarOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-in sidebar */}
            <aside
              className={`fixed top-0 left-0 h-full w-72 bg-slate-900 border-r border-slate-800 z-50 flex flex-col shadow-2xl shadow-black/50 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              {sidebarContent}
            </aside>
          </>
        )}

        {/* ===== DESKTOP: Inline Sidebar ===== */}
        {!isMobile && (
          <aside className={`bg-slate-900 border-r border-slate-800 shrink-0 transition-all duration-300 flex flex-col z-20 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
            {sidebarContent}
          </aside>
        )}

        {/* Content Area */}
        <main className="flex-1 bg-slate-950 p-4 md:p-6 overflow-y-auto relative">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
