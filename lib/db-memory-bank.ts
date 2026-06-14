"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";

export interface MemoryItem {
  id: string;
  content: string;
  type: "idea" | "preference" | "fact";
  createdAt: string;
}

export function useDbMemoryBank() {
  const { data: session } = useSession();
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 从数据库加载记忆
  const loadMemories = useCallback(async () => {
    if (!session?.user?.email) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/user/memories");
      if (res.ok) {
        const data = await res.json();
        setMemories(data.memories || []);
      }
    } catch (error) {
      console.error("Failed to load memories:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  // 添加新记忆
  const addMemory = useCallback(async (content: string, type: MemoryItem["type"] = "idea") => {
    if (!session?.user?.email || !content.trim()) return null;

    try {
      const res = await fetch("/api/user/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), type }),
      });

      if (res.ok) {
        const newMemory = await res.json();
        setMemories(prev => [newMemory, ...prev]);
        return newMemory;
      }
    } catch (error) {
      console.error("Failed to add memory:", error);
    }
    return null;
  }, [session?.user?.email]);

  // 删除记忆
  const deleteMemory = useCallback(async (id: string) => {
    if (!session?.user?.email) return;

    try {
      const res = await fetch(`/api/user/memories?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMemories(prev => prev.filter(m => m.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete memory:", error);
    }
  }, [session?.user?.email]);

  // 搜索记忆
  const searchMemories = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return memories.filter(
      m => m.content.toLowerCase().includes(lowerQuery)
    );
  }, [memories]);

  return {
    memories,
    loading,
    addMemory,
    deleteMemory,
    searchMemories,
    refresh: loadMemories,
  };
}
