"use client";

import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Play,
  Loader2,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  Download,
  Save,
  ArrowLeft,
  FileText,
  FileCode2,
  Wand2,
  XCircle,
} from "lucide-react";
import {
  getPresetWorkflows,
  getWorkflowsByCategory,
  type WorkflowDefinition,
  type WorkflowStep,
  type WorkflowCategory,
} from "@/lib/workflows";
import { useBrandVoice } from "@/lib/brand-voice";
import { useHistory } from "@/lib/history";
import { optimizePrompt, type PromptOptimizeResult } from "@/lib/prompt-optimizer";

type StepStatus = "idle" | "running" | "done" | "error";

const CATEGORY_META: Record<WorkflowCategory, { label: string; hint: string }> = {
  fiction: { label: "小说创作", hint: "按小说家的真实工序拆步骤" },
  business: { label: "商业写作", hint: "营销、文案、SEO 等成稿流程" },
};

const TYPE_LABEL: Record<WorkflowStep["type"], string> = {
  generate: "生成",
  edit: "改写",
  review: "审阅",
};

function triggerDownload(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^\w一-龥]+/g, "-")
      .replace(/^-+|-+$/g, "") || "workflow"
  );
}

function WorkflowsInner() {
  const searchParams = useSearchParams();
  const { profile } = useBrandVoice();
  const { addRecord } = useHistory();

  const [category, setCategory] = useState<WorkflowCategory>("fiction");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [idea, setIdea] = useState("");
  const [optimization, setOptimization] = useState<PromptOptimizeResult | null>(null);
  const [showOptimization, setShowOptimization] = useState(false);

  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, StepStatus>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const workflows = useMemo(() => getWorkflowsByCategory(category), [category]);
  const selected: WorkflowDefinition | null = useMemo(
    () => getPresetWorkflows().find((w) => w.id === selectedId) ?? null,
    [selectedId]
  );

  // Deep link support: /workflows?w=<id>
  useEffect(() => {
    const id = searchParams?.get("w");
    if (!id) return;
    const match = getPresetWorkflows().find((w) => w.id === id);
    if (match) {
      setCategory(match.category ?? "business");
      setSelectedId(id);
    }
  }, [searchParams]);

  // Reset run state when switching workflows — a different workflow's outputs
  // are meaningless to the new one.
  useEffect(() => {
    setOutputs({});
    setStatuses({});
    setErrorMsg(null);
    setSaved(false);
    setOptimization(null);
    setShowOptimization(false);
  }, [selectedId]);

  /** Everything produced so far, as context for the next step. */
  const buildContext = useCallback(
    (steps: WorkflowStep[], uptoIndex: number): string => {
      const parts: string[] = [];
      for (let i = 0; i < uptoIndex; i++) {
        const step = steps[i];
        const out = outputs[step?.id ?? ""];
        if (step && out && out.trim()) {
          parts.push(`### 已完成步骤 ${i + 1}：${step.title}\n${out.trim()}`);
        }
      }
      return parts.join("\n\n");
    },
    [outputs]
  );

  const runStep = useCallback(
    async (step: WorkflowStep, index: number) => {
      if (!selected) return;

      const baseIdea = optimization?.optimized || idea.trim();
      if (!baseIdea) {
        setErrorMsg("先写下你的想法或素材，再运行步骤。");
        return;
      }

      setErrorMsg(null);
      setStatuses((prev) => ({ ...prev, [step.id]: "running" }));

      const context = buildContext(selected.steps, index);

      const systemParts: string[] = [step.prompt];
      if (context) {
        systemParts.push(
          `以下是这个工作流前面步骤已经确定的内容。你必须严格遵守并保持连贯，不要推翻或重写它们：\n\n${context}`
        );
      }
      systemParts.push(
        `本次写作围绕下面这个想法/素材展开：\n\n${baseIdea}`
      );
      if (profile?.styleFingerprint && profile.styleFingerprint.sampleCount > 0) {
        systemParts.push(
          `作者的语言习惯：平均句长约 ${Math.round(profile.styleFingerprint.avgSentenceLength)} 字，平均段落约 ${Math.round(profile.styleFingerprint.avgParagraphSentenceCount)} 句。${profile.tone ? `语气偏${profile.tone}。` : ""}`
        );
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: baseIdea,
            mode: "fiction",
            enhancedPrompt: systemParts.join("\n\n---\n\n"),
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || data.suggestion || `HTTP ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");
        const decoder = new TextDecoder();
        let text = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          setOutputs((prev) => ({ ...prev, [step.id]: text }));
        }

        if (!text.trim()) throw new Error("AI 返回了空内容");
        setStatuses((prev) => ({ ...prev, [step.id]: "done" }));
      } catch (err) {
        setStatuses((prev) => ({ ...prev, [step.id]: "error" }));
        setErrorMsg(
          err instanceof Error ? err.message : "生成失败，请稍后重试。"
        );
      }
    },
    [selected, idea, optimization, buildContext, profile]
  );

  const handleOptimize = useCallback(() => {
    const result = optimizePrompt(idea, "fiction", profile);
    setOptimization(result);
    setShowOptimization(true);
  }, [idea, profile]);

  const applyOptimization = useCallback(() => {
    if (!optimization?.optimized) return;
    setIdea(optimization.optimized);
    setShowOptimization(false);
  }, [optimization]);

  const completedCount = selected
    ? selected.steps.filter((s) => statuses[s.id] === "done").length
    : 0;

  const assembleAll = useCallback((): string => {
    if (!selected) return "";
    const header = `# ${selected.name}\n\n> 原始想法：\n> ${idea.trim()}\n`;
    const body = selected.steps
      .map((s, i) => {
        const out = outputs[s.id];
        if (!out || !out.trim()) return "";
        return `## ${i + 1}. ${s.title}\n\n${out.trim()}`;
      })
      .filter(Boolean)
      .join("\n\n---\n\n");
    return `${header}\n${body}`;
  }, [selected, idea, outputs]);

  const handleSave = useCallback(() => {
    const all = assembleAll();
    if (!all.trim() || !selected) return;
    addRecord({
      title: `${selected.name}：${idea.trim().slice(0, 40)}`,
      mode: "fiction",
      result: all,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, [assembleAll, selected, idea, addRecord]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0C] text-gray-900 dark:text-white">
      <header className="border-b border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-emerald-400">
            ✨ Workflows
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/write"
              className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
            >
              写作台
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 pb-24">
        {!selected ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">选一个工作流</h1>
              <p className="text-gray-500 dark:text-slate-400">
                工作流把一件复杂的写作拆成有顺序的几步，每一步的结果会自动成为下一步的依据。
              </p>
            </div>
            <CategoryTabs category={category} onChange={setCategory} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {workflows.map((w) => (
                <WorkflowCard key={w.id} workflow={w} onPick={() => setSelectedId(w.id)} />
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setSelectedId(null)}
              className="mb-4 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              换一个工作流
            </button>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* ── Left: the idea ─────────────────────────────────────── */}
              <div className="lg:col-span-1 space-y-4">
                <div className="rounded-xl border border-gray-200 dark:border-white/10 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{selected.icon}</span>
                    <div>
                      <h1 className="font-semibold">{selected.name}</h1>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {completedCount}/{selected.steps.length} 步已完成
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {selected.description}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-white/10 p-4">
                  <label className="block text-sm font-medium mb-2">
                    你的想法 / 素材
                  </label>
                  <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    rows={8}
                    placeholder="先把想法写下来，哪怕很粗糙。比如：一个女人回到家发现门开着，屋里有人来过的痕迹，但她无法确定自己是不是记错了。"
                    className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-transparent p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-y"
                  />
                  <button
                    onClick={handleOptimize}
                    disabled={!idea.trim()}
                    className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg border border-emerald-300 dark:border-emerald-500/40 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Wand2 className="w-4 h-4" />
                    优化这段想法
                  </button>
                </div>

                {showOptimization && optimization && (
                  <OptimizationPanel
                    result={optimization}
                    onApply={applyOptimization}
                    onDismiss={() => setShowOptimization(false)}
                  />
                )}
              </div>

              {/* ── Right: the steps ───────────────────────────────────── */}
              <div className="lg:col-span-2 space-y-4">
                {errorMsg && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                    <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {selected.steps.map((step, i) => (
                  <StepCard
                    key={step.id}
                    index={i}
                    step={step}
                    status={statuses[step.id] ?? "idle"}
                    output={outputs[step.id] ?? ""}
                    onRun={() => runStep(step, i)}
                    onEdit={(v) => setOutputs((prev) => ({ ...prev, [step.id]: v }))}
                    // A step only makes sense once the previous one produced something.
                    blocked={i > 0 && !outputs[selected.steps[i - 1]?.id ?? ""]?.trim()}
                  />
                ))}

                {completedCount > 0 && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors"
                    >
                      {saved ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          已保存到历史
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          保存全部到历史
                        </>
                      )}
                    </button>
                    <button
                      onClick={() =>
                        triggerDownload(
                          `${slugify(selected.name)}.md`,
                          assembleAll(),
                          "text/markdown;charset=utf-8"
                        )
                      }
                      className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      导出 Markdown
                    </button>
                    <button
                      onClick={() =>
                        triggerDownload(
                          `${slugify(selected.name)}.txt`,
                          assembleAll(),
                          "text/plain;charset=utf-8"
                        )
                      }
                      className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <FileCode2 className="w-4 h-4" />
                      导出纯文本
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

/* ── Entry point ─────────────────────────────────────────────────────────────
   The inner component reads ?w= via useSearchParams, which Next requires to sit
   inside a Suspense boundary for a statically prerendered page. */
export default function WorkflowsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          加载中…
        </div>
      }
    >
      <WorkflowsInner />
    </Suspense>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function CategoryTabs({
  category,
  onChange,
}: {
  category: WorkflowCategory;
  onChange: (c: WorkflowCategory) => void;
}) {
  return (
    <div className="flex gap-2">
      {(Object.keys(CATEGORY_META) as WorkflowCategory[]).map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            category === c
              ? "bg-emerald-600 text-white"
              : "border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
          }`}
        >
          {CATEGORY_META[c].label}
          <span className="ml-1.5 text-xs opacity-70">{CATEGORY_META[c].hint}</span>
        </button>
      ))}
    </div>
  );
}

function WorkflowCard({
  workflow,
  onPick,
}: {
  workflow: WorkflowDefinition;
  onPick: () => void;
}) {
  return (
    <button
      onClick={onPick}
      className="text-left rounded-xl border border-gray-200 dark:border-white/10 p-4 hover:border-emerald-300 dark:hover:border-emerald-500/40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
    >
      <div className="flex items-start justify-between">
        <span className="text-2xl">{workflow.icon}</span>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-400 transition-colors" />
      </div>
      <h3 className="font-semibold mt-3">{workflow.name}</h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
        {workflow.description}
      </p>
      <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">
        {workflow.steps.length} 步
      </p>
    </button>
  );
}

function OptimizationPanel({
  result,
  onApply,
  onDismiss,
}: {
  result: PromptOptimizeResult;
  onApply: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
          提示词完整度
        </span>
        <span
          className={`text-sm font-bold ${
            result.score >= 70
              ? "text-emerald-600"
              : result.score >= 40
              ? "text-amber-600"
              : "text-red-600"
          }`}
        >
          {result.score}/100
        </span>
      </div>

      {result.applied.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-emerald-800 dark:text-emerald-300 mb-1">
            已自动补充：
          </p>
          <ul className="text-xs text-emerald-900 dark:text-emerald-200 space-y-0.5">
            {result.applied.map((a) => (
              <li key={a}>· {a}</li>
            ))}
          </ul>
        </div>
      )}

      {result.issues.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-amber-800 dark:text-amber-300 mb-1">
            只有你能补上的：
          </p>
          <ul className="text-xs text-gray-600 dark:text-slate-300 space-y-1">
            {result.issues.map((i) => (
              <li key={i.id}>
                · <span className="font-medium">{i.label}</span>：{i.advice}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onApply}
          className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white transition-colors"
        >
          应用优化版
        </button>
        <button
          onClick={onDismiss}
          className="rounded-lg px-3 py-1.5 text-sm text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/10 transition-colors"
        >
          知道了
        </button>
      </div>
    </div>
  );
}

function StepCard({
  index,
  step,
  status,
  output,
  onRun,
  onEdit,
  blocked,
}: {
  index: number;
  step: WorkflowStep;
  status: StepStatus;
  output: string;
  onRun: () => void;
  onEdit: (v: string) => void;
  blocked: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              status === "done"
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-slate-400"
            }`}
          >
            {status === "done" ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
          </span>
          <div>
            <h3 className="font-medium text-sm">{step.title}</h3>
            <p className="text-xs text-gray-400 dark:text-slate-500 line-clamp-2">
              {step.prompt}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-slate-400">
            {TYPE_LABEL[step.type]}
          </span>
          <button
            onClick={onRun}
            disabled={status === "running" || blocked}
            title={blocked ? "请先完成上一步" : undefined}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 text-sm font-medium text-white transition-colors"
          >
            {status === "running" ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                生成中
              </>
            ) : status === "done" ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                重跑
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                运行
              </>
            )}
          </button>
        </div>
      </div>

      {(status === "done" || output) && (
        <textarea
          value={output}
          onChange={(e) => onEdit(e.target.value)}
          rows={Math.min(20, Math.max(6, Math.ceil(output.length / 60)))}
          className="mt-3 w-full rounded-lg border border-gray-200 dark:border-white/10 bg-transparent p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-y"
        />
      )}

      {blocked && status === "idle" && (
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          先完成上一步，这一步会基于它的结果来写
        </p>
      )}
    </div>
  );
}
