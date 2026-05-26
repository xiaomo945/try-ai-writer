'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sparkles } from 'lucide-react';

type WritingMode = 'blog' | 'email' | 'social' | 'custom';

interface PromptSuggestionProps {
  prompt: string;
  mode: WritingMode;
  isInterviewMode: boolean;
  onSelectSuggestion: (suggestion: string) => void;
}

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,.!?;，。、；]+/)
    .filter(word => word.length > 2)
    .slice(0, 3);
}

function generateSuggestions(prompt: string, mode: WritingMode): string[] {
  const keywords = extractKeywords(prompt);
  const keywordStr = keywords.length > 0 ? keywords.join('、') : '你的主题';
  
  const suggestions: Record<WritingMode, string[]> = {
    blog: [
      `写一篇关于${keywordStr}的深度分析文章，包含3个案例和数据支持`,
      `创作一篇引人入胜的${keywordStr}博客，目标读者是内容创作者`
    ],
    email: [
      `写一封关于${keywordStr}的专业邮件，语气友好且清晰`,
      `写一封关于${keywordStr}的跟进邮件，包含明确的行动呼吁`
    ],
    social: [
      `写一条关于${keywordStr}的社交媒体帖子，适合在LinkedIn上分享`,
      `写一条关于${keywordStr}的Twitter/X帖子，控制在280字以内`
    ],
    custom: [
      `详细描述关于${keywordStr}的内容，包含目标受众、语气和关键要点`,
      `写一篇关于${keywordStr}的内容，要求详细、具体且有结构`
    ]
  };
  
  return suggestions[mode] || suggestions.custom;
}

export function PromptSuggestion({ prompt, mode, isInterviewMode, onSelectSuggestion }: PromptSuggestionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const checkShowSuggestions = useCallback(() => {
    if (prompt.length < 30 && !isInterviewMode && prompt.trim().length > 0) {
      const newSuggestions = generateSuggestions(prompt, mode);
      setSuggestions(newSuggestions);
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [prompt, mode, isInterviewMode]);

  useEffect(() => {
    if (timer) {
      clearTimeout(timer);
    }
    
    if (prompt.length > 0) {
      const newTimer = setTimeout(() => {
        checkShowSuggestions();
      }, 5000);
      setTimer(newTimer);
    } else {
      setIsVisible(false);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [prompt, checkShowSuggestions]);

  const handleSelect = useCallback((suggestion: string) => {
    onSelectSuggestion(suggestion);
    setIsVisible(false);
  }, [onSelectSuggestion]);

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 p-4 bg-slate-50 dark:bg-gray-800 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-emerald-600" />
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          ✏️ 想得到更好的结果？试试这样描述：
        </span>
      </div>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSelect(suggestion)}
            className="w-full text-left px-3 py-2 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-lg hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors text-sm text-slate-700 dark:text-slate-300 font-mono"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
