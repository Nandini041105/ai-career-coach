import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      style: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200',
      iconColor: 'text-emerald-400'
    },
    error: {
      icon: AlertCircle,
      style: 'bg-rose-950/90 border-rose-500/40 text-rose-200',
      iconColor: 'text-rose-400'
    },
    info: {
      icon: Info,
      style: 'bg-indigo-950/90 border-indigo-500/40 text-indigo-200',
      iconColor: 'text-indigo-400'
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md max-w-md ${config.style}`}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1 text-xs font-medium leading-relaxed">{message}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
