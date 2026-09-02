import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border text-sm font-medium shadow-2xl backdrop-blur-md transition-all animate-fade-in ${
              toast.type === 'success'
                ? 'bg-[#151821]/95 text-[#F5F7FA] border-[#22C55E]/30 text-[#22C55E]'
                : toast.type === 'error'
                ? 'bg-[#151821]/95 text-[#F5F7FA] border-[#EF4444]/30 text-[#EF4444]'
                : 'bg-[#151821]/95 text-[#F5F7FA] border-[#7C5CFF]/30 text-[#7C5CFF]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-[#EF4444]" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-[#7C5CFF]" />}
              <span className="text-[#F5F7FA] font-normal">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#6B7280] hover:text-[#F5F7FA] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
