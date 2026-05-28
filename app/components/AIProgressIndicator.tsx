"use client";

import { useHistory } from "@/lib/history";
import { Sparkles } from "lucide-react";

export function AIProgressIndicator() {
  const { records } = useHistory();
  const sampleCount = records.length;

  const getStatus = () => {
    if (sampleCount === 0) {
      return {
        emoji: "🟡",
        color: "text-amber-400",
        text: "开启学习，让AI越写越像你 →",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
      };
    }
    if (sampleCount < 5) {
      return {
        emoji: "🟡",
        color: "text-amber-400",
        text: `AI正在了解你...（${sampleCount}/5篇）`,
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
      };
    }
    if (sampleCount < 20) {
      return {
        emoji: "🟢",
        color: "text-emerald-400",
        text: `AI已初步掌握你的风格（${sampleCount}/20篇）`,
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
      };
    }
    return {
      emoji: "✅",
      color: "text-emerald-400",
      text: `AI已经很懂你了（${sampleCount}篇）`,
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
    };
  };

  const status = getStatus();

  return (
    <div 
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${status.bgColor} ${status.borderColor} border transition-all`}
      title="数字替身学习进度"
    >
      <Sparkles className={`w-3.5 h-3.5 ${status.color}`} />
      <span className={status.color}>
        {status.emoji} {status.text}
      </span>
    </div>
  );
}
