import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useToast, Toast as ToastType } from '../../components/providers/toast-provider';
import { strings } from '../../lib/constants/strings';

const { notifications } = strings;

const ToastContainer: React.FC = () => {
  const { toasts, dismiss } = useToast();

  return createPortal(
    <div 
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
      role="region"
      aria-label={notifications.title}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>,
    document.body
  );
};

interface ToastProps {
  toast: ToastType;
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  return (
    <div
      className={`
        pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all
        ${
          toast.variant === 'destructive'
            ? 'border-red-200 bg-red-50 text-red-900'
            : 'border-gray-200 bg-white text-gray-900'
        }
      `}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        {toast.variant === 'destructive' && (
          <svg
            className="h-5 w-5 text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            role="img"
            aria-label={notifications.errorIcon}
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <div className="flex-1">
          <div className="text-sm font-medium">{toast.title}</div>
          {toast.description && (
            <div className="mt-1 text-sm text-gray-500">{toast.description}</div>
          )}
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="absolute right-2 top-2 rounded-md p-1 text-gray-400 hover:text-gray-900"
        aria-label={notifications.closeNotification}
        title={notifications.closeNotification}
      >
        <svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
          role="img"
          aria-label={notifications.closeIcon}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export { ToastContainer };
export type { ToastProps };
