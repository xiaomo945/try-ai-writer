"use client";

import { useState, useRef } from "react";
import { Zap, Copy, Download, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

type WritingMode = "blog" | "email" | "social" | "custom";
type GenerateState = "idle" | "loading" | "done" | "error";

export default function WriteEditor() {
  const [mode, setMode] = useState<WritingMode>("blog");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [state, setState] = useState<GenerateState>("idle");
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const modes: { key: WritingMode; label: string }[] = [
    { key: "blog", label: "Blog Post" },
    { key: "email", label: "Email" },
    { key: "social", label: "Social Media" },
    { key: "custom", label: "Custom" },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setState("loading");
    setError(null);
    setResult("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mode }),
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setState("error");
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
    }
  };

  const handleDownload = () => {
    if (result) {
      const blob = new Blob([result], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `use-ai-writer-${mode}-${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleClear = () => {
    setPrompt("");
    setResult("");
    setState("idle");
    setError(null);
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-emerald-600 font-display text-xl font-extrabold">
            Use AI Writer
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors">
              Dashboard
            </Link>
            <div className="w-8 h-8 rounded-full bg-emerald-200 dark:bg-emerald-800" />
          </div>
        </div>
      </header>

      {/* Editor Layout */}
      <div className="flex-1 grid lg:grid-cols-[40%_60%]">
        {/* Left: Input */}
        <section className="p-6 flex flex-col gap-4 border-r border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          {/* Mode Selector */}
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

          {/* Prompt Input */}
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Describe what you want to write in ${mode} mode...`}
            className="flex-1 min-h-[300px] w-full rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={state === "loading" || !prompt.trim()}
              className="btn-primary flex-1 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <button onClick={handleClear} className="btn-outline min-w-[44px]">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Right: Result */}
        <section className="p-6 flex flex-col gap-4 bg-slate-50 dark:bg-gray-900">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
              {state === "done" ? "✅ Generated" : state === "loading" ? "⏳ Generating..." : "Your Result"}
            </h2>
            {result && (
              <div className="flex gap-2">
                <button onClick={handleCopy} className="btn-outline text-sm gap-2 min-h-[44px]" aria-label="Copy result">
                  <Copy className="w-4 h-4" /> Copy
                </button>
                <button onClick={handleDownload} className="btn-outline text-sm gap-2 min-h-[44px]" aria-label="Download result">
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>
            )}
          </div>

          {/* Result Area */}
          {state === "error" && (
            <div className="flex-1 rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6">
              <p className="text-red-600 dark:text-red-400 font-semibold">Error</p>
              <p className="text-red-500 dark:text-red-300 text-sm mt-2">{error}</p>
              <button onClick={handleGenerate} className="btn-primary mt-4 text-sm">
                Retry
              </button>
            </div>
          )}
          {(state === "idle" || (state === "done" && !result)) && (
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
