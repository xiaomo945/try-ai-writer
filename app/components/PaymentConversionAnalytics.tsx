"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Users, ArrowRight } from "lucide-react";
import { getFunnelDropoffAnalysis } from "@/lib/analytics";

interface FunnelStage {
  name: string;
  users: number;
  conversionRate: number;
  dropoffRate: number;
}

export default function PaymentConversionAnalytics() {
  const [stages, setStages] = useState<FunnelStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    try {
      const analyses = getFunnelDropoffAnalysis("payment");
      
      // Map analysis array to funnel stages
      const funnelStages: FunnelStage[] = analyses.map((a) => ({
        name: a.stepName,
        users: a.usersAtStep,
        conversionRate: 100 - a.dropoffRate,
        dropoffRate: a.dropoffRate,
      }));

      setStages(funnelStages);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalConversion = stages.length > 0 
    ? ((stages[stages.length - 1]?.users || 0) / (stages[0]?.users || 1)) * 100 
    : 0;

  const biggestDropoff = stages.reduce((max, stage) => 
    stage.dropoffRate > max.dropoffRate ? stage : max, 
    { dropoffRate: 0, name: "" }
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">
            Payment Conversion Funnel
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track your payment conversion performance
          </p>
        </div>
        <TrendingUp className="w-8 h-8 text-emerald-600" />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Total Conversion
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {totalConversion.toFixed(1)}%
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Total Visitors
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {stages[0]?.users || 0}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Biggest Drop-off
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {biggestDropoff.dropoffRate.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {biggestDropoff.name}
          </p>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="space-y-3">
        {stages.map((stage, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-emerald-600">
                    {index + 1}
                  </span>
                </div>
                <span className="font-medium text-slate-900 dark:text-white">
                  {stage.name}
                </span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {stage.users}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {stage.conversionRate.toFixed(1)}% conversion
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${stage.conversionRate}%` }}
              />
            </div>

            {/* Drop-off Indicator */}
            {stage.dropoffRate > 0 && (
              <div className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <ArrowRight className="w-4 h-4" />
                <span>{stage.dropoffRate.toFixed(1)}% drop-off</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {biggestDropoff.dropoffRate > 20 && (
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
            💡 Optimization Opportunity
          </p>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            The "{biggestDropoff.name}" stage has a {biggestDropoff.dropoffRate.toFixed(1)}% drop-off rate. 
            Consider optimizing this step to improve conversions.
          </p>
        </div>
      )}
    </div>
  );
}
