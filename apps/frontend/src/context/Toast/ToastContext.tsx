'use client';

import { useSelectedValues } from '@/hooks/general';
import { createContext, ReactNode, useContext } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import './Toast.css';

const DEFAULT_DELAY = 3000;

export interface ToastMessage {
  id: string;
  header?: string;
  body: string;
  variant?: 'success' | 'danger' | 'info';
  delay?: number;
}

type ToastVariant = NonNullable<ToastMessage['variant']>;

interface ToastContext {
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContext | undefined>(undefined);

const TOAST_VARIANT_CLASS_MAP: Record<ToastVariant, string> = {
  success: 'toast-item--success',
  danger: 'toast-item--danger',
  info: 'toast-item--info',
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const {
    values: toasts,
    add: addNewToast,
    removeBy,
  } = useSelectedValues<ToastMessage>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    // TODO: use UUID?
    const id = Math.random().toString(36).substring(2, 9);
    addNewToast({ ...toast, id });
  };

  const removeToast = (id: string) => {
    removeBy((toast) => toast.id === id);
  };

  const getToastVariantClass = (variant?: ToastMessage['variant']) => {
    if (!variant) {
      return TOAST_VARIANT_CLASS_MAP.info;
    }

    return TOAST_VARIANT_CLASS_MAP[variant];
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer
        className="toast-container flex w-full flex-col items-end gap-3 p-3"
        position="top-end"
        style={{ zIndex: 9999, position: 'fixed' }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            onClose={() => removeToast(toast.id)}
            delay={toast.delay || DEFAULT_DELAY}
            autohide
            show={true}
            className={`toast-item relative w-[min(94vw,22rem)] min-h-[5.5rem] min-w-[18rem] overflow-hidden rounded-2xl border border-slate-900/10 shadow-[0_14px_34px_rgba(15,23,42,0.16)] backdrop-blur-[2px] sm:min-w-[21.5rem] ${getToastVariantClass(toast.variant)}`}
          >
            <Toast.Body as="div" className="toast-item__body p-0 text-inherit">
              <div className="toast-item__content flex min-h-[5.5rem] items-start gap-3 px-4 py-4 pr-14">
                <div className="toast-item__text flex min-w-0 flex-1 flex-col gap-1.5">
                  {toast.header && (
                    <p className="toast-item__title m-0 text-base font-bold leading-5">
                      {toast.header}
                    </p>
                  )}
                  <p className="toast-item__message m-0 break-words text-[0.92rem] leading-relaxed opacity-95">
                    {toast.body}
                  </p>
                </div>
              </div>
            </Toast.Body>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="toast-item__close-button absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border-0 bg-white/20 text-inherit transition-all duration-150 hover:-translate-y-px hover:bg-white/30 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              aria-label="Close notification"
            >
              <i
                className="bi bi-x-lg text-[0.95rem] leading-none"
                aria-hidden="true"
              />
            </button>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}
