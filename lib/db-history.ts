"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";

type HistoryRecord = {
  id: string;
  title: string;
  mode: string;
  result: string;
  createdAt: string;
};

export function useDbHistory() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // 从数据库加载历史记录
  const loadRecords = useCallback(async () => {
    if (!session?.user?.email) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/user/history");
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // 添加新记录到数据库
  const addRecord = useCallback(async (record: Omit<HistoryRecord, "id" | "createdAt">) => {
    if (!session?.user?.email) return null;

    try {
      const res = await fetch("/api/user/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });

      if (res.ok) {
        const newRecord = await res.json();
        setRecords(prev => [newRecord, ...prev]);
        return newRecord;
      }
    } catch (error) {
      console.error("Failed to add record:", error);
    }
    return null;
  }, [session?.user?.email]);

  // 删除记录
  const deleteRecord = useCallback(async (id: string) => {
    if (!session?.user?.email) return;

    try {
      const res = await fetch(`/api/user/history?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setRecords(prev => prev.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete record:", error);
    }
  }, [session?.user?.email]);

  // 清空所有记录
  const clearAll = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const res = await fetch("/api/user/history", {
        method: "DELETE",
      });

      if (res.ok) {
        setRecords([]);
      }
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  }, [session?.user?.email]);

  return {
    records,
    loading,
    addRecord,
    deleteRecord,
    clearAll,
    refresh: loadRecords,
  };
}
