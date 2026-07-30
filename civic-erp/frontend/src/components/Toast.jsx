import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Bell } from 'lucide-react';

let toastListener = null;

export const showToast = (message, type = 'info') => {
  if (toastListener) toastListener({ id: Date.now(), message, type });
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastListener = (toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    };
    return () => {
      toastListener = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 border animate-fadeIn ${
            t.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : t.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-white text-slate-800 border-slate-200'
          }`}
        >
          {t.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          ) : t.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <Bell className="w-4 h-4 text-blue-600 shrink-0" />
          )}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
