import { useState, useCallback, useEffect } from "react";
import { plans } from "./pricing";

type UsageData = {
  date: string;
  claudeCount: number;
  deepseekCount: number;
};

const STORAGE_KEY = "use-ai-writer-usage";
const FREE_PLAN = plans[0]; // Free plan is always first

function getToday(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

/** Parse the daily limit from the Free plan's claudeLimit string (e.g. "10/day" → 10) */
function parseDailyLimit(limitStr: string): number {
  const match = limitStr.match(/(\d+)/);
  return match ? parseInt(match[1] ?? "10", 10) : 10;
}

const CLAUDE_DAILY_LIMIT = FREE_PLAN ? parseDailyLimit(FREE_PLAN.claudeLimit) : 10;
const DEEPSEEK_DAILY_LIMIT = FREE_PLAN ? parseDailyLimit(FREE_PLAN.deepseekLimit) : 10;

function readUsage(): UsageData {
  if (typeof window === "undefined") {
    return { date: getToday(), claudeCount: 0, deepseekCount: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: getToday(), claudeCount: 0, deepseekCount: 0 };
    const parsed: UsageData = JSON.parse(raw) as UsageData;
    if (parsed.date !== getToday()) {
      return { date: getToday(), claudeCount: 0, deepseekCount: 0 };
    }
    return parsed;
  } catch {
    return { date: getToday(), claudeCount: 0, deepseekCount: 0 };
  }
}

function writeUsage(data: UsageData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

export type ModelType = "claude" | "deepseek";

// Noise input detection
const GREETING_PATTERNS = [
  '你好', '在吗', '嗨', 'hello', 'hi', 'hey', '早上好', '晚上好', '晚安',
  '谢谢', '多谢', 'thanks', 'thank you', 'bye', '再见', 'ok', '好的', '嗯', '哦',
  '你好！', '在吗？', '嗨！', 'hello!', 'hi!', 'hey!', '好', '可以'
];

const MEANINGFUL_WORDS = [
  '写', '文章', '博客', '邮件', '社媒', '内容', '主题', '目标', '受众', '风格',
  'write', 'article', 'blog', 'post', 'email', 'content', 'topic', 'goal',
  'audience', 'style', 'tone', 'message', '宣传', '推广', '介绍', '产品',
  '服务', '公司', '品牌', '故事', '观点', '分析', '教程', '指南', '建议'
];

export interface NoiseCheckResult {
  isNoise: boolean;
  reason?: string;
  message?: string;
}

export function isNoiseInput(input: string): NoiseCheckResult {
  const trimmed = input.trim().toLowerCase();
  
  // Empty or whitespace only
  if (!trimmed) {
    return { isNoise: true, reason: 'empty', message: '请告诉我你想写什么内容。' };
  }
  
  // Pure greetings
  if (GREETING_PATTERNS.some(g => trimmed === g || trimmed === g.toLowerCase())) {
    return { 
      isNoise: true, 
      reason: 'greeting',
      message: '你好！想好要写什么了吗？详细描述你的想法，我可以更好地帮你创作。'
    };
  }
  
  // Pure punctuation and emojis
  const noPunctuation = trimmed.replace(/[\s\p{P}]/gu, '');
  if (!noPunctuation) {
    return { 
      isNoise: true, 
      reason: 'punctuation',
      message: '请告诉我更多关于你想写的内容。'
    };
  }
  
  // Pure numbers
  const noNumbers = trimmed.replace(/[\d\s]/g, '');
  if (!noNumbers) {
    return { 
      isNoise: true, 
      reason: 'numbers',
      message: '请补充内容描述，比如主题、风格、目标读者等。'
    };
  }
  
  // Too short without meaningful content
  if (trimmed.length < 5) {
    const hasMeaningful = MEANINGFUL_WORDS.some(w => trimmed.includes(w.toLowerCase()));
    if (!hasMeaningful) {
      return { 
        isNoise: true, 
        reason: 'too_short',
        message: '请告诉我更多关于你想写的内容，比如主题、风格、字数等。'
      };
    }
  }
  
  // Garbled/repeated characters detection
  const repeatedPattern = /(.+?)\1{3,}/;
  if (repeatedPattern.test(trimmed)) {
    return { 
      isNoise: true, 
      reason: 'garbled',
      message: '请用正常的语言描述你想写的内容。'
    };
  }
  
  // Consecutive consonants without vowels (English garbled text)
  const garbledEnglish = /[bcdfghjklmnpqrstvwxyz]{4,}/i;
  if (garbledEnglish.test(trimmed)) {
    return { 
      isNoise: true, 
      reason: 'garbled',
      message: '请用正常的语言描述你想写的内容。'
    };
  }
  
  return { isNoise: false };
}

export function useUsage() {
  const [usage, setUsage] = useState<UsageData>(readUsage);

  useEffect(() => {
    const data = readUsage();
    setUsage(data);
  }, []);

  const increment = useCallback((model: ModelType = "claude"): boolean => {
    const current = readUsage();

    if (model === "claude" && current.claudeCount >= CLAUDE_DAILY_LIMIT) return false;
    if (model === "deepseek" && current.deepseekCount >= DEEPSEEK_DAILY_LIMIT) return false;

    const updated: UsageData = {
      date: current.date,
      claudeCount: model === "claude" ? current.claudeCount + 1 : current.claudeCount,
      deepseekCount: model === "deepseek" ? current.deepseekCount + 1 : current.deepseekCount,
    };

    writeUsage(updated);
    setUsage(updated);
    return true;
  }, []);

  const used = usage.claudeCount + usage.deepseekCount;
  const limit = CLAUDE_DAILY_LIMIT + DEEPSEEK_DAILY_LIMIT;
  const canGenerate = used < limit;

  return {
    used,
    limit,
    claudeUsed: usage.claudeCount,
    claudeLimit: CLAUDE_DAILY_LIMIT,
    deepseekUsed: usage.deepseekCount,
    deepseekLimit: DEEPSEEK_DAILY_LIMIT,
    canGenerate,
    increment,
    planName: FREE_PLAN?.name ?? "Free",
  };
}
