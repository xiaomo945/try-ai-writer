"use client";

import { useState, useEffect } from "react";
import type { FunnelData, FunnelStepData } from "@/lib/analytics";

interface ConversionFunnelProps {
  funnelId?: string;
}

interface FunnelDisplay extends FunnelData {
  name: string;
}

export function ConversionFunnel({ funnelId = "signup-funnel" }: ConversionFunnelProps) {
  const [funnel, setFunnel] = useState<FunnelDisplay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFunnel() {
      try {
        const response = await fetch("/api/analytics?type=analytics");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json() as {
          funnels: Array<{
            id: string;
            name: string;
            steps: Array<{ name: string; users: number; conversionRate: number }>;
          }>;
        };

        const target = data.funnels.find((f) => f.id === funnelId);
        if (target) {
          const maxUsers = target.steps[0]?.users ?? 1;
          const steps: FunnelStepData[] = target.steps.map((s, i) => ({
            stepName: s.name,
            stepOrder: i + 1,
            users: s.users,
            conversionRate: s.conversionRate,
            dropoffRate: i === 0 ? 0 : 100 - s.conversionRate,
          }));

          setFunnel({
            funnelId: target.id,
            name: target.name,
            steps,
            totalUsers: maxUsers,
          });
        }
      } catch (error) {
        console.error("Failed to load funnel data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFunnel();
  }, [funnelId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!funnel) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">No funnel data available</p>
          <p className="text-gray-400 text-sm mt-1">Start tracking funnel steps to see data</p>
        </div>
      </div>
    );
  }

  const overallConversion = funnel.totalUsers > 0
    ? ((funnel.steps[funnel.steps.length - 1]?.users ?? 0) / funnel.totalUsers) * 100
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 border border-gray-100 p-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            {funnel.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {funnel.totalUsers.toLocaleString()} total users
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-600">
            {overallConversion.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400">Overall conversion</div>
        </div>
      </div>

      <div className="space-y-3">
        {funnel.steps.map((step, index) => {
          const widthPercent = funnel.totalUsers > 0
            ? (step.users / funnel.totalUsers) * 100
            : 0;

          const isLast = index === funnel.steps.length - 1;
          const prevStep = index > 0 ? funnel.steps[index - 1] : null;
          const stepConversion = prevStep
            ? (step.users / prevStep.users) * 100
            : 100;

          return (
            <div key={step.stepName} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                    {step.stepOrder}
                  </span>
                  <span className="font-medium text-gray-900">{step.stepName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">
                    {step.users.toLocaleString()} users
                  </span>
                  {!isLast && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      stepConversion >= 70
                        ? "bg-emerald-50 text-emerald-700"
                        : stepConversion >= 40
                          ? "bg-teal-50 text-teal-700"
                          : "bg-red-50 text-red-600"
                    }`}>
                      {stepConversion.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Funnel bar */}
              <div className="relative h-10 bg-gray-50 rounded-xl overflow-hidden">
                <div
                  className={`h-full rounded-xl transition-all duration-700 ease-out ${
                    isLast
                      ? "bg-gradient-to-r from-emerald-600 to-teal-500"
                      : "bg-gradient-to-r from-emerald-500 to-emerald-600"
                  }`}
                  style={{ width: `${Math.max(widthPercent, 5)}%` }}
                />
                <div className="absolute inset-0 flex items-center px-3">
                  <span className="text-xs font-medium text-white drop-shadow-sm">
                    {widthPercent.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Dropoff indicator */}
              {!isLast && step.dropoffRate > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-400 pl-8">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span>{step.dropoffRate.toFixed(1)}% drop-off</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
