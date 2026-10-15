import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import type { ToastMessage } from '@/hooks/useAppData';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div
      className="fixed top-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-lg shadow-lg px-4 py-3 max-w-sm animate-toast-in ${
            toast.type === 'success'
              ? 'bg-white border border-sage-200'
              : toast.type === 'error'
              ? 'bg-white border border-error/30'
              : 'bg-white border border-card-border'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-sage-500 shrink-0 mt-0.5" />}
          <p className="text-sm text-text-main flex-1">{toast.message}</p>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-text-secondary hover:text-text-main transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
