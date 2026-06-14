"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

interface AutoSaveOptions {
  content: string;
  onSave: (content: string) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
}

export function useAutoSave({
  content,
  onSave,
  debounceMs = 2000,
  enabled = true,
}: AutoSaveOptions) {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousContentRef = useRef<string>(content);

  useEffect(() => {
    if (!enabled || !session?.user?.email) {
      return;
    }

    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 如果内容没有变化，不保存
    if (content === previousContentRef.current) {
      return;
    }

    // 设置防抖定时器
    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      setError(null);

      try {
        await onSave(content);
        previousContentRef.current = content;
        setLastSaved(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : "保存失败");
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);

    // 清理函数
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, debounceMs, enabled, onSave, session?.user?.email]);

  return {
    isSaving,
    lastSaved,
    error,
  };
}
