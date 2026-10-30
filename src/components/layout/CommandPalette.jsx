import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, CornerDownLeft, Sun, Moon, LogOut } from 'lucide-react';
import { NAV_ITEMS } from './navigation';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../ui';

// Apostrof turlari (' ‘ ʻ ’) farqini yo'qotib qidirish
function normalize(s) {
  return s.toLowerCase().replace(/[‘ʻ’`']/g, '');
}

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  const commands = useMemo(
    () => [
      ...NAV_ITEMS.map((item) => ({
        id: item.path,
        label: item.label,
        group: item.group,
        icon: item.icon,
        keywords: item.keywords,
        run: () => navigate(item.path),
      })),
      {
        id: 'theme',
        label: theme === 'light' ? 'Qorong‘i rejimga o‘tish' : 'Yorug‘ rejimga o‘tish',
        group: 'Amallar',
        icon: theme === 'light' ? Moon : Sun,
        keywords: 'mavzu tema dark light',
        run: toggleTheme,
      },
      { id: 'logout', label: 'Tizimdan chiqish', group: 'Amallar', icon: LogOut, keywords: 'logout chiqish', run: logout },
    ],
    [navigate, theme, toggleTheme, logout]
  );

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return commands;
    return commands.filter((c) => normalize(`${c.label} ${c.group} ${c.keywords || ''}`).includes(q));
  }, [commands, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  const run = (cmd) => {
    onClose();
    cmd.run();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      run(results[active]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  let lastGroup = null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-scale-in">
        <div className="flex items-center gap-3 px-4 border-b border-slate-800">
          <Search size={18} className="text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Bo‘lim yoki amalni qidiring..."
            className="flex-1 h-14 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <kbd className="text-[10px] font-semibold text-slate-500 border border-slate-800 rounded px-1.5 py-0.5">ESC</kbd>
        </div>

        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="py-10 text-center text-sm text-slate-500">Hech narsa topilmadi</li>
          )}
          {results.map((cmd, i) => {
            const showGroup = cmd.group !== lastGroup;
            lastGroup = cmd.group;
            const Icon = cmd.icon;
            return (
              <React.Fragment key={cmd.id}>
                {showGroup && (
                  <li className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {cmd.group}
                  </li>
                )}
                <li>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={() => run(cmd)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 h-11 rounded-xl text-left text-sm transition-colors',
                      i === active ? 'bg-amber-500/10 text-amber-400' : 'text-slate-300'
                    )}
                  >
                    <Icon size={17} className={i === active ? 'text-amber-400' : 'text-slate-500'} />
                    <span className="flex-1 font-medium">{cmd.label}</span>
                    {i === active && <CornerDownLeft size={14} className="text-amber-400/70" />}
                  </button>
                </li>
              </React.Fragment>
            );
          })}
        </ul>

        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-slate-800 text-[11px] text-slate-500">
          <span><kbd className="font-semibold">↑↓</kbd> tanlash</span>
          <span><kbd className="font-semibold">Enter</kbd> ochish</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
