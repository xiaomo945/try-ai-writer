"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Feedback {
  id: string;
  type: "bug" | "feature" | "improvement" | "other";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "resolved" | "closed";
  rating?: number;
  createdAt: string;
}

const TYPE_LABELS = {
  bug: "问题报告",
  feature: "功能建议",
  improvement: "改进建议",
  other: "其他",
};

const TYPE_ICONS = {
  bug: "🐛",
  feature: "✨",
  improvement: "💡",
  other: "💬",
};

export function FeedbackForm() {
  const { data: session } = useSession();
  const [type, setType] = useState<Feedback["type"]>("feature");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Feedback["priority"]>("medium");
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, description, priority, rating }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTitle("");
        setDescription("");
        setRating(undefined);
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          感谢您的反馈！
        </h3>
        <p className="text-sm text-green-700">
          我们会认真考虑您的建议，持续改进产品
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          反馈类型
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(TYPE_LABELS) as Feedback["type"][]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`p-3 rounded-lg border-2 transition-all ${
                type === t
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-1">{TYPE_ICONS[t]}</div>
              <div className="text-xs font-medium">{TYPE_LABELS[t]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          标题
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="简要描述您的反馈"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          maxLength={200}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          详细描述
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="请详细描述您的问题或建议..."
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          required
          minLength={10}
          maxLength={2000}
        />
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          优先级
        </label>
        <div className="flex gap-2">
          {(["low", "medium", "high"] as Feedback["priority"][]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                priority === p
                  ? p === "high"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : p === "medium"
                    ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                    : "border-gray-500 bg-gray-50 text-gray-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {p === "high" ? "高" : p === "medium" ? "中" : "低"}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          整体评分（可选）
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-3xl transition-transform hover:scale-110 ${
                rating && star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50"
      >
        {submitting ? "提交中..." : "提交反馈"}
      </button>
    </form>
  );
}

export function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch("/api/feedback");
      const data = await res.json();
      setFeedbacks(data.feedbacks || []);
    } catch (error) {
      console.error("Failed to fetch feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-3">加载中...</div>;
  }

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-3">💬</div>
        <p>暂无反馈记录</p>
      </div>
    );
  }

  const STATUS_LABELS = {
    pending: "待处理",
    in_progress: "处理中",
    resolved: "已解决",
    closed: "已关闭",
  };

  const STATUS_COLORS = {
    pending: "bg-yellow-100 text-yellow-700",
    in_progress: "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-3">
      {feedbacks.map((feedback) => (
        <div
          key={feedback.id}
          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{TYPE_ICONS[feedback.type]}</span>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {feedback.title}
                </h4>
                <p className="text-xs text-gray-500">
                  {new Date(feedback.createdAt).toLocaleDateString("zh-CN")}
                </p>
              </div>
            </div>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                STATUS_COLORS[feedback.status]
              }`}
            >
              {STATUS_LABELS[feedback.status]}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {feedback.description}
          </p>
          {feedback.rating && (
            <div className="mt-2 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${
                    feedback.rating && i < feedback.rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
