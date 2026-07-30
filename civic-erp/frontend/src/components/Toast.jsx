import { useState, useEffect } from 'react';

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
          className={`pointer-events-auto px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border animate-fadeIn ${
            t.type === 'error'
              ? 'bg-red-950/90 text-red-200 border-red-800'
              : t.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
              : 'bg-surface-800 text-white border-surface-600'
          }`}
        >
          <span>{t.type === 'error' ? '⚠️' : t.type === 'success' ? '✅' : '🔔'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
