"use client";

import { useState } from "react";
import { Zap, Copy, Loader2 } from "lucide-react";
import Link from "next/link";

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

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setState("loading");
    setOutput("");
    
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

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-emerald-400">
              ✨ Write
            </Link>
            <Link href="/" className="text-sm text-slate-400 hover:text-white">
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Input */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold mb-2">What do you want to write?</h1>
            <p className="text-slate-400 mb-6">
              Choose a format and describe what you need.
            </p>

            {/* Mode Selector */}
            <div className="grid grid-cols-4 gap-2 mb-6">
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

            {/* Input Area */}
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`Describe your ${mode}...`}
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
          </div>

          {/* Right Side - Output */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Output</h2>
              {state === "done" && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
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
      </main>
    </div>
  );
}
