"use client";

import { useState } from "react";
import { analyzeSeo, type SeoReport } from "@/lib/content-analyzer";

export function SeoAnalyzerTool() {
  const [text, setText] = useState("");
  const [report, setReport] = useState<SeoReport | null>(null);

  const run = () => setReport(analyzeSeo(text));

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-5">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        Paste your draft (Markdown supported)
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste a blog post or article draft here…"
        className="w-full h-52 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 text-sm text-slate-900 dark:text-white resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={run}
          className="btn-primary text-sm min-h-[44px] px-6"
        >
          Check my SEO score
        </button>
        {report && (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {report.wordCount} words analyzed
          </span>
        )}
      </div>

      {report && (
        <div className="mt-6 space-y-5">
          {/* Score */}
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{
                background: `conic-gradient(#10b981 ${(report.score / 100) * 360}deg, #e2e8f0 0deg)`,
              }}
            >
              <span className="w-16 h-16 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-white">
                {report.score}
              </span>
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                SEO score
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Readability: {report.readability.label} ({report.readability.score})
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Words" value={report.wordCount} />
            <Stat label="Paragraphs" value={report.paragraphCount} />
            <Stat
              label="H2/H3"
              value={`${report.headings.h2 + report.headings.h3}`}
            />
            <Stat label="Lists" value={report.listCount} />
          </div>

          {/* Keywords */}
          {report.keywords.length > 0 && (
            <div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Top keywords (density)
              </div>
              <div className="flex flex-wrap gap-2">
                {report.keywords.map((k) => (
                  <span
                    key={k.term}
                    className="px-2.5 py-1 rounded-full text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                  >
                    {k.term} · {k.density.toFixed(1)}%
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {report.suggestions.length > 0 && (
            <div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                What to improve
              </div>
              <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400 list-disc list-inside">
                {report.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-center">
      <div className="text-xl font-bold text-slate-900 dark:text-white">
        {value}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}
