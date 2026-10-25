"use client";

import { useState } from "react";
import { analyzeOriginality, type OriginalityReport } from "@/lib/content-analyzer";

export function OriginalityCheckerTool() {
  const [text, setText] = useState("");
  const [report, setReport] = useState<OriginalityReport | null>(null);

  const run = () => setReport(analyzeOriginality(text));

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-5">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        Paste your text to check for repetition
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste an article, essay, or product description…"
        className="w-full h-52 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 text-sm text-slate-900 dark:text-white resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <div className="mt-3 flex items-center gap-3">
        <button onClick={run} className="btn-primary text-sm min-h-[44px] px-6">
          Check originality
        </button>
      </div>

      {report && (
        <div className="mt-6 space-y-5">
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{
                background: `conic-gradient(${
                  report.score >= 70 ? "#10b981" : report.score >= 40 ? "#f59e0b" : "#ef4444"
                } ${(report.score / 100) * 360}deg, #e2e8f0 0deg)`,
              }}
            >
              <span className="w-16 h-16 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-white">
                {report.score}
              </span>
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                Originality score
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Self-similarity: {report.selfSimilarity}%
              </div>
            </div>
          </div>

          {report.duplicateSentences.length > 0 && (
            <div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Repeated sentences ({report.duplicateSentences.length})
              </div>
              <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400 list-disc list-inside">
                {report.duplicateSentences.map((d, i) => (
                  <li key={i}>
                    “{d.text}” ×{d.count}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.repeatedPhrases.length > 0 && (
            <div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Over-used phrases
              </div>
              <div className="flex flex-wrap gap-2">
                {report.repeatedPhrases.map((p, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                  >
                    {p.phrase} ×{p.count}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Findings
            </div>
            <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400 list-disc list-inside">
              {report.findings.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
