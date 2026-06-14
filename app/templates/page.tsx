"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Star, Download, Heart } from "lucide-react";

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

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory, page, search]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      
      if (selectedCategory !== "all") {
        params.set("category", selectedCategory);
      }
      
      if (search) {
        params.set("search", search);
      }

      const res = await fetch(`/api/templates?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates);
        setCategories(data.categories);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to load templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadTemplates();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* 头部 */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            模板市场
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            发现专业写作模板，快速开始你的创作
          </p>

          {/* 搜索和过滤 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索模板..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </form>

            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">全部分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 模板列表 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse"
              >
                <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl mb-4" />
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16">
            <Filter className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              暂无模板
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {search ? "没有找到匹配的模板" : "还没有发布任何模板"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[44px]"
                >
                  上一页
                </button>
                <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[44px]"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TemplateCard({ template }: { template: Template }) {
  const tags = JSON.parse(template.tags || "[]");
  const isFree = template.price === 0;

  return (
    <a
      href={`/templates/${template.slug}`}
      className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
    >
      {/* 缩略图 */}
      <div className="aspect-video bg-gradient-to-br from-emerald-500 to-teal-600 relative overflow-hidden">
        {template.thumbnailUrl ? (
          <img
            src={template.thumbnailUrl}
            alt={template.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
            {template.title.charAt(0)}
          </div>
        )}
        
        {/* 价格标签 */}
        <div className="absolute top-3 right-3">
          {isFree ? (
            <span className="px-3 py-1 bg-white/90 text-emerald-600 rounded-full text-sm font-semibold">
              免费
            </span>
          ) : (
            <span className="px-3 py-1 bg-emerald-600 text-white rounded-full text-sm font-semibold">
              ¥{(template.price / 100).toFixed(2)}
            </span>
          )}
        </div>

        {/* 高级标记 */}
        {template.isPremium && (
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-semibold flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              高级
            </span>
          </div>
        )}
      </div>

      {/* 内容 */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
            {template.title}
          </h3>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {template.description}
        </p>

        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.slice(0, 3).map((tag: string, i: number) => (
            <span
              key={i}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 统计 */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              {template.usageCount}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-current text-yellow-500" />
              {template.rating.toFixed(1)} ({template.ratingCount})
            </span>
          </div>
          <span className="text-xs">{template.category.name}</span>
        </div>
      </div>
    </a>
  );
}
