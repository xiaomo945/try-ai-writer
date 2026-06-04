"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Zap, Copy, Loader2, Save, Brain, Sparkles, BarChart3, CheckCircle2, XCircle, Maximize2, Minimize2 } from "lucide-react";
import Link from "next/link";
import { useHistory } from "@/lib/history";
import { useMemoryBank } from "@/lib/memory-bank";
import { useBrandVoice } from "@/lib/brand-voice";
import { scoreStyleMatch, type BrandVoiceProfile as MatcherProfile } from "@/lib/style-matcher";
import { findRelatedIdeas } from "@/lib/idea-linker";

type WritingMode = "blog" | "email" | "social" | "custom";
type GenerateState = "idle" | "loading" | "done" | "error";

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

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setState("loading");
    setOutput("");
    setSavedToHistory(false);
    setSavedToMemory(false);
    setErrorInfo(null);
    setCompletionTip(null);

    if (!navigator.onLine) {
      setErrorInfo(humanizedErrors.offline);
      setState("error");
      return;
    }

    let response: Response | null = null;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, mode }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (response.ok) break;
        const errorData = await response.json().catch(() => ({}));
        lastError = new Error(errorData.error || errorData.suggestion || `HTTP ${response.status}`);
      } catch (e) {
        lastError = e instanceof Error ? e : new Error("Network error");
        if (attempt === 0) continue;
      }
    }

    if (!response || !response.ok) {
      setErrorInfo(classifyError(lastError));
      setState("error");
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

      setState("done");
      const wc = fullText.trim().split(/\s+/).filter(Boolean).length;
      setCompletionTip(getCompletionFeedback(wc));
      setTimeout(() => setCompletionTip(null), 5000);
    } catch (error) {
      setErrorInfo(classifyError(error));
      setState("error");
    }
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
            onClick={handleGenerate}
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
                onClick={handleGenerate}
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
                onClick={handleGenerate}
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
                        onClick={handleGenerate}
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
          onClick={handleGenerate}
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
  onCopy,
  onSaveToHistory,
  onSaveToMemory,
  timerRef,
}: {
  copied: boolean;
  savedToHistory: boolean;
  savedToMemory: boolean;
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
    </div>
  );
}
