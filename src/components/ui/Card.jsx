import React from 'react';
import { cn } from './cn';

export function Card({ className, children, interactive = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-slate-900 border border-slate-800 rounded-2xl shadow-sm shadow-black/5',
        interactive && 'transition hover:border-amber-500/40 hover:shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, icon: Icon, action, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 px-5 pt-5', className)}>
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Icon size={18} />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-100 truncate">{title}</h3>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}
