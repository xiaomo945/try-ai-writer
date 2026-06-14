"use client";

import { useState, useEffect } from "react";
import type { TestResults, VariantResult } from "@/lib/ab-testing";

interface ABTestDashboardProps {
  testIds?: string[];
}

interface VariantDisplay extends VariantResult {
  isWinner: boolean;
}

interface TestDisplay extends TestResults {
  variants: VariantDisplay[];
  winner?: string;
}

function getSignificanceLabel(pValue: number): { label: string; color: string } {
  if (pValue < 0.01) return { label: "Highly Significant", color: "text-emerald-600" };
  if (pValue < 0.05) return { label: "Significant", color: "text-emerald-600" };
  if (pValue < 0.1) return { label: "Marginally Significant", color: "text-teal-500" };
  return { label: "Not Significant", color: "text-gray-500" };
}

function getSignificanceBg(pValue: number): string {
  if (pValue < 0.01) return "bg-emerald-50 border-emerald-200";
  if (pValue < 0.05) return "bg-emerald-50 border-emerald-200";
  if (pValue < 0.1) return "bg-teal-50 border-teal-200";
  return "bg-gray-50 border-gray-200";
}

export function ABTestDashboard({ testIds = [] }: ABTestDashboardProps) {
  const [results, setResults] = useState<TestDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await fetch("/api/analytics?type=ab-tests");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json() as { tests: Array<{ id: string; name: string; variants: VariantResult[]; totalParticipants: number; totalConversions: number; statisticalSignificance?: number }> };

        const displays = data.tests.map((test): TestDisplay | null => {
          const firstVariant = test.variants[0];
          if (!firstVariant) return null;
          const bestVariant = test.variants.reduce((best, v) =>
            v.conversionRate > best.conversionRate ? v : best
          , firstVariant);

          const variantsWithWinner: VariantDisplay[] = test.variants.map((v) => ({
            ...v,
            isWinner: v.variantId === bestVariant.variantId,
          }));

          return {
            testId: test.id,
            testName: test.name,
            variants: variantsWithWinner,
            totalParticipants: test.totalParticipants,
            totalConversions: test.totalConversions,
            statisticalSignificance: test.statisticalSignificance,
            winner: bestVariant.variantName,
          };
        }).filter((d): d is TestDisplay => d !== null);

        setResults(displays);
      } catch (error) {
        console.error("Failed to load A/B test results:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [testIds.join(",")]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 rounded-2xl" />
            <div className="h-24 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">No A/B tests running</p>
          <p className="text-gray-400 text-sm mt-1">Create a test to start optimizing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          A/B Test Dashboard
        </h2>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
          {results.length} {results.length === 1 ? "test" : "tests"} active
        </span>
      </div>

      {results.map((test) => (
        <TestCard key={test.testId} test={test} />
      ))}
    </div>
  );
}

function TestCard({ test }: { test: TestDisplay }) {
  const sigInfo = test.statisticalSignificance !== undefined
    ? getSignificanceLabel(test.statisticalSignificance)
    : null;
  const sigBg = test.statisticalSignificance !== undefined
    ? getSignificanceBg(test.statisticalSignificance)
    : "";

  const maxConversionRate = Math.max(...test.variants.map((v) => v.conversionRate));

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 border border-gray-100 p-6 transition-all duration-300">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{test.testName}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {test.totalParticipants.toLocaleString()} participants &middot;{" "}
            {test.totalConversions.toLocaleString()} conversions
          </p>
        </div>
        {sigInfo && (
          <div className={`px-3 py-1.5 rounded-xl border ${sigBg}`}>
            <span className={`text-sm font-medium ${sigInfo.color}`}>
              {sigInfo.label}
            </span>
            {test.statisticalSignificance !== undefined && (
              <span className="text-xs text-gray-400 ml-2">
                p={test.statisticalSignificance.toFixed(4)}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {test.variants.map((variant) => (
          <div
            key={variant.variantId}
            className={`rounded-2xl p-4 border transition-all duration-300 ${
              variant.isWinner
                ? "bg-emerald-50 border-emerald-200 shadow-sm"
                : "bg-gray-50 border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-900">{variant.variantName}</span>
              {variant.isWinner && (
                <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs font-medium rounded-full">
                  Winner
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Conversion Rate</span>
                <span className="font-bold text-gray-900">
                  {variant.conversionRate.toFixed(1)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    variant.isWinner ? "bg-emerald-600" : "bg-teal-500"
                  }`}
                  style={{
                    width: `${maxConversionRate > 0 ? (variant.conversionRate / maxConversionRate) * 100 : 0}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{variant.participants.toLocaleString()} users</span>
                <span>{variant.conversions.toLocaleString()} conversions</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
