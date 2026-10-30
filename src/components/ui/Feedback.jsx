import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from './cn';

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-800/70', className)} />;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-4', className)}>
      <div className="w-12 h-12 rounded-2xl bg-slate-800/60 text-slate-500 flex items-center justify-center mb-4">
        <Icon size={22} />
      </div>
      <h3 className="text-sm font-bold text-slate-200">{title}</h3>
      {description && <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
