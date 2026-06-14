"use client";

import React from "react";

/**
 * Dashboard component - placeholder implementation.
 * Replace with actual dashboard with charts and metrics.
 */
export default function Dashboard() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Documents</h3>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">0</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Words Generated</h3>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">0</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Credits Remaining</h3>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">0</p>
        </div>
      </div>
    </div>
  );
}
