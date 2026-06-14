"use client";

import { useEffect, useCallback } from "react";

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
}

export function useShortcuts(shortcuts: Shortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // 如果在输入框中，不触发快捷键（除了全局快捷键）
      const target = event.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      
      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !(event.ctrlKey || event.metaKey);
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          // 如果是输入框中的快捷键，需要明确标记为全局
          if (isInput && !shortcut.key.startsWith("global:")) {
            continue;
          }
          
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}

// 常用快捷键配置
export const COMMON_SHORTCUTS = {
  SAVE: { key: "s", ctrl: true, description: "保存" },
  GENERATE: { key: "Enter", ctrl: true, description: "生成内容" },
  FOCUS_MODE: { key: "f", ctrl: true, shift: true, description: "专注模式" },
  COPY: { key: "c", ctrl: true, shift: true, description: "复制结果" },
  CLEAR: { key: "k", ctrl: true, shift: true, description: "清空输入" },
  HELP: { key: "/", ctrl: true, description: "显示快捷键帮助" },
} as const;
