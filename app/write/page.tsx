"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Zap, Copy, Download, Trash2, Loader2, Check, Info, X, Search, Sparkles, MessageSquare, Wand2, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useUsage } from "@/lib/usage";
import { useHistory } from "@/lib/history";
import { useBrandVoice } from "@/lib/brand-voice";
import { scoreStyleMatch, hasBrandProfile, getBrandProfile } from "@/lib/style-matcher";
import { checkStyleConsistency, ConsistencyWarning } from "@/lib/style-checker";
import { searchHistory, SearchResult } from "@/lib/history-search";
import { interviewUser, InterviewResult } from "@/lib/creative-interview";
import { buildEnhancedPrompt } from "@/lib/prompt-builder";

type WritingMode = "blog" | "email" | "social" | "custom";
type GenerateState = "idle" | "loading" | "done" | "error";
type CopyState = "idle" | "copied";
type ViewState = "input" | "interview" | "generating" | "result";

const examplePrompts = [
  { text: "How to write blog posts with AI that actually sound like you", icon: "📝" },
  { text: "Building an AI-powered content strategy that scales", icon: "📊" },
  { text: "Your brand voice AI writing: create your digital twin", icon: "🧬" },
  { text: "Affordable AI writing tools that don't suck in 2026", icon: "💸" },
];

interface StyleScore {
  score: number;
  breakdown: { tone: number; vocabulary: number; structure: number };
  suggestions: string[];
}

function StyleScoreCard({ score }: { score: StyleScore }) {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score.score / 100) * circumference;
  const scoreColor = score.score >= 70 ? "emerald" : score.score >= 50 ? "amber" : "red";

  const colorMap = {
    emerald: { stroke: "#059669", bg: "bg-emerald-50", text: "text-emerald-600", ring: "text-emerald-500" },
    amber: { stroke: "#f59e0b", bg: "bg-amber-50", text: "text-amber-600", ring: "text-amber-500" },
    red: { stroke: "#ef4444", bg: "bg-red-50", text: "text-red-600", ring: "text-red-500" },
  };

  const colors = colorMap[scoreColor];

  return (
    <div className={`rounded-xl ${colors.bg} p-4 border border-slate-200`}>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-200" />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={colors.stroke}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bold ${colors.text}`}>{score.score}</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-700 mb-2">Style Match</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Tone</span>
              <span className="font-medium text-slate-700">{score.breakdown.tone}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Vocabulary</span>
              <span className="font-medium text-slate-700">{score.breakdown.vocabulary}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Structure</span>
              <span className="font-medium text-slate-700">{score.breakdown.structure}%</span>
            </div>
          </div>
        </div>
      </div>
      {score.suggestions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Suggestions:</div>
          <ul className="text-xs text-slate-600 space-y-1">
            {score.suggestions.slice(0, 2).map((s, i) => (
              <li key={i} className="flex items-start gap-1">
                <span className="text-emerald-500">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ConsistencyWarningBox({ warnings, onOptimize }: { warnings: ConsistencyWarning[]; onOptimize: () => void }) {
  return (
    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold text-amber-800 text-sm mb-2">
            This text slightly deviates from your style
          </div>
          <ul className="space-y-1 mb-3">
            {warnings.map((w, i) => (
              <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                <span className="text-amber-500">•</span>
                {w.message}
              </li>
            ))}
          </ul>
          <button
            onClick={onOptimize}
            className="flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-sm font-medium transition-colors"
          >
            <Wand2 className="w-4 h-4" />
            One-click Optimize
          </button>
        </div>
      </div>
    </div>
  );
}

function HistorySearchModal({
  isOpen,
  onClose,
  records,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  records: Array<{ id: string; title: string; mode: string; result: string; createdAt: string }>;
  onSelect: (text: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (isOpen && records.length > 0) {
      const searchResults = searchHistory(records, query, 10);
      setResults(searchResults);
    }
  }, [isOpen, query, records]);

  useEffect(() => {
    if (isOpen && records.length > 0) {
      const searchResults = searchHistory(records, "", 10);
      setResults(searchResults);
    }
  }, [isOpen, records]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-bold text-slate-900">Quote from History</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your history..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {results.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {records.length === 0 ? "No history records yet" : "No matching results"}
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => {
                    onSelect(`Based on my previous writing: "${result.snippet.replace(/\*\*/g, "")}"`);
                    onClose();
                  }}
                  className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 mb-1 truncate" dangerouslySetInnerHTML={{ __html: result.title }} />
                      <p className="text-sm text-slate-500 line-clamp-2" dangerouslySetInnerHTML={{ __html: result.snippet }} />
                      <div className="text-xs text-slate-400 mt-2">
                        {new Date(result.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WriteEditor() {
  const { used, limit, canGenerate, increment } = useUsage();
  const { records, addRecord } = useHistory();
  const { profile } = useBrandVoice();

  const [mode, setMode] = useState<WritingMode>("blog");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [state, setState] = useState<GenerateState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [savedToast, setSavedToast] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [styleScore, setStyleScore] = useState<StyleScore | null>(null);
  const [consistencyWarnings, setConsistencyWarnings] = useState<ConsistencyWarning[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  // Creative Assistant state
  const [creativeAssistantEnabled, setCreativeAssistantEnabled] = useState(true);
  const [viewState, setViewState] = useState<ViewState>("input");
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [interviewAnswers, setInterviewAnswers] = useState<string[]>([]);

  // Load Creative Assistant setting from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("creative-assistant-enabled");
    if (stored === null) {
      localStorage.setItem("creative-assistant-enabled", "true");
    } else {
      setCreativeAssistantEnabled(stored === "true");
    }
  }, []);

  const handleCreativeAssistantToggle = (enabled: boolean) => {
    setCreativeAssistantEnabled(enabled);
    localStorage.setItem("creative-assistant-enabled", enabled ? "true" : "false");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loadId = params.get("load");
    if (loadId) {
      const stored = localStorage.getItem("use-ai-writer-history");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Array<{ id: string; title: string; mode: string; result: string }>;
          const record = parsed.find((r) => r.id === loadId);
          if (record) {
            setResult(record.result);
            setPrompt(record.title);
            setMode(record.mode as WritingMode);
            setState("done");
            setViewState("result");
          }
        } catch {
          // ignore parse errors
        }
      }
    }
  }, [records]);

  const calculateStyleScore = useCallback((text: string) => {
    if (!hasBrandProfile()) {
      setStyleScore(null);
      return;
    }

    const profile = getBrandProfile();
    if (!profile) {
      setStyleScore(null);
      return;
    }

    const score = scoreStyleMatch(text, profile);
    setStyleScore({
      score: score.score,
      breakdown: score.breakdown,
      suggestions: score.suggestions,
    });

    const samples: Array<{ id: string; content: string; createdAt: string }> = records.slice(0, 5).map((r) => ({
      id: r.id,
      content: r.result,
      createdAt: r.createdAt,
    }));

    const consistency = checkStyleConsistency(text, profile, samples);
    setConsistencyWarnings(consistency.warnings);
  }, [records]);

  const handleGenerate = useCallback(async (enhancedPrompt?: string) => {
    const promptToUse = enhancedPrompt || prompt;
    if (!promptToUse.trim()) return;
    if (!canGenerate) return;

    const allowed = increment();
    if (!allowed) {
      setError("Daily limit reached");
      setState("error");
      return;
    }

    setState("loading");
    setViewState("generating");
    setError(null);
    setResult("");
    setStyleScore(null);
    setConsistencyWarnings([]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: enhancedPrompt ? prompt : prompt, 
          mode, 
          enhancedPrompt 
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No readable stream available");

      const decoder = new TextDecoder();
      let done = false;
      let accumulated = "";

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          accumulated += decoder.decode(value, { stream: !done });
          setResult(accumulated);
        }
      }
      setState("done");
      setViewState("result");

      addRecord({
        title: prompt.length > 50 ? `${prompt.slice(0, 50)}...` : prompt,
        mode,
        result: accumulated,
      });

      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2000);

      calculateStyleScore(accumulated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setState("error");
    }
  }, [prompt, mode, canGenerate, increment, addRecord, calculateStyleScore]);

  const handleGenerateClick = useCallback(() => {
    if (!creativeAssistantEnabled) {
      handleGenerate();
      return;
    }

    const interviewResult: InterviewResult = interviewUser(prompt, mode, profile ?? undefined);
    if (interviewResult.needsInterview) {
      setInterviewQuestions(interviewResult.questions);
      setInterviewAnswers(new Array(interviewResult.questions.length).fill(""));
      setViewState("interview");
    } else {
      handleGenerate();
    }
  }, [creativeAssistantEnabled, prompt, mode, profile, handleGenerate]);

  const handleContinueWriting = useCallback(() => {
    const enhancedPrompt = buildEnhancedPrompt(prompt, interviewAnswers, interviewQuestions, mode, profile ?? undefined);
    handleGenerate(enhancedPrompt);
  }, [prompt, interviewAnswers, interviewQuestions, mode, profile, handleGenerate]);

  const handleSkipInterview = useCallback(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleOptimize = useCallback(async () => {
    if (!prompt.trim() || consistencyWarnings.length === 0) return;

    const styleAdjustment = consistencyWarnings
      .map((w) => w.suggestion)
      .join(". ");

    const optimizedPrompt = `${prompt}\n\nStyle note: ${styleAdjustment}`;

    setPrompt(optimizedPrompt);
    setConsistencyWarnings([]);
    setStyleScore(null);

    await handleGenerate();
  }, [prompt, consistencyWarnings, handleGenerate]);

  const handleCopy = useCallback(() => {
    if (result) {
      navigator.clipboard.writeText(result).catch(() => {});
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    }
  }, [result]);

  const handleDownload = useCallback(() => {
    if (result) {
      const blob = new Blob([result], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const date = new Date().toISOString().split("T")[0] ?? "unknown";
      a.download = `use-ai-writer-${mode}-${date}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [result, mode]);

  const handleClear = useCallback(() => {
    setPrompt("");
    setResult("");
    setState("idle");
    setViewState("input");
    setError(null);
    setStyleScore(null);
    setConsistencyWarnings([]);
    setInterviewQuestions([]);
    setInterviewAnswers([]);
  }, []);

  const handleQuoteFromHistory = useCallback((text: string) => {
    setPrompt((prev) => (prev ? `${prev}\n\n${text}` : text));
  }, []);

  const modes: { key: WritingMode; label: string }[] = [
    { key: "blog", label: "Blog Post" },
    { key: "email", label: "Email" },
    { key: "social", label: "Social Media" },
    { key: "custom", label: "Custom" },
  ];

  return (
    <main className="min-h-screen flex flex-col">
      <HistorySearchModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        records={records}
        onSelect={handleQuoteFromHistory}
      />

      <header className="border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-emerald-600 font-display text-xl font-extrabold">
            Use AI Writer
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {used}/{limit} today
            </span>
            <Link href="/dashboard" className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors">
              Dashboard
            </Link>
            <div className="w-8 h-8 rounded-full bg-emerald-200 dark:bg-emerald-800" />
          </div>
        </div>
      </header>

      <div className="flex-1 grid lg:grid-cols-[40%_60%]">
        <section className="p-6 flex flex-col gap-4 border-r border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {modes.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                    mode === key
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            
            {/* Creative Assistant Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                🧠 Creative Assistant
              </span>
              <button
                onClick={() => handleCreativeAssistantToggle(!creativeAssistantEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  creativeAssistantEnabled ? "bg-emerald-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    creativeAssistantEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {viewState === "interview" ? (
            <div className="flex-1 flex flex-col gap-4">
              <div className="text-center py-4">
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-2">
                  Let's personalize your writing
                </h3>
                <p className="text-sm text-slate-500">
                  Answer a few quick questions to get better results
                </p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                {interviewQuestions.map((question, index) => (
                  <div key={index} className="p-4 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {question}
                    </p>
                    <textarea
                      value={interviewAnswers[index]}
                      onChange={(e) => {
                        const newAnswers = [...interviewAnswers];
                        newAnswers[index] = e.target.value;
                        setInterviewAnswers(newAnswers);
                      }}
                      placeholder="Your answer..."
                      className="w-full rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[80px]"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSkipInterview}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors min-h-[44px]"
                >
                  Skip for now
                </button>
                <button
                  onClick={handleContinueWriting}
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors min-h-[44px] shadow-lg shadow-emerald-500/25"
                >
                  Continue writing
                </button>
              </div>
            </div>
          ) : (
            <>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Describe what you want to write in ${mode} mode...`}
                className="flex-1 min-h-[300px] w-full rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />

              {/* Empty State Prompt Suggestions */}
              {!prompt && !result && state === "idle" && (
                <div className="bg-slate-50 dark:bg-gray-800/50 rounded-xl p-4 border border-slate-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Describe what you want to write, or choose a template below
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {examplePrompts.map((example) => (
                      <button
                        key={example.text}
                        onClick={() => setPrompt(example.text)}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                      >
                        <span>{example.icon}</span>
                        <span className="truncate max-w-[200px]">{example.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowHistoryModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Quote from History
              </button>

              {!canGenerate && state !== "loading" && (
                <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-800 dark:text-amber-200">
                        Daily limit reached
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        You have used all {limit} free generations today. Upgrade to Pro for unlimited access.
                      </p>
                    </div>
                  </div>
                  <Link href="/pricing" className="btn-primary text-sm w-full text-center">
                    Upgrade to Pro
                  </Link>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleGenerateClick}
                  disabled={state === "loading" || !prompt.trim() || !canGenerate}
                  className="btn-primary flex-1 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Generate content"
                >
                  {state === "loading" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Generate
                    </>
                  )}
                </button>
                <button onClick={handleClear} className="btn-outline min-w-[44px]" aria-label="Clear all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </section>

        <section className="p-6 flex flex-col gap-4 bg-slate-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
              {state === "done" ? "Generated" : state === "loading" ? "Generating..." : "Your Result"}
            </h2>
            {result && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="btn-outline text-sm gap-2 min-h-[44px]"
                  aria-label="Copy result"
                >
                  {copyState === "copied" ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="btn-outline text-sm gap-2 min-h-[44px]"
                  aria-label="Download result"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>
            )}
          </div>

          {savedToast && (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-4 py-2 text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Saved to history
            </div>
          )}

          {styleScore && (
            <StyleScoreCard score={styleScore} />
          )}

          {consistencyWarnings.length > 0 && (
            <ConsistencyWarningBox warnings={consistencyWarnings} onOptimize={handleOptimize} />
          )}

          {state === "error" && (
            <div className="flex-1 rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6">
              <p className="text-red-600 dark:text-red-400 font-semibold">Error</p>
              <p className="text-red-500 dark:text-red-300 text-sm mt-2">{error}</p>
              <button onClick={() => handleGenerate()} className="btn-primary mt-4 text-sm">
                Retry
              </button>
            </div>
          )}
          {(state === "idle" && viewState !== "interview" && !result) && (
            <div className="flex-1 rounded-xl border border-dashed border-slate-300 dark:border-gray-700 flex items-center justify-center">
              <p className="text-slate-400 dark:text-slate-500">Your AI-generated content will appear here...</p>
            </div>
          )}
          {(result || state === "loading") && (
            <div
              ref={resultRef}
              className="flex-1 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 overflow-y-auto prose dark:prose-invert max-w-none"
            >
              {result ? (
                <div className="whitespace-pre-wrap">{result}</div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Waiting for response...
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
