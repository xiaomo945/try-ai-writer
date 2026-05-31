"use client";

import { useState, useEffect, useMemo } from "react";
import { Zap, Copy, Loader2, Save, Brain, Sparkles, BarChart3, CheckCircle2, XCircle } from "lucide-react";
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

export default function WritePage() {
  const [mode, setMode] = useState<WritingMode>("blog");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [state, setState] = useState<GenerateState>("idle");
  const [savedToHistory, setSavedToHistory] = useState(false);
  const [savedToMemory, setSavedToMemory] = useState(false);
  const [showRelatedIdeas, setShowRelatedIdeas] = useState(true);

  const { addRecord } = useHistory();
  const { memories, addMemory } = useMemoryBank();
  const { profile } = useBrandVoice();

  // Find related ideas based on current prompt
  const relatedIdeas = useMemo(() => {
    if (!prompt.trim() || memories.length === 0) return [];
    return findRelatedIdeas(prompt, memories, 3);
  }, [prompt, memories]);

  // Calculate style match score if we have a profile and output
  const styleMatch = useMemo(() => {
    if (!output || !profile?.styleFingerprint) return null;
    
    const matcherProfile: MatcherProfile = {
      tone: {
        formality: 0.5,
        sentiment: "neutral",
        pace: "moderate"
      },
      commonPhrases: profile.commonPhrases || [],
      avgSentenceLength: profile.styleFingerprint.avgSentenceLength,
      avgParagraphLength: profile.styleFingerprint.avgParagraphSentenceCount,
      industryTerms: []
    };
    
    return scoreStyleMatch(output, matcherProfile);
  }, [output, profile]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setState("loading");
    setOutput("");
    setSavedToHistory(false);
    setSavedToMemory(false);
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          mode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

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
    } catch (error) {
      console.error("Generation failed:", error);
      setState("error");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  const handleSaveToHistory = () => {
    if (!output) return;
    addRecord({
      title: prompt.slice(0, 50) + (prompt.length > 50 ? "..." : ""),
      mode,
      result: output
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
      custom: "Custom"
    };
    return labels[m];
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-emerald-400">
              ✨ Write
            </Link>
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white flex items-center gap-2">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Input */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">What do you want to write?</h1>
              <p className="text-slate-400">
                Choose a format and describe what you need. Your digital twin will help you!
              </p>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-4 gap-2">
              {(["blog", "email", "social", "custom"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium capitalize transition-all ${
                    mode === m
                      ? "bg-emerald-600 text-white"
                      : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Related Ideas Panel */}
            {relatedIdeas.length > 0 && showRelatedIdeas && (
              <div className="bg-white/5 border border-emerald-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-semibold text-emerald-300">Related Ideas from Your Memory</h3>
                  </div>
                  <button 
                    onClick={() => setShowRelatedIdeas(false)}
                    className="text-slate-500 hover:text-slate-400"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {relatedIdeas.map((idea, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400 text-xs">Relevance: {Math.round(idea.relevanceScore)}%</span>
                      </div>
                      <p className="text-slate-300 line-clamp-2">{idea.memory.content}</p>
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

            {/* Input Area */}
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`Describe your ${getModeLabel(mode).toLowerCase()}...`}
                  className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Example Prompts */}
              <div className="space-y-2">
                <p className="text-sm text-slate-500">Try these:</p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example.text)}
                      className="text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300 transition-all"
                    >
                      {example.icon} {example.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={state === "loading" || !prompt.trim()}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all"
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
            </div>

            {/* Output Area */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Output</h2>
                {state === "done" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                    <button
                      onClick={handleSaveToHistory}
                      disabled={savedToHistory}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm transition-all"
                    >
                      {savedToHistory ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                      {savedToHistory ? "Saved!" : "History"}
                    </button>
                    <button
                      onClick={handleSaveToMemory}
                      disabled={savedToMemory}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-lg text-sm transition-all"
                    >
                      {savedToMemory ? <CheckCircle2 className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                      {savedToMemory ? "Memorized!" : "Memory"}
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 min-h-[400px]">
                {state === "idle" && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                    <Zap className="w-12 h-12 mb-4 opacity-20" />
                    <p>Your generated content will appear here</p>
                  </div>
                )}
                
                {state === "loading" && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p>Generating...</p>
                  </div>
                )}
                
                {state === "error" && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-red-400">
                    <p>Something went wrong. Try again.</p>
                  </div>
                )}
                
                {state === "done" && (
                  <div className="whitespace-pre-wrap text-slate-200">
                    {output}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Style & Learning */}
          <div className="space-y-6">
            {/* Style Match Score */}
            {styleMatch && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
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
                  <p className="text-slate-400 text-sm">
                    Match with your writing style
                  </p>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Tone</span>
                      <span>{styleMatch.breakdown.tone}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${styleMatch.breakdown.tone}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Vocabulary</span>
                      <span>{styleMatch.breakdown.vocabulary}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${styleMatch.breakdown.vocabulary}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Structure</span>
                      <span>{styleMatch.breakdown.structure}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${styleMatch.breakdown.structure}%` }}
                      />
                    </div>
                  </div>
                </div>

                {styleMatch.suggestions.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Suggestions</h4>
                    <ul className="space-y-2">
                      {styleMatch.suggestions.slice(0, 3).map((suggestion, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                          <Sparkles className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Brand Voice Status */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <h3 className="font-semibold">Digital Twin Status</h3>
              </div>
              
              {profile ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Training Data</span>
                    <span className="text-emerald-400 font-medium">
                      {profile.learningSamples || 0} samples
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Style Fingerprint</span>
                    <span className={profile.styleFingerprint ? "text-emerald-400" : "text-yellow-400"}>
                      {profile.styleFingerprint ? "Ready" : "Needs more samples"}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((profile.learningSamples || 0) / 20) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Write more to train your digital twin!
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-slate-400 text-sm mb-3">
                    Set up your digital twin to personalize your writing
                  </p>
                  <Link 
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Memory Bank Stats */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-blue-400" />
                <h3 className="font-semibold">Memory Bank</h3>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">{memories.length}</div>
                <p className="text-slate-400 text-sm">memories stored</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
