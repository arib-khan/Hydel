// src/app/admin/(protected)/ui/AdminUI.tsx
'use client';

// Small in-house UI layer for the admin panel: non-blocking toasts and a
// promise-based confirm dialog that replace the browser's native alert() and
// confirm(). Kept dependency-free and styled with the admin.css polish layer.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  title?: string;
  message: string;
}

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
}

interface AdminUIContextValue {
  toast: (message: string, type?: ToastType, title?: string) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const AdminUIContext = createContext<AdminUIContextValue | null>(null);

const TOAST_ICON = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  info: FiInfo,
} as const;

export function AdminUIProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);
  const nextId = useRef(1);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = 'success', title?: string) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, type, message, title }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  const confirm = useCallback((options: ConfirmOptions) => {
    setConfirmState(options);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const settleConfirm = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setConfirmState(null);
  }, []);

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <AdminUIContext.Provider value={value}>
      {children}

      <div className="admin-toast-viewport" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => {
          const Icon = TOAST_ICON[t.type];
          return (
            <div key={t.id} className={`admin-toast admin-toast--${t.type}`} role="status">
              <Icon className="admin-toast__icon" aria-hidden />
              <div className="admin-toast__body">
                {t.title && <p className="admin-toast__title">{t.title}</p>}
                <p className="admin-toast__msg">{t.message}</p>
              </div>
              <button
                type="button"
                className="admin-toast__close"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
              >
                <FiX size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {confirmState && (
        <div
          className="admin-modal-overlay"
          role="presentation"
          onClick={() => settleConfirm(false)}
        >
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-label={confirmState.title}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="admin-modal__title">{confirmState.title}</p>
            {confirmState.message && <p className="admin-modal__body">{confirmState.message}</p>}
            <div className="admin-modal__actions">
              <button
                type="button"
                className="admin-btn admin-btn--outline"
                onClick={() => settleConfirm(false)}
                autoFocus
              >
                {confirmState.cancelLabel || 'Cancel'}
              </button>
              <button
                type="button"
                className={`admin-btn ${
                  confirmState.tone === 'danger' ? 'admin-btn--danger-solid' : 'admin-btn--primary'
                }`}
                onClick={() => settleConfirm(true)}
              >
                {confirmState.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminUIContext.Provider>
  );
}

export function useAdminUI(): AdminUIContextValue {
  const ctx = useContext(AdminUIContext);
  if (!ctx) {
    throw new Error('useAdminUI must be used within <AdminUIProvider>');
  }
  return ctx;
}
