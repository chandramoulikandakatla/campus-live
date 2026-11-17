import React from 'react';
import { CheckCircle2, AlertTriangle, Sparkles, X } from 'lucide-react';
import { ToastInfo } from '../../types/ecosystem';

interface ToastProps {
  toast: ToastInfo | null;
  onClose: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4"
    >
      <div
        className={`p-2 rounded-xl shrink-0 ${
          toast.type === 'success'
            ? 'bg-emerald-500/20 text-emerald-400'
            : toast.type === 'error'
            ? 'bg-rose-500/20 text-rose-400'
            : 'bg-indigo-500/20 text-indigo-400'
        }`}
      >
        {toast.type === 'success' ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : toast.type === 'error' ? (
          <AlertTriangle className="w-5 h-5" />
        ) : (
          <Sparkles className="w-5 h-5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{toast.title}</p>
        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        aria-label="Close notification"
        className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded-lg hover:bg-white/5 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
