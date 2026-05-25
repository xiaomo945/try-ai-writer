'use client';

import { useState, useEffect, useCallback } from 'react';

export interface MemoryItem {
  id: string;
  content: string;
  type: 'idea' | 'article' | 'preference';
  keywords: string[];
  createdAt: string;
}

const MEMORY_KEY = 'use-ai-writer-memory';
const STORAGE_LIMITS = {
  free: 100,
  pro: 1000,
  max: Infinity
};

function extractKeywords(text: string): string[] {
  if (!text) return [];
  const words = text.split(/[\s,.!?;]+/).filter(word => word.length > 2);
  return [...new Set(words.map(w => w.toLowerCase()))];
}

export function useMemoryBank() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(MEMORY_KEY);
      if (stored) {
        try {
          setMemories(JSON.parse(stored));
        } catch {
          console.warn('Failed to parse memory bank');
        }
      }
    }
  }, []);

  const saveMemories = useCallback((newMemories: MemoryItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(MEMORY_KEY, JSON.stringify(newMemories));
    }
    setMemories(newMemories);
  }, []);

  const addMemory = useCallback((content: string, type: MemoryItem['type'], userType: keyof typeof STORAGE_LIMITS = 'free') => {
    const keywords = extractKeywords(content);
    const newMemory: MemoryItem = {
      id: Date.now().toString(),
      content: content.trim(),
      type,
      keywords,
      createdAt: new Date().toISOString()
    };

    const limit = STORAGE_LIMITS[userType];
    let newMemories = [newMemory, ...memories];
    if (newMemories.length > limit) {
      newMemories = newMemories.slice(0, limit);
    }
    saveMemories(newMemories);
    return newMemory;
  }, [memories, saveMemories]);

  const deleteMemory = useCallback((id: string) => {
    const newMemories = memories.filter(m => m.id !== id);
    saveMemories(newMemories);
  }, [memories, saveMemories]);

  const searchMemory = useCallback((keyword: string): MemoryItem[] => {
    const lowerKeyword = keyword.toLowerCase();
    return memories.filter(m =>
      m.keywords.some(k => k.includes(lowerKeyword)) ||
      m.content.toLowerCase().includes(lowerKeyword)
    );
  }, [memories]);

  const getRelevantMemories = useCallback((currentTopic: string): MemoryItem[] => {
    if (!currentTopic.trim()) return [];
    return searchMemory(currentTopic).slice(0, 5);
  }, [searchMemory]);

  return {
    memories,
    addMemory,
    deleteMemory,
    searchMemory,
    getRelevantMemories
  };
}
