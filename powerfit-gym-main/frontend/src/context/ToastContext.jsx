import React, { createContext, useCallback, useContext, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts((current) => [...current, { id, message, type }]);
    if (duration > 0) setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0">
        {toasts.map((toast) => (
          <div key={toast.id} className="flex items-start gap-3 rounded-xl border bg-white p-4 text-slate-800 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-500" />}
            {toast.type === 'error' && <AlertCircle size={18} className="text-red-500" />}
            {toast.type === 'warning' && <AlertTriangle size={18} className="text-amber-500" />}
            {toast.type !== 'success' && toast.type !== 'error' && toast.type !== 'warning' && <Info size={18} className="text-blue-500" />}
            <div className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</div>
            <button onClick={() => removeToast(toast.id)} title="Cerrar aviso" className="text-slate-500 hover:text-slate-900 dark:hover:text-white"><X size={15} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast debe usarse dentro de ToastProvider');
  return context;
}
