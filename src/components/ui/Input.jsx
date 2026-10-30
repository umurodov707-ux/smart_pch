import React, { useId } from 'react';
import { cn } from './cn';

export const Input = React.forwardRef(function Input(
  { label, icon: Icon, error, hint, className, id, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
            <Icon size={16} />
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={cn(
            'w-full h-11 bg-slate-950 border rounded-xl text-sm text-slate-100 placeholder-slate-600',
            'focus:outline-none focus:ring-2 transition',
            error
              ? 'border-red-500/50 focus:ring-red-500/20'
              : 'border-slate-800 focus:border-amber-500/60 focus:ring-amber-500/15',
            Icon ? 'pl-10 pr-4' : 'px-4',
            className
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : (
        hint && <p className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
});
