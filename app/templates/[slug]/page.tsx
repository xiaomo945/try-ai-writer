"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Star, Download, User, Calendar, Tag, Heart, MessageSquare } from "lucide-react";

interface Template {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  tags: string;
  price: number;
  isPremium: boolean;
  usageCount: number;
  rating: number;
  ratingCount: number;
  thumbnailUrl: string | null;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export default function TemplateDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (slug) {
      loadTemplate();
      loadFavoriteStatus();
      loadReviews();
    }
  }, [slug]);

  const loadTemplate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/templates/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setTemplate(data);
      }
    } catch (error) {
      console.error("Failed to load template:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavoriteStatus = async () => {
    try {
      const res = await fetch(`/api/templates/${slug}/favorite`);
      if (res.ok) {
        const data = await res.json();
        setFavorited(data.favorited);
      }
    } catch (error) {
      console.error("Failed to load favorite status:", error);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await fetch(`/api/templates/${slug}/review`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Failed to load reviews:", error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const res = await fetch(`/api/templates/${slug}/favorite`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setFavorited(data.favorited);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const submitReview = async () => {
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/templates/${slug}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment || null,
        }),
      });
      if (res.ok) {
        setReviews([await res.json(), ...reviews]);
        setShowReviewForm(false);
        setReviewComment("");
        setReviewRating(5);
        // 重新加载模板以更新评分
        loadTemplate();
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            模板未找到
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            该模板可能已被删除或不存在
          </p>
          <a
            href="/templates"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回模板列表
          </a>
        </div>
      </div>
    );
  }

  const tags = JSON.parse(template.tags || "[]");
  const isFree = template.price === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* 返回按钮 */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a
            href="/templates"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回模板列表
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 标题和缩略图 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-emerald-500 to-teal-600 relative">
                {template.thumbnailUrl ? (
                  <img
                    src={template.thumbnailUrl}
                    alt={template.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
                    {template.title.charAt(0)}
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {template.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {template.author.name || "Unknown"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(template.createdAt).toLocaleDateString("zh-CN")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        {template.usageCount} 次使用
                      </span>
                    </div>
                  </div>
                  {template.isPremium && (
                    <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      高级
                    </span>
                  )}
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {template.description}
                </p>

                {/* 标签 */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {tags.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 评分 */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(template.rating)
                            ? "fill-current text-yellow-500"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {template.rating.toFixed(1)} ({template.ratingCount} 条评价)
                  </span>
                </div>
              </div>
            </div>

            {/* 模板内容预览 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                模板内容
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  {template.content}
                </pre>
              </div>
            </div>

            {/* 评价区域 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-6 h-6" />
                  用户评价 ({reviews.length})
                </h2>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-semibold min-h-[44px]"
                >
                  写评价
                </button>
              </div>

              {/* 评价表单 */}
              {showReviewForm && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      评分
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className="p-1"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= reviewRating
                                ? "fill-current text-yellow-500"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      评价内容（可选）
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="分享你对这个模板的看法..."
                      className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={submitReview}
                      disabled={submittingReview}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-semibold min-h-[44px] disabled:opacity-50"
                    >
                      {submittingReview ? "提交中..." : "提交评价"}
                    </button>
                    <button
                      onClick={() => {
                        setShowReviewForm(false);
                        setReviewComment("");
                        setReviewRating(5);
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-semibold min-h-[44px]"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}

              {/* 评价列表 */}
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无评价</p>
                  <p className="text-sm">成为第一个评价的人吧！</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold">
                          {review.user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {review.user.name || "匿名用户"}
                            </span>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? "fill-current text-yellow-500"
                                      : "text-gray-300 dark:text-gray-600"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {new Date(review.createdAt).toLocaleDateString("zh-CN")}
                          </p>
                          {review.comment && (
                            <p className="text-gray-700 dark:text-gray-300">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右侧：购买/使用卡片 */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sticky top-8">
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  {isFree ? (
                    <>
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        免费
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        ¥{(template.price / 100).toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <button className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold mb-4 min-h-[44px]">
                {isFree ? "立即使用" : "购买并使用"}
              </button>

              <button
                onClick={toggleFavorite}
                className={`w-full px-6 py-3 rounded-xl transition-colors font-semibold mb-4 min-h-[44px] flex items-center justify-center gap-2 ${
                  favorited
                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <Heart className={`w-5 h-5 ${favorited ? "fill-current" : ""}`} />
                {favorited ? "已收藏" : "收藏"}
              </button>

              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-between">
                  <span>分类</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {template.category.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>使用次数</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {template.usageCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>评分</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {template.rating.toFixed(1)} / 5
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>发布时间</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(template.createdAt).toLocaleDateString("zh-CN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
