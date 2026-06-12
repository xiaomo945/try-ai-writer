"use client";

import React, { useEffect, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
  autoClose?: boolean;
  duration?: number;
}

const toastStyles: Record<ToastType, string> = {
  success: "border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/15",
  error: "border-l-4 border-red-500 bg-red-50 dark:bg-red-900/15",
  info: "border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/15",
  warning: "border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/15",
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
  warning: "text-amber-600 dark:text-amber-400",
};

const toastTextColors: Record<ToastType, string> = {
  success: "text-emerald-900 dark:text-emerald-100",
  error: "text-red-900 dark:text-red-100",
  info: "text-blue-900 dark:text-blue-100",
  warning: "text-amber-900 dark:text-amber-100",
};

export function Toast({ id, message, type, onClose, autoClose = true, duration = 3000 }: ToastProps) {
  const Icon = toastIcons[type];
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (autoClose) {
      timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onClose(id), 300);
      }, duration);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [id, autoClose, duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <div
      className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl ${toastStyles[type]} ${
        isExiting ? "animate-slide-out-right" : "animate-slide-in-right"
      } backdrop-blur-sm`}
      style={{ minWidth: "320px", maxWidth: "420px" }}
    >
      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slide-out-right {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(120%);
            opacity: 0;
          }
        }
      `}</style>
      
      <div className={`flex-shrink-0 ${toastColors[type]}`}>
        <Icon className="w-6 h-6" />
      </div>
      
      <p className={`flex-1 text-sm font-medium ${toastTextColors[type]}`}>
        {message}
      </p>
      
      <button
        onClick={handleClose}
        className={`flex-shrink-0 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${toastColors[type]}`}
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Toast container component for managing multiple toasts
export function ToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
      {children}
    </div>
  );
}

// Hook for managing toasts (simplified)
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastProps, "id" | "onClose">) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id, onClose: removeToast }]);
    return id;
  }, [removeToast]);

  return {
    toasts,
    addToast,
    removeToast,
  };
}
