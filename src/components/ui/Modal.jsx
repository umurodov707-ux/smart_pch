import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from './cn';

const SIZES = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export function Modal({ open, onClose, title, description, size = 'md', footer, children, className }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full bg-slate-900 border border-slate-800 shadow-2xl shadow-black/30 outline-none',
          'rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col animate-scale-in',
          SIZES[size],
          className
        )}
      >
        {(title || onClose) && (
          <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
            <div>
              {title && <h2 className="text-base font-bold text-slate-100">{title}</h2>}
              {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 -mr-1 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-100 hover:bg-slate-800 transition"
                aria-label="Yopish"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className="px-5 pb-5 overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-800">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
}
