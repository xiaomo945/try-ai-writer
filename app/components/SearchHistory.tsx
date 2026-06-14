"use client";

import { useState, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";

interface SearchHistoryProps {
  onSearch: (query: string, mode?: string) => void;
  onClear: () => void;
  isSearching?: boolean;
}

export function SearchHistory({ onSearch, onClear, isSearching = false }: SearchHistoryProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("all");

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim(), mode);
    } else {
      onClear();
    }
  };

  const handleClear = () => {
    setQuery("");
    onClear();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        onSearch(query.trim(), mode);
      } else {
        onClear();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, mode]);

  return (
    <div className="flex items-center gap-2 p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索历史记录..."
          className="w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="all">全部模式</option>
        <option value="blog">博客</option>
        <option value="email">邮件</option>
        <option value="social">社交媒体</option>
        <option value="custom">自定义</option>
      </select>

      {isSearching && (
        <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
      )}
    </div>
  );
}
