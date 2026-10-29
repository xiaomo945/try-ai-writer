"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Zap, Copy, Loader2, Save, Brain, Sparkles, BarChart3, CheckCircle2, XCircle, Maximize2, Minimize2, Download, FileText, FileCode2, ChevronDown, RefreshCw, RotateCcw, Cloud, X, Wand2 } from "lucide-react";
import Link from "next/link";
import { ApiKeySettings } from "@/components/ApiKeySettings";
import { getByokHeaders } from "@/lib/byok";
import { useHistory } from "@/lib/history";
import { useMemoryBank } from "@/lib/memory-bank";
import { useBrandVoice } from "@/lib/brand-voice";
import { createStorage } from "@/lib/storage";
import { useAutoSave } from "@/lib/use-auto-save";
import { scoreStyleMatch, type BrandVoiceProfile as MatcherProfile } from "@/lib/style-matcher";
import { findRelatedIdeas } from "@/lib/idea-linker";
import { getTemplateById } from "@/lib/templates";
import {
  analyzeSeo,
  analyzeOriginality,
  type SeoReport,
  type OriginalityReport,
} from "@/lib/content-analyzer";
import {
  optimizePrompt,
  type PromptOptimizeResult,
  type OptimizeMode,
} from "@/lib/prompt-optimizer";

type WritingMode = "blog" | "email" | "social" | "custom";
type GenerateState = "idle" | "loading" | "done" | "error";

/** A snapshot of work-in-progress, persisted so a refresh never loses the draft. */
type Draft = {
  prompt: string;
  output: string;
  mode: WritingMode;
  savedAt: string;
};

const draftStorage = createStorage("draft");
const DRAFT_KEY = "current";

const examplePrompts = [
  { text: "How to write blog posts with AI that actually sound like you", icon: "📝" },
  { text: "Building an AI-powered content strategy that scales", icon: "📊" },
  { text: "Your brand voice AI writing: create your digital twin", icon: "🧬" },
  { text: "Affordable AI writing tools that don't suck in 2026", icon: "💸" },
];

const loadingMessages = [
  "正在理解你的意图...",
  "根据你之前的风格组织语言...",
  "思考最好的表达方式...",
  "稍等，马上就好...",
  "润色中，让文字更流畅...",
];

const humanizedErrors = {
  offline: {
    message: "网络好像有点问题",
    suggestion: "我正努力重连... 你可以先检查一下网络。",
  },
  server: {
    message: "我的大脑卡了一下",
    suggestion: "正在重启。稍后再试试？",
  },
  timeout: {
    message: "思考时间有点长",
    suggestion: "可能是问题太难了。简化一下再问我？",
  },
  unknown: {
    message: "遇到了意外状况",
    suggestion: "已记录日志。刷新页面通常能解决。",
  },
} as const;

function getWordCountFeedback(count: number): string {
  if (count === 0) return "";
  if (count <= 100) return "开头难，继续加油";
  if (count <= 500) return "不错，在逐渐成型";
  if (count <= 1000) return "很充实，再丰富一下会更棒";
  return "太强了，一篇长文即将诞生";
}

function getCompletionFeedback(wordCount: number): string {
  if (wordCount > 500) return "写了不少呢！要不要再调整一下段落结构？";
  if (wordCount >= 200) return "结构清晰，部分句子可以再精简一点。";
  return "不错，继续往下写，我可以帮你扩展。";
}

function classifyError(error: unknown): { message: string; suggestion: string } {
  const msg = error instanceof Error ? error.message : String(error);
  if (!navigator.onLine || msg.includes("offline") || msg.includes("network") || msg.includes("Failed to fetch")) {
    return humanizedErrors.offline;
  }
  if (msg.includes("timeout") || msg.includes("abort") || msg.includes("Timeout")) {
    return humanizedErrors.timeout;
  }
  if (msg.includes("500") || msg.includes("503") || msg.includes("502") || msg.includes("server")) {
    return humanizedErrors.server;
  }
  return humanizedErrors.unknown;
}

const REFINE_ACTIONS: { id: string; label: string; instruction: string }[] = [
  {
    id: "rewrite",
    label: "重写",
    instruction:
      "Rewrite the following text completely. Keep the same core meaning, key points and approximate length, but use fresh wording, varied sentence structures, and improved flow. Preserve any markdown formatting.",
  },
  {
    id: "shorter",
    label: "更精简",
    instruction:
      "Rewrite the following text to be roughly half as long. Keep only the most essential information, remove redundancy, and preserve markdown formatting.",
  },
  {
    id: "longer",
    label: "更丰富",
    instruction:
      "Expand the following text with more detail, concrete examples, and elaboration while keeping the same tone, style, and markdown formatting.",
  },
  {
    id: "formal",
    label: "更正式",
    instruction:
      "Rewrite the following text in a more formal, professional, and polished tone. Keep the meaning and markdown formatting.",
  },
  {
    id: "casual",
    label: "更随性",
    instruction:
      "Rewrite the following text in a more casual, friendly, and conversational tone. Keep the meaning and markdown formatting.",
  },
  {
    id: "zh",
    label: "译中文",
    instruction: "将下面的内容翻译成中文，保持原意、语气、风格与段落结构，并保留 markdown 格式。",
  },
];

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function ExportMenu({
  output,
  title,
  modeLabel,
  up = false,
}: {
  output: string;
  title: string;
  modeLabel: string;
  up?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const safeTitle = (title.trim().slice(0, 40) || "try-ai-writer").replace(/[\\/:*?"<>|]/g, "_");

  const build = (format: "md" | "txt" | "html") => {
    let content = "";
    let ext = "";
    let mime = "";
    if (format === "txt") {
      content = output;
      ext = "txt";
      mime = "text/plain;charset=utf-8";
    } else if (format === "md") {
      content = `# ${modeLabel}\n\n${output}`;
      ext = "md";
      mime = "text/markdown;charset=utf-8";
    } else {
      const escaped = output
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const body = escaped
        .split(/\n{2,}/)
        .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
        .join("\n");
      content = `<!DOCTYPE html>\n<html lang="zh">\n<head><meta charset="utf-8"><title>${title.slice(0, 60)}</title>\n<style>body{font-family:system-ui,-apple-system,sans-serif;max-width:720px;margin:48px auto;padding:0 16px;line-height:1.75;color:#1a1a1a}h1{font-size:1.7em;margin-bottom:.6em}p{margin:.8em 0}</style></head>\n<body>\n<h1>${modeLabel}</h1>\n${body}\n</body>\n</html>`;
      ext = "html";
      mime = "text/html;charset=utf-8";
    }
    triggerDownload(content, `${safeTitle}.${ext}`, mime);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={!output}
        title="导出为文件，方便粘到博客、文档或微信"
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-sm transition-all min-h-[44px] disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        导出
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
      {open && (
        <div className={`absolute right-0 w-44 bg-white dark:bg-[#17171c] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl p-1 z-50 ${up ? "bottom-full mb-2" : "mt-2"}`}>
          <button
            onClick={() => build("md")}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-slate-200 transition-all text-left min-h-[40px]"
          >
            <FileText className="w-4 h-4 text-emerald-500" /> Markdown (.md)
          </button>
          <button
            onClick={() => build("txt")}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-slate-200 transition-all text-left min-h-[40px]"
          >
            <FileText className="w-4 h-4 text-slate-500" /> 纯文本 (.txt)
          </button>
          <button
            onClick={() => build("html")}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-slate-200 transition-all text-left min-h-[40px]"
          >
            <FileCode2 className="w-4 h-4 text-orange-500" /> 网页 (.html)
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 dark:bg-white/5 rounded-lg px-2 py-1.5">
      <div className="text-gray-400 dark:text-slate-500">{label}</div>
      <div className="font-medium text-gray-700 dark:text-slate-200 truncate">{value}</div>
    </div>
  );
}

function ContentInsights({
  seo,
  originality,
}: {
  seo: SeoReport;
  originality: OriginalityReport;
}) {
  const scoreColor = (s: number) =>
    s >= 80 ? "text-emerald-400" : s >= 60 ? "text-yellow-400" : "text-orange-400";

  return (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-emerald-400" />
        <h3 className="font-semibold">内容体检：SEO + 原创性</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 text-center">
          <div className={`text-3xl font-bold ${scoreColor(seo.score)}`}>{seo.score}</div>
          <div className="text-xs text-gray-400 dark:text-slate-500">SEO 评分</div>
        </div>
        <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 text-center">
          <div className={`text-3xl font-bold ${scoreColor(originality.score)}`}>
            {originality.score}
          </div>
          <div className="text-xs text-gray-400 dark:text-slate-500">原创性评分</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs">
        <Stat label="字数" value={seo.wordCount} />
        <Stat label="句均词数" value={seo.avgWordsPerSentence} />
        <Stat label="小标题" value={seo.headings.h2 + seo.headings.h3} />
        <Stat label="可读性" value={`${seo.readability.score} ${seo.readability.label}`} />
      </div>

      {seo.keywords.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-400 dark:text-slate-500 mb-2">主要关键词</div>
          <div className="flex flex-wrap gap-1.5">
            {seo.keywords.slice(0, 5).map((k) => (
              <span
                key={k.term}
                className="text-xs bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded-full"
              >
                {k.term} · {k.density.toFixed(1)}%
              </span>
            ))}
          </div>
        </div>
      )}

      {seo.suggestions.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-400 dark:text-slate-500 mb-2">SEO 建议</div>
          <ul className="space-y-1.5">
            {seo.suggestions.map((s, i) => (
              <li
                key={i}
                className="text-xs text-gray-600 dark:text-slate-300 flex items-start gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <div className="text-xs text-gray-400 dark:text-slate-500 mb-2">原创性 / 重复度</div>
        <ul className="space-y-1.5">
          {originality.findings.map((f, i) => (
            <li
              key={i}
              className="text-xs text-gray-600 dark:text-slate-300 flex items-start gap-1.5"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        {originality.duplicateSentences.length > 0 && (
          <div className="mt-2 space-y-1">
            {originality.duplicateSentences.slice(0, 3).map((d, i) => (
              <div key={i} className="text-xs text-orange-400 line-clamp-1">
                重复 ×{d.count}：{d.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WritePage() {
  const [mode, setMode] = useState<WritingMode>("blog");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [state, setState] = useState<GenerateState>("idle");
  const [savedToHistory, setSavedToHistory] = useState(false);
  const [savedToMemory, setSavedToMemory] = useState(false);
  const [showRelatedIdeas, setShowRelatedIdeas] = useState(true);
  const [copied, setCopied] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [completionTip, setCompletionTip] = useState<string | null>(null);
  const [errorInfo, setErrorInfo] = useState<{ message: string; suggestion: string } | null>(null);
  const [activeRefine, setActiveRefine] = useState<string | null>(null);
  const loadingMsgRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Focus mode state
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [showFocusExit, setShowFocusExit] = useState<boolean>(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const focusActionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchParams = useSearchParams();
  const { addRecord, records } = useHistory();
  const { memories, addMemory } = useMemoryBank();
  const { profile } = useBrandVoice();

  const relatedIdeas = useMemo(() => {
    if (!prompt.trim() || memories.length === 0) return [];
    return findRelatedIdeas(prompt, memories, 3);
  }, [prompt, memories]);

  const seoReport = useMemo(() => (output ? analyzeSeo(output) : null), [output]);
  const originalityReport = useMemo(
    () => (output ? analyzeOriginality(output) : null),
    [output]
  );

  const styleMatch = useMemo(() => {
    if (!output || !profile?.styleFingerprint) return null;
    const matcherProfile: MatcherProfile = {
      tone: { formality: 0.5, sentiment: "neutral", pace: "moderate" },
      commonPhrases: profile.commonPhrases || [],
      avgSentenceLength: profile.styleFingerprint.avgSentenceLength,
      avgParagraphLength: profile.styleFingerprint.avgParagraphSentenceCount,
      industryTerms: [],
    };
    return scoreStyleMatch(output, matcherProfile);
  }, [output, profile]);

  const outputWordCount = useMemo(() => {
    if (!output) return 0;
    return output.trim().split(/\s+/).filter(Boolean).length;
  }, [output]);

  // ── Draft auto-save ────────────────────────────────────────────────────────
  // A draft left behind by a previous visit. Surfaced as an opt-in banner
  // rather than silently overwriting whatever the user is currently typing.
  const [pendingDraft, setPendingDraft] = useState<Draft | null>(null);

  useEffect(() => {
    const d = draftStorage.get<Draft>(DRAFT_KEY);
    if (d && (d.prompt || d.output)) {
      setPendingDraft(d);
    }
  }, []);

  const clearDraft = useCallback(() => {
    draftStorage.remove(DRAFT_KEY);
    setPendingDraft(null);
  }, []);

  const restoreDraft = useCallback((d: Draft) => {
    setMode(d.mode);
    setPrompt(d.prompt);
    setOutput(d.output);
    if (d.output) setState("done");
    setPendingDraft(null);
  }, []);

  // ── Prompt optimizer ─────────────────────────────────────────────────────
  // `forPrompt` records which input the result was derived from, so editing the
  // prompt afterwards invalidates it automatically instead of applying a stale
  // optimisation to different text.
  const [optimization, setOptimization] = useState<{
    forPrompt: string;
    result: PromptOptimizeResult;
  } | null>(null);
  const [showOptimize, setShowOptimize] = useState(false);

  const handleOptimizePrompt = useCallback(() => {
    if (!prompt.trim()) return;
    const result = optimizePrompt(prompt, mode as OptimizeMode, profile);
    setOptimization({ forPrompt: prompt, result });
    setShowOptimize(true);
  }, [prompt, mode, profile]);

  const applyOptimization = useCallback(() => {
    if (!optimization) return;
    setShowOptimize(false);
    // The result was derived from the current prompt, so `optimizationIsCurrent`
    // is already true and the next generate call will pick it up.
    void handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optimization, prompt]);

  const optimizationIsCurrent =
    optimization !== null && optimization.forPrompt === prompt;

  const { isSaving: isDraftSaving, lastSaved: draftSavedAt } = useAutoSave({
    content: `${mode}\u0000${prompt}\u0000${output}`,
    onSave: () => {
      draftStorage.set<Draft>(DRAFT_KEY, {
        prompt,
        output,
        mode,
        savedAt: new Date().toISOString(),
      });
    },
    enabled: Boolean(prompt || output),
    debounceMs: 1500,
  });

  // Load focus mode from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("focus_mode");
      if (saved === "true") {
        setFocusMode(true);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  // Save focus mode to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("focus_mode", String(focusMode));
    } catch {
      // localStorage unavailable
    }
  }, [focusMode]);

  // Handle Esc key to exit focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && focusMode) {
        setFocusMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusMode]);

  // Auto-focus textarea when entering focus mode
  useEffect(() => {
    if (focusMode && promptRef.current) {
      promptRef.current.focus();
    }
  }, [focusMode]);

  // Handle mouse position at bottom of screen for showing exit button in focus mode
  useEffect(() => {
    if (!focusMode) return;
    const handleMouseMove = (e: MouseEvent) => {
      const windowHeight = window.innerHeight;
      const mouseY = e.clientY;
      if (mouseY > windowHeight - 80) {
        setShowFocusExit(true);
      } else {
        setShowFocusExit(false);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [focusMode]);

  // Load record from URL parameter
  useEffect(() => {
    const loadId = searchParams?.get("load");
    if (loadId) {
      const record = records.find(r => r.id === loadId);
      if (record) {
        setPrompt(record.title);
        setOutput(record.result);
        setMode(record.mode as WritingMode);
        setState("done");
      }
    }
  }, [searchParams, records]);

  // Pre-fill from ?template=<id> (linked from the templates page)
  useEffect(() => {
    const templateId = searchParams?.get("template");
    if (!templateId) return;
    const tpl = getTemplateById(templateId);
    if (!tpl) return;
    setMode(tpl.mode as WritingMode);
    setPrompt((prev) => (prev.trim() ? prev : tpl.starterPrompt));
  }, [searchParams]);

  useEffect(() => {
    if (state === "loading") {
      setLoadingMsgIndex(Math.floor(Math.random() * loadingMessages.length));
      loadingMsgRef.current = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
    }
    return () => {
      if (loadingMsgRef.current) clearInterval(loadingMsgRef.current);
    };
  }, [state]);

  const handleGenerate = async (options?: { instruction?: string; promptOverride?: string }) => {
    const effectivePrompt = options?.promptOverride ?? prompt;
    if (!effectivePrompt.trim()) return;

    setState("loading");
    setOutput("");
    setSavedToHistory(false);
    setSavedToMemory(false);
    setErrorInfo(null);
    setCompletionTip(null);
    setActiveRefine(options?.instruction ?? null);

    if (!navigator.onLine) {
      setErrorInfo(humanizedErrors.offline);
      setState("error");
      setActiveRefine(null);
      return;
    }

    const relevantMemories =
      options?.instruction ? [] : relatedIdeas.length > 0 ? relatedIdeas.slice(0, 3).map((r) => r.memory.content) : [];

    let enhancedPrompt: string | undefined;
    if (!options?.instruction) {
      if (optimizationIsCurrent && optimization) {
        // The optimizer already folded the brand voice profile in, and added
        // structural constraints, so it beats the ad-hoc prompt below.
        enhancedPrompt = optimization.result.optimized;
      } else if (profile?.styleFingerprint) {
        const toneHint =
          profile.commonPhrases && profile.commonPhrases.length > 0
            ? `\nCommon phrases to use: ${profile.commonPhrases.slice(0, 5).join(", ")}`
            : "";
        enhancedPrompt = `You are writing in the user's unique brand voice. Key characteristics:\n- Average sentence length: ~${profile.styleFingerprint.avgSentenceLength || 18} words\n- Average paragraph length: ~${profile.styleFingerprint.avgParagraphSentenceCount || 3} sentences\n- Maintain a natural, conversational tone${toneHint}\n\nWrite content for this prompt: ${effectivePrompt}`;
      }
    }

    let response: Response | null = null;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);
        response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getByokHeaders() },
          body: JSON.stringify({
            prompt: effectivePrompt,
            mode,
            enhancedPrompt,
            relevantMemories,
            instruction: options?.instruction,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (response.ok) break;
        const errorData = await response.json().catch(() => ({}));
        lastError = new Error(errorData.error || errorData.suggestion || `HTTP ${response.status}`);
        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      } catch (e) {
        lastError = e instanceof Error ? e : new Error("Network error");
        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }
      }
    }

    if (!response || !response.ok) {
      setErrorInfo(classifyError(lastError));
      setState("error");
      setActiveRefine(null);
      return;
    }

    try {
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        fullText += text;
        setOutput(fullText);
      }

      if (!fullText.trim()) {
        setErrorInfo({ message: "AI服务暂时不可用", suggestion: "请稍后再试，或刷新页面" });
        setState("error");
        setActiveRefine(null);
        return;
      }

      setState("done");
      setActiveRefine(null);
      const wc = fullText.trim().split(/\s+/).filter(Boolean).length;
      setCompletionTip(getCompletionFeedback(wc));
      setTimeout(() => setCompletionTip(null), 5000);
    } catch (error) {
      setErrorInfo(classifyError(error));
      setState("error");
      setActiveRefine(null);
    }
  };

  const handleRefine = (instruction: string) => {
    if (!output) return;
    handleGenerate({ instruction, promptOverride: output });
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  const handleSaveToHistory = () => {
    if (!output) return;
    addRecord({
      title: prompt.slice(0, 50) + (prompt.length > 50 ? "..." : ""),
      mode,
      result: output,
    });
    setSavedToHistory(true);
    // Once it lives in history, the recovery draft has done its job.
    clearDraft();
    setTimeout(() => setSavedToHistory(false), 3000);
  };

  const handleSaveToMemory = () => {
    if (!output) return;
    addMemory(output, "article");
    setSavedToMemory(true);
    setTimeout(() => setSavedToMemory(false), 3000);
  };

  const getModeLabel = (m: WritingMode) => {
    const labels: Record<WritingMode, string> = {
      blog: "Blog Post",
      email: "Email",
      social: "Social Media",
      custom: "Custom",
    };
    return labels[m];
  };

  // Focus mode layout
  if (focusMode) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0A0A0C] flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3">
          <span className="text-xs text-slate-500">{getModeLabel(mode)}</span>
          <button
            onClick={() => setFocusMode(false)}
            className="text-slate-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="退出专注模式"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>

        {/* Textarea area */}
        <div className="px-6 pb-4">
          <textarea
            ref={promptRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Describe your ${getModeLabel(mode).toLowerCase()}...`}
            className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Generate button */}
        <div className="px-6 pb-4">
          <button
            onClick={() => handleGenerate()}
            disabled={state === "loading" || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all min-h-[44px]"
          >
            {state === "loading" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {loadingMessages[loadingMsgIndex]}
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Generate
              </>
            )}
          </button>
        </div>

        {/* Output area */}
        <div className="flex-1 overflow-y-auto px-6 pb-20">
          {state === "idle" && (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-emerald-400" />
              </div>
              <p className="text-lg font-semibold text-slate-300 mb-2">
                还没想好写什么？我可以帮你
              </p>
              <p className="text-sm text-slate-500">
                输入你的想法，然后点击 Generate
              </p>
            </div>
          )}

          {state === "loading" && (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-base">{loadingMessages[loadingMsgIndex]}</p>
            </div>
          )}

          {state === "error" && errorInfo && (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-lg font-semibold text-red-400 mb-2">{errorInfo.message}</p>
              <p className="text-sm text-slate-500 mb-6">{errorInfo.suggestion}</p>
              <button
                onClick={() => handleGenerate()}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-all min-h-[44px]"
              >
                <Zap className="w-4 h-4" />
                再试一次
              </button>
            </div>
          )}

          {state === "done" && (
            <div>
              {completionTip && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-emerald-400 flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  {completionTip}
                </div>
              )}
              <div className="whitespace-pre-wrap text-slate-200 text-lg leading-relaxed">
                {output}
              </div>
              {outputWordCount > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    {outputWordCount} words
                  </span>
                  <span className="text-xs text-slate-500">
                    {getWordCountFeedback(outputWordCount)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom action buttons (shown when generation is done, auto-fade after 5s) */}
        {state === "done" && <FocusModeActions
          copied={copied}
          savedToHistory={savedToHistory}
          savedToMemory={savedToMemory}
          output={output}
          title={prompt}
          modeLabel={getModeLabel(mode)}
          onCopy={handleCopy}
          onSaveToHistory={handleSaveToHistory}
          onSaveToMemory={handleSaveToMemory}
          timerRef={focusActionTimerRef}
        />}

        {/* Semi-transparent exit bar at bottom on hover */}
        <div
          className={`fixed bottom-0 left-0 right-0 transition-all duration-300 ${
            showFocusExit ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
          }`}
        >
          <div className="bg-white/5 backdrop-blur-md border-t border-white/10 px-6 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">按 Esc 或点击退出专注模式</span>
            <button
              onClick={() => setFocusMode(false)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors min-h-[44px] px-4"
            >
              <Minimize2 className="w-4 h-4" />
              退出
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal layout
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0C] text-gray-900 dark:text-white">
      <header className="border-b border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-emerald-400">
              ✨ Write
            </Link>
            <div className="flex items-center gap-3">
              {/* Auto-save status. Deliberately quiet: only says something
                  while writing or right after a save settles. */}
              {(prompt || output) && (
                <span
                  className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500"
                  title={draftSavedAt ? `草稿已保存 ${draftSavedAt.toLocaleTimeString()}` : undefined}
                >
                  {isDraftSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      保存草稿…
                    </>
                  ) : draftSavedAt ? (
                    <>
                      <Cloud className="w-3.5 h-3.5" />
                      草稿已保存
                    </>
                  ) : null}
                </span>
              )}
              <ApiKeySettings />
              <button
                onClick={() => setFocusMode(true)}
                className="text-slate-400 hover:text-emerald-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="专注模式"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <Link
                href="/dashboard"
                className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 pb-28 lg:pb-8">
        {pendingDraft && (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3">
            <RotateCcw className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm text-emerald-900 dark:text-emerald-200">
              发现上次未保存的草稿
              {pendingDraft.savedAt
                ? `（${new Date(pendingDraft.savedAt).toLocaleString()}）`
                : ""}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => pendingDraft && restoreDraft(pendingDraft)}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white transition-colors"
              >
                恢复
              </button>
              <button
                onClick={clearDraft}
                className="rounded-lg px-3 py-1.5 text-sm text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/10 transition-colors"
              >
                丢弃
              </button>
              <button
                onClick={clearDraft}
                className="text-emerald-700 dark:text-emerald-400 hover:opacity-70 min-h-[32px] min-w-[32px] flex items-center justify-center"
                aria-label="关闭"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">What do you want to write?</h1>
              <p className="text-gray-500 dark:text-slate-400">
                Choose a format and describe what you need. Your digital twin will help you!
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(["blog", "email", "social", "custom"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium capitalize transition-all min-h-[44px] ${
                    mode === m
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/10"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {relatedIdeas.length > 0 && showRelatedIdeas && (
              <div className="bg-white dark:bg-white/5 border border-emerald-500/30 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-semibold text-emerald-300">Related Ideas from Your Memory</h3>
                  </div>
                  <button
                    onClick={() => setShowRelatedIdeas(false)}
                    className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="关闭相关想法"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {relatedIdeas.map((idea, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400 dark:text-slate-400 text-xs">Relevance: {Math.round(idea.relevanceScore)}%</span>
                      </div>
                      <p className="text-gray-700 dark:text-slate-300 line-clamp-2">{idea.memory.content}</p>
                      {idea.matchedKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {idea.matchedKeywords.slice(0, 3).map((kw, j) => (
                            <span key={j} className="text-xs bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded-full">
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <textarea
                  ref={promptRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`Describe your ${getModeLabel(mode).toLowerCase()}...`}
                  className="w-full h-48 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 resize-none focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOptimizePrompt}
                  disabled={!prompt.trim()}
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-300 dark:border-emerald-500/40 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[36px]"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  优化这段提示词
                </button>
                {optimizationIsCurrent && optimization && (
                  <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    已优化 · 完整度 {optimization.result.score}/100
                  </span>
                )}
              </div>

              {showOptimize && optimization && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                      提示词完整度
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        optimization.result.score >= 70
                          ? "text-emerald-600"
                          : optimization.result.score >= 40
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {optimization.result.score}/100
                    </span>
                  </div>

                  {optimization.result.applied.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 mb-1">
                        已自动补充：
                      </p>
                      <ul className="text-xs text-emerald-900 dark:text-emerald-200 space-y-0.5">
                        {optimization.result.applied.map((a) => (
                          <li key={a}>· {a}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {optimization.result.issues.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-amber-800 dark:text-amber-300 mb-1">
                        这些只有你能补上（补充后输出会准很多）：
                      </p>
                      <ul className="text-xs text-gray-600 dark:text-slate-300 space-y-1">
                        {optimization.result.issues.map((i) => (
                          <li key={i.id}>
                            · <span className="font-medium">{i.label}</span>：{i.advice}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={applyOptimization}
                      className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white transition-colors"
                    >
                      应用优化版并生成
                    </button>
                    <button
                      onClick={() => setShowOptimize(false)}
                      className="rounded-lg px-3 py-1.5 text-sm text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/10 transition-colors"
                    >
                      知道了
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm text-gray-400 dark:text-slate-500">Try these:</p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example.text)}
                      className="text-left bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-gray-600 dark:text-slate-300 transition-all min-h-[44px]"
                    >
                      {example.icon} {example.text}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleGenerate()}
                disabled={state === "loading" || !prompt.trim()}
                className="hidden lg:flex w-full items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all min-h-[44px]"
              >
                {state === "loading" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {loadingMessages[loadingMsgIndex]}
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Generate
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Output</h2>
                {state === "done" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      title="复制到剪贴板，分享或粘贴到别处"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-sm transition-all min-h-[44px]"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={handleSaveToHistory}
                      disabled={savedToHistory}
                      title="保存你的作品，别丢了灵感"
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm transition-all min-h-[44px]"
                    >
                      {savedToHistory ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                      {savedToHistory ? "Saved!" : "History"}
                    </button>
                    <button
                      onClick={handleSaveToMemory}
                      disabled={savedToMemory}
                      title="你的写作偏好我都记着呢"
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-lg text-sm transition-all min-h-[44px]"
                    >
                      {savedToMemory ? <CheckCircle2 className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                      {savedToMemory ? "Memorized!" : "Memory"}
                    </button>
                    <ExportMenu output={output} title={prompt} modeLabel={getModeLabel(mode)} />
                  </div>
                )}
              </div>

              {completionTip && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-emerald-400 flex items-center gap-2 animate-success-pop">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  {completionTip}
                </div>
              )}

              <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 min-h-[400px] relative">
                {state === "idle" && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mb-6">
                      <Sparkles className="w-10 h-10 text-emerald-400" />
                    </div>
                    <p className="text-lg font-semibold text-gray-600 dark:text-slate-300 mb-2">
                      还没想好写什么？我可以帮你
                    </p>
                    <p className="text-sm text-gray-400 dark:text-slate-500 mb-6">
                      试试下方的写作模式，或者点击「创意采访」让我问你几个问题。
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {examplePrompts.slice(0, 3).map((ep, i) => (
                        <button
                          key={i}
                          onClick={() => { setPrompt(ep.text); }}
                          className="px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-500 dark:text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all min-h-[44px]"
                        >
                          {ep.icon} {ep.text.slice(0, 35)}...
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {state === "loading" && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 dark:text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className="text-base">{loadingMessages[loadingMsgIndex]}</p>
                  </div>
                )}

                {state === "error" && errorInfo && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
                      <XCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <p className="text-lg font-semibold text-red-400 mb-2">{errorInfo.message}</p>
                    <p className="text-sm text-gray-400 dark:text-slate-500 mb-6">{errorInfo.suggestion}</p>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleGenerate()}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-all min-h-[44px]"
                      >
                        <Zap className="w-4 h-4" />
                        再试一次
                      </button>
                      <a
                        href="mailto:hello@tryaiwriter.com"
                        className="text-sm text-gray-400 dark:text-slate-400 hover:text-emerald-400 transition-colors underline underline-offset-2"
                      >
                        联系支持
                      </a>
                    </div>
                  </div>
                )}

                {state === "done" && (
                  <div>
                    <div className="whitespace-pre-wrap text-gray-800 dark:text-slate-200">
                      {output}
                    </div>
                    {outputWordCount > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-white/10 flex items-center gap-3">
                        <span className="text-xs text-gray-400 dark:text-slate-500">
                          {outputWordCount} words
                        </span>
                        <span className="text-xs text-gray-400 dark:text-slate-500">
                          {getWordCountFeedback(outputWordCount)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {state === "done" && (
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <RefreshCw className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200">一键改写 / 润色</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {REFINE_ACTIONS.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => handleRefine(a.instruction)}
                        disabled={activeRefine !== null}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-slate-300 transition-all min-h-[40px] disabled:opacity-50"
                      >
                        {activeRefine === a.instruction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {state === "done" && seoReport && originalityReport && (
                <ContentInsights seo={seoReport} originality={originalityReport} />
              )}
            </div>
          </div>

          <div className="space-y-6">
            {styleMatch && (
              <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-6 h-6 text-emerald-400" />
                  <h3 className="font-semibold">Style Match Score</h3>
                </div>
                <div className="text-center mb-4">
                  <div className={`text-5xl font-bold mb-2 ${
                    styleMatch.score >= 80 ? "text-emerald-400" :
                    styleMatch.score >= 60 ? "text-yellow-400" :
                    "text-orange-400"
                  }`}>
                    {styleMatch.score}%
                  </div>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">Match with your writing style</p>
                </div>
                <div className="space-y-3 mb-4">
                  {[
                    { label: "Tone", value: styleMatch.breakdown.tone, color: "bg-emerald-500" },
                    { label: "Vocabulary", value: styleMatch.breakdown.vocabulary, color: "bg-blue-500" },
                    { label: "Structure", value: styleMatch.breakdown.structure, color: "bg-purple-500" },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-slate-400">{label}</span>
                        <span>{value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2">
                        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                {styleMatch.suggestions.length > 0 && (
                  <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-slate-300 mb-2">Suggestions</h4>
                    <ul className="space-y-2">
                      {styleMatch.suggestions.slice(0, 3).map((suggestion, i) => (
                        <li key={i} className="text-xs text-gray-500 dark:text-slate-400 flex items-start gap-2">
                          <Sparkles className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <h3 className="font-semibold">Digital Twin Status</h3>
              </div>
              {profile ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-slate-400 text-sm">Training Data</span>
                    <span className="text-emerald-400 font-medium">{profile.learningSamples || 0} samples</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-slate-400 text-sm">Style Fingerprint</span>
                    <span className={profile.styleFingerprint ? "text-emerald-400" : "text-yellow-400"}>
                      {profile.styleFingerprint ? "Ready" : "Needs more samples"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2 mt-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((profile.learningSamples || 0) / 20) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-slate-500">Write more to train your digital twin!</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-slate-400 text-sm mb-3">
                    Set up your digital twin to personalize your writing
                  </p>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm transition-all min-h-[44px]"
                  >
                    <Sparkles className="w-4 h-4" />
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-blue-400" />
                <h3 className="font-semibold">Memory Bank</h3>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">{memories.length}</div>
                <p className="text-gray-500 dark:text-slate-400 text-sm">memories stored</p>
              </div>
            </div>

            <Link
              href="/interview"
              title="让我问你几个问题，帮你打开思路"
              className="block bg-gradient-to-r from-emerald-600/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-5 hover:border-emerald-400/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <Brain className="w-6 h-6 text-emerald-400" />
                <h3 className="font-semibold text-emerald-300">Creative Interview</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400">让我问你几个问题，帮你打开思路</p>
            </Link>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-[#0A0A0C]/90 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 z-40 lg:hidden">
        <button
          onClick={() => handleGenerate()}
          disabled={state === "loading" || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all min-h-[48px]"
        >
          {state === "loading" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {loadingMessages[loadingMsgIndex]}
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Generate
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function FocusModeActions({
  copied,
  savedToHistory,
  savedToMemory,
  output,
  title,
  modeLabel,
  onCopy,
  onSaveToHistory,
  onSaveToMemory,
  timerRef,
}: {
  copied: boolean;
  savedToHistory: boolean;
  savedToMemory: boolean;
  output: string;
  title: string;
  modeLabel: string;
  onCopy: () => void;
  onSaveToHistory: () => void;
  onSaveToMemory: () => void;
  timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setVisible(false);
    }, 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerRef]);

  return (
    <div
      className={`px-6 py-3 border-t border-white/10 flex items-center justify-center gap-3 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <button
        onClick={onCopy}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-slate-300 transition-all min-h-[44px]"
      >
        {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copied!" : "Copy"}
      </button>
      <button
        onClick={onSaveToHistory}
        disabled={savedToHistory}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm transition-all min-h-[44px]"
      >
        {savedToHistory ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {savedToHistory ? "Saved!" : "History"}
      </button>
      <button
        onClick={onSaveToMemory}
        disabled={savedToMemory}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-lg text-sm transition-all min-h-[44px]"
      >
        {savedToMemory ? <CheckCircle2 className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
        {savedToMemory ? "Memorized!" : "Memory"}
      </button>
      <ExportMenu output={output} title={title} modeLabel={modeLabel} up />
    </div>
  );
}
