"use client";

/**
 * Debounced auto-save hook.
 *
 * Portable by design: it knows nothing about where the content goes.
 * The caller supplies `onSave`, so this works equally well with
 * localStorage, an API route, or (eventually) a real database.
 *
 * Cherry-picked from the archived `trae-1RaD7T` branch and adapted:
 * the original gated saving behind `session?.user?.email`, which made it
 * useless for signed-out visitors. Whether to save is now the caller's call.
 */

import { useEffect, useRef, useState } from "react";

interface AutoSaveOptions {
  /** The value to watch. Any change schedules a save. */
  content: string;
  /** Persist the value. May be async; rejections surface as `error`. */
  onSave: (content: string) => void | Promise<void>;
  /** Idle time before firing, in ms. Default 1500. */
  debounceMs?: number;
  /** Set false to suspend auto-saving entirely. Default true. */
  enabled?: boolean;
}

export function useAutoSave({
  content,
  onSave,
  debounceMs = 1500,
  enabled = true,
}: AutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousContentRef = useRef<string>(content);

  // Keep the latest onSave without re-arming the timer on every render.
  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    if (!enabled) return;

    // Nothing changed since the last successful save.
    if (content === previousContentRef.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      setError(null);

      try {
        await onSaveRef.current(content);
        previousContentRef.current = content;
        setLastSaved(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : "保存失败");
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, debounceMs, enabled]);

  return { isSaving, lastSaved, error };
}
