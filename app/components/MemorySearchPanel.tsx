'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Search, Clock, Lightbulb } from 'lucide-react';
import { searchMemory, type MemoryItem } from '@/lib/memory-bank';

interface MemorySearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMemory: (formattedText: string) => void;
  memories: MemoryItem[];
}

function highlightKeyword(text: string, keyword: string): string {
  if (!keyword.trim()) return text;
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return text.replace(regex, '<mark class="bg-emerald-200 dark:bg-emerald-700 rounded px-0.5">$1</mark>');
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function getMemoryTypeIcon(type: MemoryItem['type']): string {
  switch (type) {
    case 'idea': return '💡';
    case 'article': return '📄';
    case 'preference': return '⚙️';
    default: return '📝';
  }
}

export function MemorySearchPanel({ isOpen, onClose, onSelectMemory, memories }: MemorySearchPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MemoryItem[]>([]);

  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchMemory(memories, query);
      setResults(searchResults);
    } else {
      setResults(memories.slice(0, 20));
    }
  }, [query, memories]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults(memories.slice(0, 20));
    }
  }, [isOpen, memories]);

  const handleSelectMemory = useCallback((memory: MemoryItem) => {
    const keywords = memory.keywords.slice(0, 3).join('、');
    const truncatedContent = memory.content.length > 150 
      ? memory.content.slice(0, 150) + '...' 
      : memory.content;
    
    const formattedText = keywords 
      ? `基于我之前关于${keywords}的想法：${truncatedContent}`
      : `基于我之前的想法：${truncatedContent}`;
    
    onSelectMemory(formattedText);
    onClose();
  }, [onSelectMemory, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white dark:bg-gray-950 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out">
        <style jsx>{`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
          
          @keyframes slideInBottom {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
          
          .panel-desktop {
            animation: slideInRight 0.3s ease-out forwards;
          }
          
          .panel-mobile {
            animation: slideInBottom 0.3s ease-out forwards;
          }
          
          @media (min-width: 640px) {
            .panel-mobile {
              animation: none;
            }
          }
        `}</style>

        <div className="flex-1 flex flex-col panel-desktop panel-mobile overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="font-display font-bold text-slate-900 dark:text-white">
                  我的想法
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {memories.length} 条记忆
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
              aria-label="关闭面板"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="p-4 border-b border-slate-200 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索关键词..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Lightbulb className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  {query ? '没有找到相关记忆' : '还没有相关记忆'}
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  去写作页面告诉分身更多想法吧
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((memory) => (
                  <button
                    key={memory.id}
                    onClick={() => handleSelectMemory(memory)}
                    className="w-full text-left p-4 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0 mt-0.5">
                        {getMemoryTypeIcon(memory.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                            {memory.type === 'idea' ? '想法' : memory.type === 'article' ? '文章' : '偏好'}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="w-3 h-3" />
                            {formatRelativeTime(memory.createdAt)}
                          </span>
                        </div>
                        <p 
                          className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3"
                          dangerouslySetInnerHTML={{ 
                            __html: highlightKeyword(
                              memory.content.length > 150 
                                ? memory.content.slice(0, 150) + '...' 
                                : memory.content, 
                              query
                            )
                          }}
                        />
                        {memory.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {memory.keywords.slice(0, 3).map((keyword, idx) => (
                              <span 
                                key={idx}
                                className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-gray-800 px-2 py-0.5 rounded"
                              >
                                #{keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              点击记忆即可插入到写作框中
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
