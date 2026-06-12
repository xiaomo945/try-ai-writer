"use client";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-white dark:bg-[#0A0A0C] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white mb-4">
            Critical Error
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            {error.message || "An unexpected error occurred. Please try refreshing the page."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors min-h-[44px]"
            >
              <Home className="w-4 h-4" />
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}