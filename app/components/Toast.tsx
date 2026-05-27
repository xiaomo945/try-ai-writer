"use client";

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

const toastStyles: Record<ToastType, string> = {
  success: "border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
  error: "border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20",
  info: "border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20",
  warning: "border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
};

const toastIcons: Record<ToastType, React.ComponentType<any>> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const toastColors: Record<ToastType, string> = {
  success: "text-emerald-600 dark:text-emerald-400",
  error: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
  warning: "text-yellow-600 dark:text-yellow-400",
};

export function Toast({ id, message, type, onClose }: ToastProps) {
  const Icon = toastIcons[type];
  
  return (
    <div 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${toastStyles[type]} slide-in-right`}
    >
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        .slide-in-right {
          animation: slideInRight 0.3s ease-out forwards;
        }
      `}</style>
      <Icon className={`w-5 h-5 flex-shrink-0 ${toastColors[type]}`} />
      <p className="text-sm text-slate-800 dark:text-slate-200 flex-1">{message}</p>
      <button 
        onClick={() => onClose(id)}
        className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
      >
        <X className="w-4 h-4 text-slate-500" />
      </button>
    </div>
  );
}
