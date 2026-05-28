"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Zap, Copy, Download, Trash2, Loader2, Check, Info, X, Search, Sparkles, MessageSquare, Wand2, Lightbulb, Upload, Trash, Scissors, Plus, Briefcase, MessageCircle, CheckCircle2, Undo2, PenLine, ChevronDown, ChevronUp } from "lucide-react";
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
import { AIProgressIndicator } from "@/app/components/AIProgressIndicator";
import { WriteTourGuide } from "@/app/components/WriteTourGuide";
import { Skeleton } from "@/app/components/Skeleton";
import { EmptyState } from "@/app/components/EmptyState";
import { ErrorState } from "@/app/components/ErrorState";
import { getEditSuggestions, type EditSuggestion } from "@/lib/edit-suggestions";
import { ModelSwitcher } from '@/app/components/ModelSwitcher';
import { MemorySearchPanel } from '@/app/components/MemorySearchPanel';
import { MemoryRecommendation } from '@/app/components/MemoryRecommendation';
import { PromptSuggestion } from '@/app/components/PromptSuggestion';
import { WritingExamples } from '@/app/components/WritingExamples';
import { QuickTemplates } from '@/app/components/QuickTemplates';
import { OnboardingTooltip } from '@/app/components/OnboardingTooltip';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { useAvatarVariant } from '@/lib/avatar-variant';
import Logo from '@/app/components/Logo';
import ErrorBoundary from '@/app/components/ErrorBoundary';

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
    emerald: { stroke: "#059669", bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-600 dark:text-emerald-300", ring: "text-emerald-500" },
    amber: { stroke: "#f59e0b", bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-600 dark:text-amber-300", ring: "text-amber-500" },
    red: { stroke: "#ef4444", bg: "bg-red-50 dark:bg-red-950", text: "text-red-600 dark:text-red-300", ring: "text-red-500" },
  };

  const colors = colorMap[scoreColor];

  return (
    <div className={`rounded-xl ${colors.bg} p-4 border border-white/10`}>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/10" />
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
          <div className="text-sm font-semibold text-white mb-2">Style Match</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Tone</span>
              <span className="font-medium">{score.breakdown.tone}%</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Vocabulary</span>
              <span className="font-medium">{score.breakdown.vocabulary}%</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Structure</span>
              <span className="font-medium">{score.breakdown.structure}%</span>
            </div>
          </div>
        </div>
      </div>
      {score.suggestions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-xs text-slate-400 mb-1">Suggestions:</div>
          <ul className="text-xs text-slate-300 space-y-1">
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
    <div className="rounded-xl bg-amber-950/30 border border-amber-500/30 p-4">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold text-amber-300 text-sm mb-2">
            This text slightly deviates from your style
          </div>
          <ul className="space-y-1 mb-3">
            {warnings.map((w, i) => (
              <li key={i} className="text-sm text-amber-200 flex items-start gap-2">
                <span className="text-amber-500">•</span>
                {w.message}
              </li>
            ))}
          </ul>
          <button
            onClick={onOptimize}
            className="flex items-center gap-2 px-4 py-2 bg-amber-950 hover:bg-amber-900 text-amber-200 rounded-lg text-sm font-medium transition-colors"
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
      <div className="relative bg-[#0A0A0C] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-bold text-white">Quote from History</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your history..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
              autoFocus
            />
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {results.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
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
                  className="w-full text-left p-4 rounded-xl border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-950/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white mb-1 truncate" dangerouslySetInnerHTML={{ __html: result.title }} />
                      <p className="text-sm text-slate-400 line-clamp-2" dangerouslySetInnerHTML={{ __html: result.snippet }} />
                      <div className="text-xs text-slate-500 mt-2">
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
  const [avatarState, setAvatarState] = useState<'idle' | 'thinking' | 'approving' | 'expecting' | 'listening' | 'nodding' | 'questionAppearing' | 'waiting' | 'error' | 'sorry'>('idle');
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
  const [upgradeModalReason, setUpgradeModalReason] = useState<'file-upload' | 'model-switch' | 'general'>('general');
  const [currentResultModel, setCurrentResultModel] = useState<"claude" | "deepseek">("deepseek");
  const [modelSwitchToast, setModelSwitchToast] = useState<string | null>(null);

  // Load Creative Assistant setting from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("creative-assistant-enabled");
    if (stored === null) {
      localStorage.setItem("creative-assistant-enabled", "true");
    } else {
      setCreativeAssistantEnabled(stored === "true");
    }
  }, []);

  // Avatar typing feedback
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (prompt.trim().length > 0) {
      setAvatarState('listening');
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setAvatarState('thinking');
      }, 2000);
    }
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [prompt]);
  
  // Keyboard shortcuts
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Check if user is on mobile
  const [isMobile, setIsMobile] = useState(false);

  const handleCreativeAssistantToggle = (enabled: boolean) => {
    setCreativeAssistantEnabled(enabled);
    localStorage.setItem("creative-assistant-enabled", enabled ? "true" : "false");
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    setAvatarState('thinking');

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

      if (!response.body) {
        throw new Error("生成失败，请稍后重试");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      try {
        while (true) {
          const { value, done: streamDone } = await reader.read();
          if (streamDone) break;
          if (value) {
            accumulated += decoder.decode(value, { stream: true });
            if (isComparison) {
              setComparisonResult(accumulated);
            } else {
              setResult(accumulated);
            }
          }
        }
      } finally {
        try {
          reader.releaseLock();
        } catch {
          // ignore release errors
        }
      }
      setState("done");
      setViewState("result");
      setAvatarState('approving');
      setTimeout(() => setAvatarState('idle'), 2000);

      setCurrentResultModel((useModel || selectedModel) as "deepseek" | "claude");

      if (!isComparison) {
        addRecord({
          title: prompt.length > 50 ? `${prompt.slice(0, 50)}...` : prompt,
          mode,
          result: accumulated,
        });

        addMemory(prompt, 'idea');
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
      setAvatarState('sorry');
      setTimeout(() => setAvatarState('idle'), 3000);
    }
  }, [prompt, mode, canGenerate, increment, addRecord, addMemory, interviewAnswers, calculateStyleScore, selectedModel]);

  const handleGenerateClick = useCallback(() => {
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
    console.log(`Sound effect triggered: ${type}`);
  }, []);

  const handleEdit = useCallback(async (editPrompt: string) => {
    if (!result) return;
    setPreviousResult(result);
    setIsEditing(true);
    try {
      const response = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText: result,
          editInstruction: editPrompt,
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
      setAvatarState('approving');
      setTimeout(() => setAvatarState('idle'), 2000);
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
      formData.append('userType', 'free');

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

  // Keyboard shortcuts effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;
      
      // Ctrl/Cmd + Enter: Generate
      if (cmdKey && e.key === 'Enter') {
        e.preventDefault();
        handleGenerateClick();
      }
      
      // Ctrl/Cmd + K: Focus prompt
      if (cmdKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        promptRef.current?.focus();
      }
      
      // Ctrl/Cmd + Shift + C: Copy result
      if (cmdKey && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopy();
      }
      
      // Ctrl/Cmd + Shift + D: Download result
      if (cmdKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDownload();
      }
      
      // Escape: Clear content if result exists, else close modals
      if (e.key === 'Escape') {
        if (result) {
          handleClear();
        } else {
          setShowUpgradeModal(false);
          setShowHistoryModal(false);
          setShowMemoryPanel(false);
          setShowTwinIntro(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [result, handleGenerateClick, handleCopy, handleDownload, handleClear]);

  return (
    <ErrorBoundary>
      <main className="min-h-screen flex flex-col bg-[#0A0A0C]">
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

      <header className="border-b border-white/10 bg-[#0A0A0C]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-emerald-600 font-display text-xl">
            <Logo size={32} />
            Use <span className="font-extrabold">AI Writer</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              {used}/{limit} today
            </span>
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-emerald-600 transition-colors">
              Dashboard
            </Link>
            <ThemeToggle />
            <div className="w-8 h-8 rounded-full bg-emerald-800" />
          </div>
        </div>
      </header>

      <div className="flex-1 grid lg:grid-cols-[55%_45%] sm:flex-col">
        {/* Left Input Section */}
        <section className="p-4 sm:p-6 flex flex-col gap-4 border-r border-white/10 bg-[#0A0A0C]">
          {/* Row 1: Mode Selector */}
          <div className="flex items-center justify-between gap-2">
            <div data-onboarding="mode-selector" className="flex gap-2 items-center overflow-x-auto pb-1 flex-1">
              {modes.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex-shrink-0 ${
                    mode === key
                      ? "bg-emerald-600 text-white"
                      : "bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Creative Assistant Toggle + AI Progress */}
          <div className="flex items-center justify-between gap-4">
            <div data-onboarding="creative-assistant" className="flex items-center gap-2">
              <span className="text-sm text-slate-400">
                🧠 Creative Assistant
              </span>
              <button
                onClick={() => handleCreativeAssistantToggle(!creativeAssistantEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  creativeAssistantEnabled ? "bg-emerald-600" : "bg-white/20"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    creativeAssistantEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <AIProgressIndicator />
            </div>
          </div>

          {viewState === "interview" && interviewResult ? (
            <div className="flex-1 flex flex-col gap-4">
              <div className="text-center py-4">
                <h3 className="text-lg font-display font-bold text-white mb-2">
                  🧠 你的数字分身正在帮你理清思路…
                </h3>
              </div>

              <div className="flex flex-col gap-6 items-start">
                <div className="flex justify-center w-full">
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

                <div className="flex-1 flex flex-col gap-3 sm:gap-4 w-full">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-950/50 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-600 font-bold text-sm sm:text-base">🧠</span>
                    </div>
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4">
                      <p className="text-white text-sm sm:text-base">{interviewResult.greeting}</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 sm:space-y-4">
                    {interviewResult.questions.map((question, index) => {
                      const [displayedText, setDisplayedText] = useState('');
                      const [isTyping, setIsTyping] = useState(false);
                      const [showTypingBubble, setShowTypingBubble] = useState(false);
                      const textRef = useRef('');
                      
                      useEffect(() => {
                        if (!questionsAppeared) return;
                        if (index > 0 && !interviewAnswers[index - 1]) return;
                        
                        setShowTypingBubble(true);
                        setIsTyping(true);
                        setDisplayedText('');
                        textRef.current = '';
                        
                        const typeInterval = setInterval(() => {
                          if (textRef.current.length < question.length) {
                            textRef.current += question[textRef.current.length];
                            setDisplayedText(textRef.current);
                          } else {
                            clearInterval(typeInterval);
                            setIsTyping(false);
                            setShowTypingBubble(false);
                          }
                        }, 30);
                        
                        return () => clearInterval(typeInterval);
                      }, [questionsAppeared, question, index]);
                      
                      useEffect(() => {
                        if (index > 0 && interviewAnswers[index - 1]?.trim()) {
                          setAvatarState('nodding');
                          setTimeout(() => {
                            setAvatarState('questionAppearing');
                          }, 600);
                        }
                      }, [interviewAnswers]);
                      
                      return (
                        <div 
                          key={index} 
                          className="flex flex-col gap-2"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-950/50 flex items-center justify-center flex-shrink-0 relative">
                              <span className="text-emerald-600 font-bold text-sm sm:text-base">🧠</span>
                              {showTypingBubble && (
                                <span className="absolute -top-1 -right-1 flex gap-0.5">
                                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                                </span>
                              )}
                            </div>
                            <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-none p-4">
                              <p className="text-white text-sm sm:text-base">
                                {displayedText}
                                {isTyping && <span className="animate-pulse">|</span>}
                              </p>
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
                            className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 min-h-[80px]"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSkipInterview}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm font-medium transition-colors min-h-[44px]"
                >
                  Skip for now
                </button>
                <button
                  onClick={handleContinueWriting}
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors min-h-[44px]"
                >
                  继续写作
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 flex-1">
              <MemoryRecommendation
                memories={memories}
                onSelectMemory={handleSelectMemory}
              />
              
              <textarea
                ref={promptRef}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                }}
                placeholder={`Describe what you want to write in ${mode} mode...`}
                className="flex-1 min-h-[300px] w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white placeholder-slate-500 resize-vertical focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
              />

              <PromptSuggestion
                prompt={prompt}
                mode={mode}
                isInterviewMode={viewState === "interview"}
                onSelectSuggestion={setPrompt}
              />

              {/* Noise Input Message */}
              {noiseMessage && (
                <div className="rounded-xl bg-blue-950/20 border border-blue-500/30 p-4 text-sm text-blue-200">
                  💡 {noiseMessage}
                </div>
              )}

              {/* File Upload */}
              <div>
                {uploadedFile ? (
                  <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-slate-300">文件已上传 ({uploadedFile.type}, ~{uploadedFile.tokenCount} tokens)</span>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <Trash className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                ) : uploadError ? (
                  <div className="flex items-center justify-between bg-red-950/20 border border-red-500/30 p-3 rounded-xl">
                    <span className="text-sm text-red-200">{uploadError}</span>
                    <Link href="/pricing" className="text-sm text-emerald-500 hover:underline font-medium">
                      升级
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleFileUploadClick}
                    disabled={uploading}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm font-medium transition-colors min-h-[44px]"
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
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-slate-300">
                      Describe what you want to write, or choose a template below
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {examplePrompts.map((example) => (
                      <button
                        key={example.text}
                        onClick={() => setPrompt(example.text)}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 hover:border-emerald-500/30 hover:bg-emerald-950/20 transition-colors"
                      >
                        <span>{example.icon}</span>
                        <span className="truncate max-w-[200px]">{example.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Examples & Templates (visible when prompt/result is empty) */}
              {!prompt && !result && (
                <div className="space-y-4">
                  <h3 className="text-lg font-display font-bold text-white">
                    💡 写作示例
                  </h3>
                  <WritingExamples onSelectExample={setPrompt} />
                  <QuickTemplates onSelectTemplate={(template) => {
                    setPrompt(template);
                    setTimeout(() => promptRef.current?.focus(), 100);
                  }} />
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setShowMemoryPanel(true)}
                  disabled={memories.length === 0}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                    memories.length === 0
                      ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-950/30 hover:bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
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
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm font-medium transition-colors min-h-[44px]"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Quote from History</span>
                  <span className="sm:hidden">History</span>
                </button>
                <button
                  onClick={() => {
                    if (!isProUser) {
                      setUpgradeModalReason('file-upload');
                      setShowUpgradeModal(true);
                    } else {
                      handleFileUploadClick();
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm font-medium transition-colors min-h-[44px]"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">📎 上传文件</span>
                  <span className="sm:hidden">📎</span>
                </button>
              </div>

              {!canGenerate && state !== "loading" && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-200">
                        Daily limit reached
                      </p>
                      <p className="text-sm text-amber-100 mt-1">
                        You have used all {limit} free generations today. Upgrade to Pro for unlimited access.
                      </p>
                    </div>
                  </div>
                  <Link href="/pricing" className="btn-primary text-sm w-full text-center">
                    Upgrade to Pro
                  </Link>
                </div>
              )}

              {/* Bottom Row: Model Switcher + Generate Button */}
              <div className="flex gap-3 items-center">
                <div className="flex-shrink-0">
                  <ModelSwitcher onModelSwitch={(model) => {
                    const modelName = model === 'claude' ? 'Claude' : 'DeepSeek';
                    setModelSwitchToast(`Switched to ${modelName}`);
                    setTimeout(() => setModelSwitchToast(null), 2000);
                  }} />
                </div>
                <button
                  data-onboarding="generate-button"
                  onClick={handleGenerateClick}
                  disabled={state === "loading" || !prompt.trim() || !canGenerate}
                  className="btn-primary flex-1 gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-h-[48px]"
                  aria-label="Generate content"
                >
                  {state === "loading" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate
                    </>
                  )}
                </button>
                {result && (
                  <button
                    onClick={handleClear}
                    className="btn-outline min-h-[48px] px-4 py-2"
                    aria-label="Clear"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Right Result Section */}
        <section className="p-4 sm:p-6 flex flex-col bg-[#0A0A0C]">
          {!result && state === "idle" ? (
            <div className="flex flex-col items-center justify-center h-full gap-8">
              <div className="text-center">
                <div className="text-6xl mb-4">✨</div>
                <h3 className="text-xl font-display font-bold text-white mb-2">
                  Your AI Writing Assistant is Ready!
                </h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  Describe what you want to write on the left, and we'll generate high-quality content in your brand voice.
                </p>
              </div>
              <div className="w-full max-w-2xl">
                <div className="glass-card p-6">
                  <h4 className="font-semibold text-white mb-4">💡 Quick Tips</h4>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500">✓</span>
                      Be specific about the tone, audience, and key points
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500">✓</span>
                      Try the Creative Assistant for more structured outputs
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500">✓</span>
                      Upload existing content to train your brand voice
                    </li>
                  </ul>
                </div>
              </div>
              <div className="w-full max-w-2xl">
                <h3 className="text-lg font-display font-bold text-white mb-4">
                  📝 Try These Examples
                </h3>
                <WritingExamples onSelectExample={setPrompt} />
              </div>
            </div>
          ) : (
            <>
              {/* Result Top Toolbar */}
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {styleScore && <StyleScoreCard score={styleScore} />}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="btn-outline min-h-[44px] px-4 py-2 flex items-center gap-2"
                    aria-label="Copy"
                  >
                    {copyState === "copied" ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="btn-outline min-h-[44px] px-4 py-2 flex items-center gap-2"
                    aria-label="Download"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </button>
                </div>
              </div>

              {consistencyWarnings.length > 0 && (
                <div className="mb-4">
                  <ConsistencyWarningBox warnings={consistencyWarnings} onOptimize={handleOptimize} />
                </div>
              )}

              {/* Result Content Area */}
              <div ref={resultRef} className="flex-1 overflow-y-auto">
                {state === "loading" ? (
                  <div className="space-y-4">
                    <Skeleton variant="title" className="h-6 w-3/4" />
                    <Skeleton variant="text" className="h-4 w-full" />
                    <Skeleton variant="text" className="h-4 w-full" />
                    <Skeleton variant="text" className="h-4 w-5/6" />
                    <Skeleton variant="title" className="h-6 w-2/3" />
                    <Skeleton variant="text" className="h-4 w-full" />
                    <Skeleton variant="text" className="h-4 w-full" />
                    <Skeleton variant="text" className="h-4 w-4/5" />
                  </div>
                ) : state === "error" ? (
                  <ErrorState title="生成失败" message={error || "Something went wrong"} />
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-slate-200 leading-relaxed">
                      {result}
                    </div>
                  </div>
                )}
              </div>

              {/* Edit Suggestions (bottom) */}
              {state === "done" && !isEditing && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">✨ Edit Suggestions</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleEdit("Make this more engaging and dynamic")}
                      className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-slate-300 transition-colors"
                    >
                      Make more engaging
                    </button>
                    <button
                      onClick={() => handleEdit("Simplify this and make it easier to understand")}
                      className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-slate-300 transition-colors"
                    >
                      Simplify
                    </button>
                    <button
                      onClick={() => handleEdit("Make this more professional and business-like")}
                      className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-slate-300 transition-colors"
                    >
                      Make professional
                    </button>
                    <button
                      onClick={() => handleEdit("Add more details and expand on the key points")}
                      className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-slate-300 transition-colors"
                    >
                      Expand
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  </ErrorBoundary>
  );
}
