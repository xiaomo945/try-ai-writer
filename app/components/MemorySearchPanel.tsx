'use client';
import { useState, useEffect, useRef } from 'react';
import { X, Search, History, Tag, Clock } from 'lucide-react';
import type { MemoryItem } from '@/lib/memory-bank';

interface MemorySearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryItem[];
  onSelectMemory: (memory: MemoryItem) => void;
}

export default function MemorySearchPanel({
  isOpen,
  onClose,
  memories,
  onSelectMemory,
}: MemorySearchPanelProps) {
  const [query, setQuery] = useState('');
  const [filteredMemories, setFilteredMemories] = useState<MemoryItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFilteredMemories(memories);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, memories]);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredMemories(memories);
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = memories.filter(
        (m) =>
          m.content.toLowerCase().includes(lowerQuery) ||
          m.keywords.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
      setFilteredMemories(filtered);
    }
  }, [query, memories]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getMemoryPreview = (content: string) => {
    const trimmed = content.trim();
    if (trimmed.length <= 150) return trimmed;
    return trimmed.slice(0, 150) + '...';
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    if (index === -1) return text;

    return (
      <>
        {text.slice(0, index)}
        <span className="bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-200 px-0.5 rounded">
          {text.slice(index, index + query.length)}
        </span>
        {text.slice(index + query.length)}
      </>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-950 rounded-t-3xl shadow-2xl max-h-[80vh] overflow-hidden animate-slideUp lg:top-0 lg:left-auto lg:right-0 lg:bottom-auto lg:w-[420px] lg:h-full lg:rounded-t-none lg:rounded-l-3xl">
        <style>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .animate-slideUp {
            animation: slideUp 0.3s ease-out forwards;
          }
        `}</style>

        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              My Memories
            </h3>
            {memories.length > 0 && (
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-gray-800 rounded-full text-xs text-slate-600 dark:text-slate-400">
                {memories.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your memories..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(80vh-140px)] lg:max-h-[calc(100vh-140px)]">
          {filteredMemories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <History className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-2">No memories yet</p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Chat with your twin in the writing page to build your memory bank
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMemories.map((memory) => (
                <button
                  key={memory.id}
                  onClick={() => {
                    onSelectMemory(memory);
                    onClose();
                  }}
                  className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-gray-700 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded-full text-xs text-blue-700 dark:text-blue-300">
                          <Tag className="w-3 h-3" />
                          {memory.type === 'idea' ? 'Idea' : 'Preference'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          {formatDate(memory.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {highlightMatch(getMemoryPreview(memory.content), query)}
                      </p>
                      {memory.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {memory.keywords.slice(0, 5).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-slate-100 dark:bg-gray-800 rounded text-xs text-slate-500 dark:text-slate-400"
                            >
                              #{tag}
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
      </div>
    </div>
  );
}
