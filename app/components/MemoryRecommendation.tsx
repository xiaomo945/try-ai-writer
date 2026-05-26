'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Lightbulb } from 'lucide-react';
import type { MemoryItem } from '@/lib/memory-bank';

interface MemoryRecommendationProps {
  memories: MemoryItem[];
  onSelectMemory: (formattedText: string) => void;
}

function getRecentMemories(memories: MemoryItem[]): MemoryItem[] {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const recentMemories = memories.filter(memory => {
    const memoryDate = new Date(memory.createdAt);
    return memoryDate >= sevenDaysAgo;
  });

  recentMemories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Simple random selection without in-place swap to avoid TypeScript issues
  const result: MemoryItem[] = [];
  const indices = new Set<number>();
  while (result.length < 3 && result.length < recentMemories.length) {
    const randomIndex = Math.floor(Math.random() * recentMemories.length);
    if (!indices.has(randomIndex)) {
      indices.add(randomIndex);
      const memory = recentMemories[randomIndex];
      if (memory) {
        result.push(memory);
      }
    }
  }
  
  return result;
}

function formatMemoryText(memory: MemoryItem): string {
  const keywords = memory.keywords.slice(0, 3).join('、');
  const truncatedContent = memory.content.length > 80 
    ? memory.content.slice(0, 80) + '...' 
    : memory.content;
  
  return keywords 
    ? `基于我之前关于${keywords}的想法：${truncatedContent}`
    : `基于我之前的想法：${truncatedContent}`;
}

export function MemoryRecommendation({ memories, onSelectMemory }: MemoryRecommendationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [recommendations, setRecommendations] = useState<MemoryItem[]>([]);

  useEffect(() => {
    if (memories.length > 0) {
      const recent = getRecentMemories(memories);
      setRecommendations(recent);
      setIsVisible(true);
    }
  }, [memories]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleSelect = useCallback((memory: MemoryItem) => {
    onSelectMemory(formatMemoryText(memory));
    setIsVisible(false);
  }, [onSelectMemory]);

  if (!isVisible || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-white dark:bg-gray-900 border-l-4 border-emerald-600 rounded-xl shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            💡 你之前想过类似的主题，要参考吗？
          </span>
        </div>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full transition-colors min-h-[32px] min-w-[32px]"
          aria-label="关闭推荐"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>
      <div className="space-y-2">
        {recommendations.map((memory) => (
          <button
            key={memory.id}
            onClick={() => handleSelect(memory)}
            className="w-full text-left px-3 py-2 bg-slate-50 dark:bg-gray-800 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-sm text-slate-700 dark:text-slate-300 truncate"
          >
            {memory.content.length > 80 ? memory.content.slice(0, 80) + '...' : memory.content}
          </button>
        ))}
      </div>
    </div>
  );
}
