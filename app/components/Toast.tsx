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
  success: "border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20",
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
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
  warning: "text-yellow-600 dark:text-yellow-400",
};

export function Toast({ id, message, type, onClose }: ToastProps) {
  const Icon = toastIcons[type];
  
  return (
    <div 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg glass-card ${toastStyles[type]} animate-in slide-in-from-right-4 fade-in duration-300`}
    >
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
