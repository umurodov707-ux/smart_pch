import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { cn } from './cn';

/**
 * Brauzerning alert()/confirm() oynalari o'rniga:
 *   const toast = useToast();      toast.success('Saqlandi');
 *   const confirm = useConfirm();  if (!(await confirm({ title: "O'chirilsinmi?" }))) return;
 */

const ToastContext = createContext(null);
const ConfirmContext = createContext(null);

const TOAST_STYLES = {
  success: { icon: CheckCircle2, className: 'text-emerald-400' },
  error: { icon: XCircle, className: 'text-red-400' },
  warning: { icon: AlertTriangle, className: 'text-amber-400' },
  info: { icon: Info, className: 'text-blue-400' },
};

let toastSeq = 0;

export function NotificationsProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const resolverRef = useRef(null);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, message, { duration = 4000 } = {}) => {
      const id = ++toastSeq;
      setToasts((list) => [...list.slice(-4), { id, type, message }]);
      if (duration > 0) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const toast = useMemo(
    () => ({
      success: (m, o) => push('success', m, o),
      error: (m, o) => push('error', m, o),
      warning: (m, o) => push('warning', m, o),
      info: (m, o) => push('info', m, o),
      dismiss,
    }),
    [push, dismiss]
  );

  const confirm = useCallback((options) => {
    const opts = typeof options === 'string' ? { title: options } : options;
    setConfirmState(opts);
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const closeConfirm = (result) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setConfirmState(null);
  };

  return (
    <ToastContext.Provider value={toast}>
      <ConfirmContext.Provider value={confirm}>
        {children}

        <Modal
          open={!!confirmState}
          onClose={() => closeConfirm(false)}
          size="sm"
          title={confirmState?.title}
          description={confirmState?.description}
          footer={
            <>
              <Button variant="secondary" onClick={() => closeConfirm(false)}>
                {confirmState?.cancelText || 'Bekor qilish'}
              </Button>
              <Button
                variant={confirmState?.danger ? 'danger-solid' : 'primary'}
                onClick={() => closeConfirm(true)}
                autoFocus
              >
                {confirmState?.confirmText || 'Tasdiqlash'}
              </Button>
            </>
          }
        />

        {createPortal(
          <div className="fixed z-[110] bottom-4 right-4 left-4 sm:left-auto flex flex-col gap-2 sm:w-96 pointer-events-none">
            {toasts.map((t) => {
              const { icon: Icon, className } = TOAST_STYLES[t.type];
              return (
                <div
                  key={t.id}
                  role="status"
                  className="pointer-events-auto flex items-start gap-3 bg-slate-900 border border-slate-800 rounded-xl shadow-xl shadow-black/20 px-4 py-3 animate-slide-up"
                >
                  <Icon size={18} className={cn('shrink-0 mt-0.5', className)} />
                  <p className="flex-1 text-sm text-slate-200 leading-snug">{t.message}</p>
                  <button
                    onClick={() => dismiss(t.id)}
                    className="text-slate-500 hover:text-slate-200 transition shrink-0"
                    aria-label="Yopish"
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>,
          document.body
        )}
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a NotificationsProvider');
  return ctx;
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a NotificationsProvider');
  return ctx;
}
