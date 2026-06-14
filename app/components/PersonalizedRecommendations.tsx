"use client";

import { useState, useEffect, type ReactElement } from "react";
import type { Recommendation } from "@/lib/personalization";

interface PersonalizedRecommendationsProps {
  userId?: string;
  context?: string;
  maxItems?: number;
}

function getRecommendationIcon(type: Recommendation["type"]): ReactElement {
  switch (type) {
    case "content":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case "feature":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "action":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      );
  }
}

function getRecommendationColor(type: Recommendation["type"]): { bg: string; text: string; border: string } {
  switch (type) {
    case "content":
      return { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" };
    case "feature":
      return { bg: "bg-teal-50", text: "text-teal-500", border: "border-teal-100" };
    case "action":
      return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
  }
}

export function PersonalizedRecommendations({
  userId,
  context = "general",
  maxItems = 4,
}: PersonalizedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInterests, setUserInterests] = useState<string[]>([]);

  useEffect(() => {
    function loadRecommendations() {
      try {
        if (typeof window === "undefined") return;

        // Try to load user profile from localStorage
        if (userId) {
          const profilesRaw = localStorage.getItem("user_profiles");
          if (profilesRaw) {
            const profiles = JSON.parse(profilesRaw) as Record<string, { interests: string[] }>;
            const profile = profiles[userId];
            if (profile) {
              setUserInterests(profile.interests ?? []);
            }
          }
        }

        // Generate recommendations based on profile
        const recs = generateLocalRecommendations(userId, context, maxItems);
        setRecommendations(recs);
      } catch (error) {
        console.error("Failed to load recommendations:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, [userId, context, maxItems]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 border border-gray-100 p-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          Recommended for You
        </h2>
        {userInterests.length > 0 && (
          <div className="flex items-center gap-1">
            {userInterests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full"
              >
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => {
          const colors = getRecommendationColor(rec.type);
          return (
            <div
              key={rec.id}
              className={`group rounded-2xl border p-4 transition-all duration-300 hover:shadow-md cursor-pointer ${colors.border} ${colors.bg}/30`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                  {getRecommendationIcon(rec.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                    {rec.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {rec.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs font-medium ${colors.text}`}>
                      {rec.reason}
                    </span>
                  </div>
                </div>
              </div>

              {/* Score indicator */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      rec.score >= 90
                        ? "bg-emerald-600"
                        : rec.score >= 75
                          ? "bg-teal-500"
                          : "bg-gray-300"
                    }`}
                    style={{ width: `${rec.score}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{rec.score}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function generateLocalRecommendations(
  userId: string | undefined,
  context: string,
  limit: number
): Recommendation[] {
  if (typeof window === "undefined") return [];

  const recommendations: Recommendation[] = [];

  // Try to load profile
  type ProfileType = {
    interests: string[];
    behaviorTags: string[];
    preferredContentTypes: string[];
    engagementScore: number;
  } | null;
  let profile: ProfileType = null;
  if (userId) {
    try {
      const profilesRaw = localStorage.getItem("user_profiles");
      if (profilesRaw) {
        const profiles = JSON.parse(profilesRaw) as Record<string, ProfileType>;
        profile = profiles[userId] ?? null;
      }
    } catch {
      // ignore
    }
  }

  if (profile) {
    // Interest-based recommendations
    if (profile.interests.some((interest: string) => interest.includes("blog"))) {
      recommendations.push({
        id: "rec-blog",
        type: "content",
        title: "Latest AI Writing Tips",
        description: "Check out our newest blog posts on AI writing techniques",
        score: 85,
        reason: "Based on your interest in blog content",
      });
    }

    if (profile.behaviorTags.includes("tool-user")) {
      recommendations.push({
        id: "rec-tools",
        type: "feature",
        title: "Explore Advanced Tools",
        description: "Try our headline generator and outline builder",
        score: 90,
        reason: "You are an active tool user",
      });
    }

    if (profile.behaviorTags.includes("power-user") && !profile.behaviorTags.includes("converter")) {
      recommendations.push({
        id: "rec-upgrade",
        type: "action",
        title: "Upgrade to Pro",
        description: "Get unlimited access with our Pro plan",
        score: 95,
        reason: "You are a power user",
      });
    }

    if (profile.preferredContentTypes.includes("templates")) {
      recommendations.push({
        id: "rec-templates",
        type: "content",
        title: "Browse Templates",
        description: "Get started faster with ready-to-use templates",
        score: 82,
        reason: "Based on your content preferences",
      });
    }
  }

  // Context-specific
  if (context === "dashboard") {
    recommendations.push({
      id: "rec-write",
      type: "action",
      title: "Start Writing",
      description: "Create your next masterpiece with AI assistance",
      score: 80,
      reason: "Quick action from your dashboard",
    });
  }

  // Default recommendations if we don't have enough
  if (recommendations.length < limit) {
    const defaults: Recommendation[] = [
      {
        id: "rec-default-guide",
        type: "content",
        title: "Getting Started Guide",
        description: "Learn how to make the most of AI Writer",
        score: 75,
        reason: "Recommended for all users",
      },
      {
        id: "rec-default-tools",
        type: "feature",
        title: "Try Our Tools",
        description: "Explore our suite of AI writing tools",
        score: 70,
        reason: "Popular feature",
      },
      {
        id: "rec-default-pricing",
        type: "action",
        title: "View Pricing",
        description: "See our flexible pricing options",
        score: 65,
        reason: "Find the right plan for you",
      },
    ];

    for (const def of defaults) {
      if (recommendations.length >= limit) break;
      if (!recommendations.some((r) => r.id === def.id)) {
        recommendations.push(def);
      }
    }
  }

  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
