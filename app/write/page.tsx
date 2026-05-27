"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Zap, Copy, Download, Trash2, Loader2, Check, Info, X, Search, Sparkles, MessageSquare, Wand2, Lightbulb, Upload, Trash, Scissors, Plus, Briefcase, MessageCircle, CheckCircle2, Undo2, PenLine } from "lucide-react";
import Link from "next/link";
import { useUsage, isNoiseInput } from "@/lib/usage";
import { useHistory } from "@/lib/history";
import { useBrandVoice } from "@/lib/brand-voice";
import { scoreStyleMatch, hasBrandProfile, getBrandProfile } from "@/lib/style-matcher";
import { checkStyleConsistency, ConsistencyWarning } from "@/lib/style-checker";
import { searchHistory, SearchResult } from "@/lib/history-search";
import { interviewUser, InterviewResult } from "@/lib/creative-interview";
import { buildEnhancedPrompt } from "@/lib/prompt-builder";
import { useMemoryBank } from "@/lib/memory-bank";
import { fileProcessor, ProcessedFile } from "@/lib/file-processor";
import { DigitalTwinAvatar } from "@/app/components/DigitalTwinAvatar";
import { TwinIntroBubble } from "@/app/components/TwinIntroBubble";
import { Skeleton } from "@/app/components/Skeleton";
import { EmptyState } from "@/app/components/EmptyState";
import { ErrorState } from "@/app/components/ErrorState";
import { getEditSuggestions, type EditSuggestion } from "@/lib/edit-suggestions";
import { ModelSwitcher } from '@/app/components/ModelSwitcher';
import { MemorySearchPanel } from '@/app/components/MemorySearchPanel';
import { MemoryRecommendation } from '@/app/components/MemoryRecommendation';
import { PromptSuggestion } from '@/app/components/PromptSuggestion';
import { WritingExamples } from '@/app/components/WritingExamples';
import { useAvatarVariant } from '@/lib/avatar-variant';
import Logo from '@/app/components/Logo';

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
  const { used, limit, canGenerate, increment, selectedModel, isProUser } = useUsage();
  const { records, addRecord } = useHistory();
  const { profile } = useBrandVoice();
  const { memories, addMemory, getRelevantMemories } = useMemoryBank();

  const [mode, setMode] = useState<WritingMode>("blog");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [previousResult, setPreviousResult] = useState("");
  const [state, setState] = useState<GenerateState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [savedToast, setSavedToast] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [styleScore, setStyleScore] = useState<StyleScore | null>(null);
  const [consistencyWarnings, setConsistencyWarnings] = useState<ConsistencyWarning[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Creative Assistant state
  const [creativeAssistantEnabled, setCreativeAssistantEnabled] = useState(true);
  const [viewState, setViewState] = useState<ViewState>("input");
  const [interviewResult, setInterviewResult] = useState<InterviewResult | null>(null);
  const [interviewAnswers, setInterviewAnswers] = useState<string[]>([]);

  // File upload state
  const [uploadedFile, setUploadedFile] = useState<ProcessedFile | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Digital twin avatar state
  const { variant } = useAvatarVariant();
  const [avatarState, setAvatarState] = useState<'idle' | 'thinking' | 'approving' | 'expecting' | 'listening' | 'nodding' | 'questionAppearing'>('idle');
  const [avatarVisible, setAvatarVisible] = useState(false);
  const [focusedQuestionIndex, setFocusedQuestionIndex] = useState<number | null>(null);
  const [questionsAppeared, setQuestionsAppeared] = useState(false);
  // Digital twin intro bubble state
  const [showTwinIntro, setShowTwinIntro] = useState(false);
  const [introShown, setIntroShown] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('twin_intro_shown') === 'true';
    }
    return false;
  });

  // Memory search panel state
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);

  // Noise input state
  const [noiseMessage, setNoiseMessage] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [currentResultModel, setCurrentResultModel] = useState<"claude" | "deepseek">("deepseek");

  // Load Creative Assistant setting from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("creative-assistant-enabled");
    if (stored === null) {
      localStorage.setItem("creative-assistant-enabled", "true");
    } else {
      setCreativeAssistantEnabled(stored === "true");
    }
  }, []);
  
  // Close modals with Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUpgradeModal(false);
        setShowHistoryModal(false);
        setShowMemoryPanel(false);
        setShowTwinIntro(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const handleGenerate = useCallback(async (enhancedPrompt?: string, relevantMemories?: string[], useModel?: "claude" | "deepseek", isComparison?: boolean) => {
    const promptToUse = enhancedPrompt || prompt;
    if (!promptToUse.trim()) return;
    if (!canGenerate) return;

    const modelToUse = useModel || selectedModel;
    const allowed = increment(modelToUse);
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
          enhancedPrompt,
          relevantMemories
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
          if (isComparison) {
            setComparisonResult(accumulated);
          } else {
            setResult(accumulated);
          }
        }
      }
      setState("done");
      setViewState("result");

      setCurrentResultModel((useModel || selectedModel) as "deepseek" | "claude");

      if (!isComparison) {
        addRecord({
          title: prompt.length > 50 ? `${prompt.slice(0, 50)}...` : prompt,
          mode,
          result: accumulated,
        });

        // Save user's initial prompt to memory
        addMemory(prompt, 'idea');
        // Also save any interview answers if available
        if (interviewAnswers.length > 0) {
          interviewAnswers.forEach(answer => {
            if (answer.trim()) {
              addMemory(answer, 'preference');
            }
          });
        }

        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2000);

        calculateStyleScore(accumulated);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setState("error");
    }
  }, [prompt, mode, canGenerate, increment, addRecord, addMemory, interviewAnswers, calculateStyleScore, selectedModel]);

  const handleGenerateClick = useCallback(() => {
    // Check for noise input first
    const noiseCheck = isNoiseInput(prompt);
    if (noiseCheck.isNoise) {
      setNoiseMessage(noiseCheck.message || '请提供更详细的内容描述。');
      return;
    }
    
    setNoiseMessage(null);

    if (!creativeAssistantEnabled) {
      handleGenerate();
      return;
    }

    const relevantMemories = getRelevantMemories(prompt);
    const historicalViews = relevantMemories.map(m => m.content);
    const interview = interviewUser(prompt, mode, profile ?? undefined, historicalViews, memories);
    if (interview.needsInterview) {
      setInterviewResult(interview);
      setInterviewAnswers(new Array(interview.questions.length).fill(""));
      setViewState("interview");
      setAvatarVisible(true);
      setQuestionsAppeared(false);
      setAvatarState('questionAppearing');
      if (!introShown) {
        setShowTwinIntro(true);
      }
    } else {
      const memoriesText = relevantMemories.map(m => m.content).join("\n\n");
      handleGenerate(undefined, memoriesText ? [memoriesText] : []);
    }
  }, [creativeAssistantEnabled, prompt, mode, profile, getRelevantMemories, handleGenerate, introShown]);

  const handleQuestionAppeared = useCallback(() => {
    setQuestionsAppeared(true);
    setAvatarState('thinking');
  }, []);

  const handleContinueWriting = useCallback(() => {
    if (!interviewResult) return;

    setAvatarState('nodding');
    setTimeout(() => {
      setAvatarState('expecting');
      setTimeout(() => setAvatarVisible(false), 300);
    }, 600);
    
    const relevantMemories = getRelevantMemories(prompt);
    const enhancedPrompt = buildEnhancedPrompt(
      uploadedFile ? `${prompt}\n\n附加上传文件内容：\n${uploadedFile.text}` : prompt,
      interviewAnswers,
      interviewResult.questions,
      mode,
      profile ?? undefined
    );
    const memoriesText = relevantMemories.map(m => m.content).join("\n\n");

    handleGenerate(enhancedPrompt, memoriesText ? [memoriesText] : []);
  }, [prompt, interviewAnswers, interviewResult, mode, profile, uploadedFile, getRelevantMemories, handleGenerate]);

  const handleSkipInterview = useCallback(() => {
    setAvatarVisible(false);
    const relevantMemories = getRelevantMemories(prompt);
    const memoriesText = relevantMemories.map(m => m.content).join("\n\n");
    handleGenerate(undefined, memoriesText ? [memoriesText] : []);
  }, [prompt, getRelevantMemories, handleGenerate]);

  // Sound effect placeholder function
  const handleSound = useCallback((type: 'pop' | 'question' | 'approve' | 'nod') => {
    // Placeholder for future sound integration
    console.log(`Sound effect triggered: ${type}`);
  }, []);

  const handleEdit = useCallback(async (suggestion: EditSuggestion) => {
    if (!result) return;
    setPreviousResult(result);
    setIsEditing(true);
    try {
      const response = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText: result,
          editInstruction: suggestion.prompt,
          mode
        })
      });
      if (!response.ok) {
        throw new Error("Failed to edit");
      }
      const data = await response.json();
      setResult(data.editedText);
    } catch {
      setResult(previousResult);
    } finally {
      setIsEditing(false);
    }
  }, [result, previousResult, mode]);

  const handleUndoEdit = useCallback(() => {
    if (previousResult) {
      setResult(previousResult);
      setPreviousResult("");
    }
  }, [previousResult]);

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
    setInterviewResult(null);
    setInterviewAnswers([]);
    setUploadedFile(null);
    setNoiseMessage(null);
    setUploadError(null);
    setQuestionsAppeared(false);
  }, []);

  const handleQuoteFromHistory = useCallback((text: string) => {
    setPrompt((prev) => (prev ? `${prev}\n\n${text}` : text));
  }, []);

  const handleSelectMemory = useCallback((formattedText: string) => {
    setPrompt((prev) => (prev ? `${prev}\n\n${formattedText}` : formattedText));
  }, []);

  const handleFileUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userType', 'free'); // Default to free, can be updated later with user plan info

      const response = await fetch('/api/file/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '文件上传失败');
      }

      const processed = await response.json();
      setUploadedFile(processed);
      setPrompt(prev => prev ? `${prev}\n\n${processed.text}` : processed.text);
      setUploading(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '文件上传失败';
      setUploadError(message);
      setUploading(false);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setNoiseMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

      <MemorySearchPanel
        isOpen={showMemoryPanel}
        onClose={() => setShowMemoryPanel(false)}
        onSelectMemory={handleSelectMemory}
        memories={memories}
      />

      <header className="border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-emerald-600 font-display text-xl">
            <Logo size={32} />
            Use <span className="font-extrabold">AI Writer</span>
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
            <div className="flex gap-2 items-center overflow-x-auto w-full sm:w-auto pb-1">
              {modes.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex-shrink-0 ${
                    mode === key
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
              <div className="flex-shrink-0">
                <ModelSwitcher />
              </div>
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

          {viewState === "interview" && interviewResult ? (
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              <div className="text-center py-4">
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-2">
                  🧠 你的数字分身正在帮你理清思路…
                </h3>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Digital Twin Avatar - Desktop left, Mobile center top */}
                <div className="hidden lg:flex flex-col items-center justify-start pt-4 relative">
                  <DigitalTwinAvatar 
                    isVisible={avatarVisible} 
                    state={avatarState} 
                    onSound={handleSound}
                    onQuestionAppear={handleQuestionAppeared}
                    variant={variant}
                  />
                  {showTwinIntro && (
                    <TwinIntroBubble 
                      isVisible={showTwinIntro}
                      onClose={() => {
                        setShowTwinIntro(false);
                        setIntroShown(true);
                      }}
                    />
                  )}
                </div>
                <div className="flex lg:hidden justify-center w-full relative">
                  <DigitalTwinAvatar 
                    isVisible={avatarVisible} 
                    state={avatarState} 
                    onSound={handleSound}
                    onQuestionAppear={handleQuestionAppeared}
                    variant={variant}
                  />
                  {showTwinIntro && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2">
                      <TwinIntroBubble 
                        isVisible={showTwinIntro}
                        onClose={() => {
                          setShowTwinIntro(false);
                          setIntroShown(true);
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-4">
                  {/* Digital Twin Greeting Bubble */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-600 font-bold">🧠</span>
                    </div>
                    <div className="flex-1 bg-white border border-emerald-200 rounded-2xl rounded-tl-none p-4 shadow-sm">
                      <p className="text-slate-900 dark:text-white">{interviewResult.greeting}</p>
                    </div>
                  </div>

                  {/* Interview Questions */}
                  <div className="flex-1 overflow-y-auto space-y-4">
                    {interviewResult.questions.map((question, index) => (
                      <div 
                        key={index} 
                        className="flex flex-col gap-2 opacity-0 transform -translate-x-2.5"
                        style={{
                          animation: `fadeInFromLeft 0.3s ease-out forwards`,
                          animationDelay: `${index * 0.3}s`
                        }}
                      >
                        <style jsx global>{`
                          @keyframes fadeInFromLeft {
                            to {
                              opacity: 1;
                              transform: translateX(0);
                            }
                          }
                        `}</style>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-emerald-600 font-bold">🧠</span>
                          </div>
                          <div className="flex-1 bg-slate-50 dark:bg-gray-800 rounded-2xl rounded-tl-none p-4">
                            <p className="text-slate-900 dark:text-white">{question}</p>
                          </div>
                        </div>
                        <textarea
                          value={interviewAnswers[index]}
                          onChange={(e) => {
                            const newAnswers = [...interviewAnswers];
                            newAnswers[index] = e.target.value;
                            setInterviewAnswers(newAnswers);
                          }}
                          onFocus={() => {
                            setFocusedQuestionIndex(index);
                            setAvatarState('listening');
                          }}
                          onBlur={() => {
                            if (interviewAnswers[index]) {
                              setAvatarState('nodding');
                              setTimeout(() => {
                                if (focusedQuestionIndex === index) {
                                  setAvatarState('thinking');
                                }
                              }, 600);
                            } else {
                              setAvatarState('thinking');
                            }
                          }}
                          placeholder="你的回答..."
                          className="ml-13 w-full rounded-xl border border-emerald-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[80px]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
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
                  继续写作
                </button>
              </div>
            </div>
          ) : (
            <>
              <MemoryRecommendation
                memories={memories}
                onSelectMemory={handleSelectMemory}
              />
              
              {!prompt && !result && (
                <div className="mb-4">
                  <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-3">
                    💡 写作示例
                  </h3>
                  <WritingExamples onSelectExample={setPrompt} />
                </div>
              )}
              
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Describe what you want to write in ${mode} mode...`}
                className="flex-1 min-h-[200px] w-full rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />

              <PromptSuggestion
                prompt={prompt}
                mode={mode}
                isInterviewMode={viewState === "interview"}
                onSelectSuggestion={setPrompt}
              />

              {/* Noise Input Message */}
              {noiseMessage && (
                <div className="rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 text-sm text-blue-700 dark:text-blue-300">
                  💡 {noiseMessage}
                </div>
              )}

              {/* File Upload */}
              <div>
                {uploadedFile ? (
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-gray-800 p-3 rounded-xl border border-slate-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">文件已上传 ({uploadedFile.type}, ~{uploadedFile.tokenCount} tokens)</span>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <Trash className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                ) : uploadError ? (
                  <div className="flex items-center justify-between bg-red-50 dark:bg-red-950 p-3 rounded-xl border border-red-200 dark:border-red-800">
                    <span className="text-sm text-red-700 dark:text-red-300">{uploadError}</span>
                    <Link href="/pricing" className="text-sm text-emerald-600 hover:underline font-medium">
                      升级
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleFileUploadClick}
                    disabled={uploading}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors min-h-[44px]"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    📎 上传文件（Pro/Max）
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".txt,.md"
                  onChange={handleFileSelect}
                />
              </div>

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

              <div className="flex gap-2">
                <button
                  onClick={() => setShowMemoryPanel(true)}
                  disabled={memories.length === 0}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                    memories.length === 0
                      ? 'bg-slate-100 dark:bg-gray-800 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  }`}
                  title={memories.length === 0 ? "去写作页面和分身聊天，它会记住你的想法" : "搜索并引用历史想法"}
                >
                  <span>💾</span>
                  <span>我的想法</span>
                  {memories.length > 0 && (
                    <span className="text-xs opacity-70">({memories.length})</span>
                  )}
                </button>
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors min-h-[44px]"
                >
                  <MessageSquare className="w-4 h-4" />
                  Quote from History
                </button>
              </div>

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

              <div className="flex gap-3 flex-col">
                <button
                  onClick={handleGenerateClick}
                  disabled={state === "loading" || !prompt.trim() || !canGenerate}
                  className="btn-primary flex-1 gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  aria-label="Generate content"
                >
                  {state === "loading" || viewState === "generating" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Generate
                    </>
                  )}
                </button>
                {(state === "loading" || viewState === "generating") && (
                  <div className="h-1 bg-slate-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-emerald-600 animate-pulse" style={{
                      animation: 'progress 1.5s ease-in-out infinite'
                    }} />
                    <style jsx>{`
                      @keyframes progress {
                        0% { transform: translateX(-100%); }
                        50% { transform: translateX(150%); }
                        100% { transform: translateX(-100%); }
                      }
                    `}</style>
                  </div>
                )}
                <button onClick={handleClear} className="btn-outline min-w-[44px] w-full" aria-label="Clear all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </section>

        <section className="p-6 flex flex-col gap-4 bg-slate-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
              {state === "done" ? "Generated" : state === "loading" || viewState === "generating" ? "Generating..." : "Your Result"}
            </h2>
            {result && (
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="btn-outline text-sm gap-1 sm:gap-2 min-h-[44px]"
                    aria-label="Copy result"
                  >
                    {copyState === "copied" ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" /> <span className="hidden sm:inline">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> <span className="hidden sm:inline">Copy</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="btn-outline text-sm gap-1 sm:gap-2 min-h-[44px]"
                    aria-label="Download result"
                  >
                    <Download className="w-4 h-4" /> <span className="hidden sm:inline">Download</span>
                  </button>
                  {previousResult && (
                    <button
                      type="button"
                      onClick={handleUndoEdit}
                      className="btn-outline text-sm gap-1 sm:gap-2 min-h-[44px]"
                    >
                      <Undo2 className="w-4 h-4" /> <span className="hidden sm:inline">Undo</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (!isProUser) {
                        setShowUpgradeModal(true);
                      } else {
                        const otherModel = currentResultModel === "deepseek" ? "claude" : "deepseek";
                        handleGenerate(undefined, undefined, otherModel, true);
                      }
                    }}
                    className="flex items-center gap-1 px-2 sm:px-3 py-2 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 rounded-xl text-sm font-medium transition-colors min-h-[44px]"
                  >
                    🔄 <span className="hidden sm:inline">用{currentResultModel === "deepseek" ? "Claude" : "DeepSeek"}再生成</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {getEditSuggestions(result, profile).map((suggestion) => {
                    const IconComponent = (() => {
                      switch(suggestion.iconName) {
                        case "Scissors": return Scissors;
                        case "Plus": return Plus;
                        case "Briefcase": return Briefcase;
                        case "MessageCircle": return MessageCircle;
                        case "CheckCircle2": return CheckCircle2;
                        case "Lightbulb": return Lightbulb;
                        case "Sparkles": return Sparkles;
                        default: return Sparkles;
                      }
                    })();
                    return (
                      <button
                        type="button"
                        key={suggestion.id}
                        onClick={() => handleEdit(suggestion)}
                        disabled={isEditing}
                        className="flex items-center gap-1 px-2 sm:px-3 py-2 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 rounded-xl text-sm font-medium transition-colors min-h-[44px]"
                      >
                        <IconComponent className="w-4 h-4" />
                        {suggestion.label}
                      </button>
                    );
                  })}
                </div>
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
            <ErrorState 
              title="生成失败"
              message={error || "发生了未知错误"}
              onRetry={() => handleGenerate()}
            />
          )}
          {(state === "idle" && viewState !== "interview" && !result) && (
            <EmptyState
              icon={PenLine}
              title="还没有生成内容"
              description="你的AI生成内容将在这里展示"
              actionLabel="开始写作"
              actionHref="/write"
            />
          )}
          {(result || state === "loading" || viewState === "generating") && (
            comparisonResult ? (
              <div className="flex-1 grid lg:grid-cols-2 gap-6">
                {/* Original Result */}
                <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 overflow-y-auto prose dark:prose-invert max-w-none">
                  <div className="mb-4 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    {currentResultModel === "deepseek" ? "DeepSeek" : "Claude"}
                  </div>
                  <div className="whitespace-pre-wrap">{result}</div>
                </div>
                {/* Comparison Result */}
                <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 overflow-y-auto prose dark:prose-invert max-w-none">
                  <div className="mb-4 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    {currentResultModel === "deepseek" ? "Claude" : "DeepSeek"}
                  </div>
                  <div className="whitespace-pre-wrap">{comparisonResult}</div>
                </div>
              </div>
            ) : (
              <div
                ref={resultRef}
                className="flex-1 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 overflow-y-auto prose dark:prose-invert max-w-none"
              >
                {result ? (
                  <div className="whitespace-pre-wrap">{result}</div>
                ) : (
                  <Skeleton variant="paragraph" />
                )}
              </div>
            )
          )}
        </section>
      </div>
      
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-950 rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-200 dark:border-gray-800 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white mb-2">
                Upgrade to Pro
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Claude provides higher quality writing! Upgrade to Pro to use it.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/pricing" className="btn-primary text-center min-h-[44px] flex items-center justify-center">
                🚀 Upgrade to Pro
              </Link>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="btn-outline text-center min-h-[44px] flex items-center justify-center"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
