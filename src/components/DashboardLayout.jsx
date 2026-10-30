import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Search,
  Sun,
  Moon,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  Map as MapIcon,
  Inbox,
  HardHat,
  Clock as ClockIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NAV_GROUPS, findNavItem } from './layout/navigation';
import CommandPalette from './layout/CommandPalette';
import { Badge, cn } from './ui';

const COLLAPSE_KEY = 'smartpch-sidebar-collapsed';

// Soat alohida komponentda: har soniyada faqat shu qism qayta chiziladi
function LiveClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="hidden lg:flex items-center gap-2 h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold tabular-nums">
      <ClockIcon size={14} className="text-amber-400" />
      {time.toLocaleTimeString('uz-UZ')}
    </div>
  );
}

function UserAvatar({ user, className }) {
  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 font-extrabold flex items-center justify-center shrink-0',
        className
      )}
    >
      {user?.username?.substring(0, 1).toUpperCase() || 'U'}
    </div>
  );
}

function SidebarNav({ collapsed, onNavigate }) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          {collapsed ? (
            <div className="mx-auto mb-2 w-6 border-t border-slate-800" />
          ) : (
            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {group.label}
            </div>
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.end}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-3 h-10 rounded-xl text-sm font-medium transition-colors',
                        collapsed ? 'justify-center' : 'px-3',
                        isActive
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-amber-400" />
                        )}
                        <Icon size={18} strokeWidth={isActive ? 2.3 : 2} className="shrink-0" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                        {collapsed && (
                          <span className="pointer-events-none absolute left-full ml-3 px-2 py-1 rounded-lg bg-slate-800 text-slate-100 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition z-50 shadow-lg">
                            {item.label}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function ServicesMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const services = [
    {
      icon: Inbox,
      tone: 'bg-emerald-500/10 text-emerald-400',
      title: 'Murojaatlar qutisi',
      desc: 'Kelgan arizalar va tasdiqlash',
      onClick: () => navigate('/dashboard/appeals'),
    },
    { icon: MapIcon, tone: 'bg-blue-500/10 text-blue-400', title: 'PCh Xaritasi', desc: 'Hududlar onlayn monitoringi', soon: true },
    { icon: HardHat, tone: 'bg-amber-500/10 text-amber-400', title: 'Smart-Monter', desc: 'Ovozli oflayn mobil interfeys', soon: true },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 transition"
      >
        <LayoutGrid size={15} className="text-amber-400" />
        <span className="hidden sm:inline">Xizmatlar</span>
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl shadow-black/20 p-2 z-50 animate-scale-in origin-top-right">
          <div className="px-2 pt-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Smart xizmatlar</div>
          {services.map((s) => (
            <button
              key={s.title}
              disabled={s.soon}
              onClick={() => {
                setOpen(false);
                s.onClick?.();
              }}
              className="w-full flex items-center gap-3 p-2 rounded-xl text-left transition hover:bg-slate-800/60 disabled:hover:bg-transparent disabled:cursor-default"
            >
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', s.tone, s.soon && 'opacity-60')}>
                <s.icon size={17} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn('text-sm font-semibold', s.soon ? 'text-slate-400' : 'text-slate-200')}>{s.title}</div>
                <div className="text-[11px] text-slate-500 truncate">{s.desc}</div>
              </div>
              {s.soon && <Badge>Tez orada</Badge>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Breadcrumbs() {
  const location = useLocation();
  const current = findNavItem(location.pathname);
  if (!current || current.end) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-5">
      <Link to="/dashboard" className="hover:text-slate-200 transition">Asosiy panel</Link>
      <ChevronRight size={13} />
      <span className="text-slate-500">{current.group}</span>
      <ChevronRight size={13} />
      <span className="font-semibold text-slate-200">{current.label}</span>
    </nav>
  );
}

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
    } catch (e) {
      // e'tiborsiz
    }
  }, [collapsed]);

  // Sahifa almashganda mobil menyu yopiladi
  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Ctrl+K / Cmd+K — qidiruv oynasi
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const displayName = user?.name || user?.username || 'Foydalanuvchi';

  const brand = (
    <Link to="/dashboard" className="flex items-center gap-3 min-w-0">
      <img
        src="/img/logo.png"
        alt="Logo"
        className="w-9 h-9 object-contain shrink-0"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
      <div className="min-w-0">
        <span className="block text-sm font-extrabold tracking-wide text-slate-100">SMART PCH</span>
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 truncate">
          O'zbekiston Temir Yo'llari
        </span>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* ===== Desktop sidebar ===== */}
      <aside
        className={cn(
          'hidden md:flex sticky top-0 h-screen flex-col shrink-0 bg-slate-900 border-r border-slate-800 transition-[width] duration-300 z-20',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <div className={cn('h-16 flex items-center border-b border-slate-800 shrink-0', collapsed ? 'justify-center' : 'px-5')}>
          {collapsed ? (
            <img src="/img/logo.png" alt="Logo" className="w-9 h-9 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            brand
          )}
        </div>
        <SidebarNav collapsed={collapsed} />
        <div className="p-3 border-t border-slate-800 shrink-0">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="w-full h-9 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-200 hover:bg-slate-800/50 transition"
            aria-label={collapsed ? 'Menyuni kengaytirish' : 'Menyuni yig‘ish'}
          >
            {collapsed ? <ChevronsRight size={16} /> : <><ChevronsLeft size={16} /> Yig‘ish</>}
          </button>
        </div>
      </aside>

      {/* ===== Mobil sidebar ===== */}
      <div
        className={cn(
          'md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'md:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-slate-900 border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 shrink-0">
          {brand}
          <button
            onClick={() => setMobileOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            aria-label="Yopish"
          >
            <X size={18} />
          </button>
        </div>
        <SidebarNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
        <div className="p-4 border-t border-slate-800 flex items-center gap-3 shrink-0">
          <UserAvatar user={user} className="w-10 h-10 text-sm" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-200 truncate">{displayName}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{user?.role || 'operator'}</div>
          </div>
          <button
            onClick={logout}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
            title="Chiqish"
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {/* ===== Asosiy qism ===== */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 md:px-6 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
            aria-label="Menyuni ochish"
          >
            <Menu size={18} />
          </button>

          <button
            onClick={() => setPaletteOpen(true)}
            className="flex-1 max-w-md h-9 flex items-center gap-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-sm text-slate-500 transition text-left"
          >
            <Search size={15} />
            <span className="flex-1 truncate">Qidiruv...</span>
            <kbd className="hidden sm:inline text-[10px] font-semibold border border-slate-800 rounded px-1.5 py-0.5">Ctrl K</kbd>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <ServicesMenu />
            <LiveClock />
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-amber-400 transition"
              aria-label={theme === 'light' ? 'Qorong‘i rejim' : 'Yorug‘ rejim'}
              title={theme === 'light' ? 'Qorong‘i rejim' : 'Yorug‘ rejim'}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <div className="hidden md:flex items-center gap-3 pl-3 ml-1 border-l border-slate-800">
              <UserAvatar user={user} className="w-8 h-8 text-xs" />
              <div className="hidden xl:block leading-tight">
                <div className="text-xs font-semibold text-slate-200">{displayName}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{user?.role || 'operator'}</div>
              </div>
              <button
                onClick={logout}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                title="Chiqish"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div key={location.pathname} className="max-w-7xl mx-auto animate-fade-in">
            <Breadcrumbs />
            <div className="space-y-6">{children}</div>
          </div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
