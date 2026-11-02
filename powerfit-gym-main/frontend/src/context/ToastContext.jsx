import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Contenedor flotante de Notificaciones Toast */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg dark:shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200 ${
                isSuccess
                  ? 'bg-emerald-50 dark:bg-emerald-950/95 border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-200'
                  : isError
                  ? 'bg-red-50 dark:bg-red-950/95 border-red-200 dark:border-red-500/40 text-red-800 dark:text-red-200'
                  : isWarning
                  ? 'bg-amber-50 dark:bg-amber-950/95 border-amber-200 dark:border-amber-500/40 text-amber-800 dark:text-amber-200'
                  : 'bg-white dark:bg-slate-900/95 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 size={18} className="text-emerald-500 dark:text-emerald-400" />}
                {isError && <AlertCircle size={18} className="text-red-500 dark:text-red-400" />}
                {isWarning && <AlertTriangle size={18} className="text-amber-500 dark:text-amber-400" />}
                {!isSuccess && !isError && !isWarning && <Info size={18} className="text-blue-500 dark:text-blue-400" />}
              </div>

              <div className="flex-1 text-xs font-medium leading-relaxed">
                {toast.message}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                title="Cerrar notificación"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
  return ctx;
}