"use client";

import { useState, useEffect } from "react";
import { getCommunityWorkflows, type WorkflowDefinition } from "@/lib/workflows";
import { useWorkflowReviews } from "@/lib/workflow-reviews";
import { Star, TrendingUp, Download } from "lucide-react";
import Link from "next/link";

interface WorkflowWithStats extends WorkflowDefinition {
  usageCount: number;
  averageRating: number;
}

const STORAGE_KEY = "workflow_usage_counts";

function getWorkflowUsageCounts(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

function incrementWorkflowUsage(workflowId: string): void {
  if (typeof window === "undefined") return;
  const counts = getWorkflowUsageCounts();
  counts[workflowId] = (counts[workflowId] || 0) + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
}

export function WorkflowRanking() {
  const [rankedWorkflows, setRankedWorkflows] = useState<WorkflowWithStats[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const workflows = getCommunityWorkflows();
    const usageCounts = getWorkflowUsageCounts();

    // Get reviews for each workflow
    const workflowsWithStats: WorkflowWithStats[] = workflows.map((workflow) => {
      // Get reviews from localStorage
      const allReviews = typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("workflow_reviews") || "[]")
        : [];
      const workflowReviews = allReviews.filter(
        (r: any) => r.workflowId === workflow.id
      );
      const avgRating =
        workflowReviews.length > 0
          ? workflowReviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
            workflowReviews.length
          : 0;

      return {
        ...workflow,
        usageCount: usageCounts[workflow.id] || 0,
        averageRating: avgRating,
      };
    });

    // Sort by usage count descending
    const sorted = workflowsWithStats.sort((a, b) => b.usageCount - a.usageCount);

    // Take top 10
    setRankedWorkflows(sorted.slice(0, 10));
    setIsLoaded(true);
  }, []);

  if (!isLoaded || rankedWorkflows.length === 0) {
    return null;
  }

  return (
    <div className="mb-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Hot Workflows</h2>
          <p className="text-sm text-slate-400">Most popular in the community</p>
        </div>
      </div>

      {/* Ranking List */}
      <div className="space-y-3">
        {rankedWorkflows.map((workflow, index) => (
          <RankingCard
            key={workflow.id}
            workflow={workflow}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  );
}

function RankingCard({
  workflow,
  rank,
}: {
  workflow: WorkflowWithStats;
  rank: number;
}) {
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: "from-yellow-500/20 to-yellow-600/10",
          border: "border-yellow-500/30",
          text: "text-yellow-400",
          icon: "🥇",
        };
      case 2:
        return {
          bg: "from-slate-400/20 to-slate-500/10",
          border: "border-slate-400/30",
          text: "text-slate-300",
          icon: "🥈",
        };
      case 3:
        return {
          bg: "from-orange-500/20 to-orange-600/10",
          border: "border-orange-500/30",
          text: "text-orange-400",
          icon: "🥉",
        };
      default:
        return {
          bg: "from-slate-800/50 to-slate-900/50",
          border: "border-white/5",
          text: "text-slate-400",
          icon: "",
        };
    }
  };

  const style = getRankStyle(rank);

  return (
    <div
      className={`glass-card p-4 bg-gradient-to-r ${style.bg} border ${style.border} hover:scale-[1.02] transition-all duration-200`}
    >
      <div className="flex items-center gap-4">
        {/* Rank Badge */}
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl">
          {style.icon ? (
            <span className="text-2xl">{style.icon}</span>
          ) : (
            <span className={`text-xl font-bold ${style.text}`}>#{rank}</span>
          )}
        </div>

        {/* Workflow Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{workflow.icon}</span>
            <h3 className="font-semibold text-white truncate">{workflow.name}</h3>
          </div>
          <p className="text-sm text-slate-400 truncate">{workflow.description}</p>
          <div className="flex items-center gap-3 mt-2">
            {/* Rating */}
            {workflow.averageRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs text-slate-400">
                  {workflow.averageRating.toFixed(1)}
                </span>
              </div>
            )}
            {/* Usage Count */}
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-slate-400">
                {workflow.usageCount} uses
              </span>
            </div>
          </div>
        </div>

        {/* Import Button */}
        <Link
          href={`/write?workflow=${workflow.id}`}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium transition-all min-h-[44px]"
          onClick={() => incrementWorkflowUsage(workflow.id)}
        >
          <Download className="w-4 h-4" />
          Import
        </Link>
      </div>
    </div>
  );
}
