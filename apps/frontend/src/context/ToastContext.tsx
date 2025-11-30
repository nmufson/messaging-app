'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const DEFAULT_DELAY = 3000;

export interface ToastMessage {
  id: string;
  header?: string;
  body: string;
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark';
  delay?: number;
}

interface ToastContext {
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContext | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer
        className="p-3"
        position="top-end"
        style={{ zIndex: 9999, position: 'fixed' }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            onClose={() => removeToast(toast.id)}
            delay={toast.delay || DEFAULT_DELAY}
            autohide
            bg={toast.variant?.toLowerCase()}
            show={true}
            style={{
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: 'none',
              overflow: 'hidden',
              background: 'gray',
            }}
          >
            {toast.header && (
              <Toast.Header>
                <strong className="me-auto">{toast.header}</strong>
              </Toast.Header>
            )}
            <Toast.Body
              className={toast.variant === 'light' ? 'text-dark' : 'text-white'}
            >
              {toast.body}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}
