import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from './cn';

const VARIANTS = {
  primary:
    'bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 shadow-sm shadow-amber-500/20 hover:brightness-105 active:brightness-95',
  secondary:
    'bg-slate-900 text-slate-200 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60',
  ghost: 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60',
  danger:
    'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15 hover:border-red-500/30',
  'danger-solid': 'bg-red-600 text-white hover:bg-red-500 shadow-sm shadow-red-600/20',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-sm gap-2 rounded-xl',
  icon: 'h-9 w-9 rounded-xl justify-center',
};

export const Button = React.forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, icon: Icon, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center font-semibold whitespace-nowrap transition-all duration-150 select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon && <Icon size={16} strokeWidth={2.2} />}
      {children}
    </button>
  );
});
