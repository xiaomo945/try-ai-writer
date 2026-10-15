/**
 * Local, deterministic prompt optimizer.
 *
 * Two jobs:
 *   1. Score a prompt and report which dimensions are thin or absent.
 *   2. Build a stronger prompt by layering in what we actually know —
 *      the user's brand voice profile — plus safe structural constraints.
 *
 * Deliberately not an LLM call: this has to be instant, free, and work in
 * mock mode with no API keys.
 *
 * The honesty rule that shapes this file: we only inject information we
 * genuinely have. If the user never said who the audience is and there is no
 * profile to draw from, we do NOT invent "25-35 year old urban professionals".
 * We report the gap and let them fill it. A prompt optimizer that fabricates
 * specifics produces confidently wrong output, which is worse than none.
 */

import type { BrandVoiceProfile } from "./brand-voice";
import { getFingerprintSummary } from "./style-fingerprint";

export type OptimizeMode = "blog" | "email" | "social" | "custom" | "fiction";

export interface PromptIssue {
  id: string;
  label: string;
  severity: "missing" | "weak";
  advice: string;
  /** True when the optimizer could fill this from the brand voice profile. */
  autoFilled: boolean;
}

export interface PromptOptimizeResult {
  /** 0-100. How much of the useful context the prompt already carries. */
  score: number;
  issues: PromptIssue[];
  /** The prompt to send. Empty string when the input was empty. */
  optimized: string;
  /** Human-readable list of what got added, for showing the user the diff. */
  applied: string[];
}

interface Dimension {
  id: string;
  label: string;
  advice: string;
  /** Patterns that mean the user already covered this. */
  patterns: RegExp[];
  /** Minimum hits to count as fully covered rather than weak. */
  strong: number;
  modes: OptimizeMode[];
}

const ANY_MODE: OptimizeMode[] = ["blog", "email", "social", "custom", "fiction"];

const DIMENSIONS: Dimension[] = [
  {
    id: "topic",
    label: "主题具体性",
    advice:
      "说清楚到底要写什么。越具体，输出越可用——「写一篇关于咖啡的文章」远不如「给独立咖啡店老板写一篇为什么第三波咖啡浪潮让小门店更难活」",
    patterns: [/.{12,}/],
    strong: 1,
    modes: ANY_MODE,
  },
  {
    id: "audience",
    label: "目标读者",
    advice: "指明写给谁看。读者不同，用词、深度、举例方式完全不同。",
    patterns: [/读者|受众|面向|写给|用户是|人群|audience|readers|for\s+\w+/i],
    strong: 1,
    modes: ANY_MODE,
  },
  {
    id: "tone",
    label: "语气风格",
    advice: "说明要什么语气：正式、轻松、犀利、温和、幽默、克制……",
    patterns: [/语气|风格|口吻|调性|正式|轻松|幽默|犀利|专业|亲切|tone|casual|formal|professional/i],
    strong: 1,
    modes: ANY_MODE,
  },
  {
    id: "length",
    label: "篇幅长度",
    advice: "给出大致字数或篇幅。不给的话模型只能猜，通常是猜短。",
    patterns: [/字|篇幅|字数|段|长度|多长|words?|length|short|long|\d+\s*字/i],
    strong: 1,
    modes: ANY_MODE,
  },
  {
    id: "format",
    label: "结构格式",
    advice: "指定结构：要小标题、要分点、要大纲、要不要 Markdown……",
    patterns: [/结构|格式|大纲|分点|列表|小标题|标题|markdown|要点|outline|bullet|headings?/i],
    strong: 1,
    modes: ANY_MODE,
  },
  {
    id: "purpose",
    label: "写作目的",
    advice: "这篇东西要达成什么？说服、解释、转化、教育、娱乐？目的决定谋篇。",
    patterns: [/为了|目的|目标|说服|转化|号召|说明|解释|教育|娱乐|purpose|goal|cta|call to action|persuade/i],
    strong: 1,
    modes: ["blog", "email", "social", "custom"],
  },
  // ── Fiction-specific ────────────────────────────────────────────────────
  {
    id: "genre",
    label: "小说类型",
    advice: "标明类型：科幻、悬疑、言情、奇幻、现实题材……类型决定读者预期。",
    patterns: [/科幻|悬疑|推理|言情|爱情|奇幻|魔幻|武侠|历史|现实|恐怖|惊悚|喜剧|genre|scifi|fantasy|romance|mystery|horror/i],
    strong: 1,
    modes: ["fiction"],
  },
  {
    id: "pov",
    label: "叙事视角",
    advice: "第一人称还是第三人称？是否限知视角？视角错了整段都要重写。",
    patterns: [/第一人称|第三人称|视角|人称|pov|point of view|first person|third person/i],
    strong: 1,
    modes: ["fiction"],
  },
  {
    id: "conflict",
    label: "冲突与张力",
    advice: "给出核心冲突或悬念。没有冲突的场景写出来就是流水账。",
    patterns: [/冲突|矛盾|悬念|困境|危机|反转|张力|危险|秘密|conflict|tension|mystery|stakes/i],
    strong: 1,
    modes: ["fiction"],
  },
];

const LENGTH_DEFAULT: Record<OptimizeMode, string> = {
  blog: "800–1200 字，可上下浮动",
  email: "150–250 字，正文不超过 4 段",
  social: "100–150 字，手机上不用折叠",
  custom: "400–600 字，以说清楚为准",
  fiction: "800–1500 字，一个完整场面",
};

const FORMAT_DEFAULT: Record<OptimizeMode, string> = {
  blog: "使用 Markdown；开头一段引言点题，正文用 H2/H3 分节，结尾给出明确结论或行动建议",
  email: "先给一个主题行，再写正文；段落要短，结尾有且只有一个明确的行动号召",
  social: "第一行是钩子，必须能让人停下滑动；正文短句为主；结尾附 3–5 个相关标签",
  custom: "结构清晰、逻辑连贯，需要分点的地方就分点",
  fiction: "按场面分段，描写与对话并重；用具体动作和细节推进，不要概括性叙述；结尾留一个让人想继续读的钩子",
};

function countHits(prompt: string, patterns: RegExp[]): number {
  let hits = 0;
  for (const p of patterns) {
    if (p.test(prompt)) hits += 1;
  }
  return hits;
}

/**
 * Analyse a raw prompt and produce a stronger version of it.
 *
 * @param profile The user's brand voice profile. Optional; when present its
 *                tone, audience and style fingerprint are woven into the
 *                prompt — which is the whole point of having a profile.
 */
export function optimizePrompt(
  raw: string,
  mode: OptimizeMode = "custom",
  profile?: BrandVoiceProfile | null
): PromptOptimizeResult {
  const prompt = (raw ?? "").trim();

  if (!prompt) {
    return { score: 0, issues: [], optimized: "", applied: [] };
  }

  const relevant = DIMENSIONS.filter((d) => d.modes.includes(mode));

  const issues: PromptIssue[] = [];
  const applied: string[] = [];
  const additions: string[] = [];

  let earned = 0;
  for (const dim of relevant) {
    const hits = countHits(prompt, dim.patterns);
    if (hits >= dim.strong) {
      earned += 1;
      continue;
    }
    issues.push({
      id: dim.id,
      label: dim.label,
      severity: "missing",
      advice: dim.advice,
      autoFilled: false,
    });
  }

  // ── Fill from the brand voice profile ───────────────────────────────────
  // This is what makes the optimizer worth using: the profile already knows
  // the audience and tone, so instead of nagging the user we just apply it.
  const hasAudience = !issues.some((i) => i.id === "audience");
  const hasTone = !issues.some((i) => i.id === "tone");

  if (!hasAudience && profile?.audience) {
    additions.push(`目标读者：${profile.audience}`);
    applied.push(`目标读者（来自你的品牌声音档案：${profile.audience}）`);
    const idx = issues.findIndex((i) => i.id === "audience");
    if (idx >= 0) issues[idx] = { ...issues[idx]!, autoFilled: true };
    earned += 0.5;
  }

  if (!hasTone && profile?.tone) {
    additions.push(`语气：${profile.tone}`);
    applied.push(`语气（来自你的品牌声音档案：${profile.tone}）`);
    const idx = issues.findIndex((i) => i.id === "tone");
    if (idx >= 0) issues[idx] = { ...issues[idx]!, autoFilled: true };
    earned += 0.5;
  }

  // ── Always-applied structural constraints ───────────────────────────────
  // Safe defaults: they shape the output without inventing facts.
  const needLength = issues.some((i) => i.id === "length");
  if (needLength) {
    additions.push(`篇幅：${LENGTH_DEFAULT[mode]}`);
    applied.push(`篇幅（默认：${LENGTH_DEFAULT[mode]}）`);
  }

  const needFormat = issues.some((i) => i.id === "format");
  if (needFormat) {
    additions.push(`结构与格式：${FORMAT_DEFAULT[mode]}`);
    applied.push(`结构格式（默认）`);
  }

  // ── Brand voice block ───────────────────────────────────────────────────
  // Much richer than the four bullet points in prompt-builder.ts: when a
  // style fingerprint exists we hand the model the sentence-rhythm profile.
  const voiceLines: string[] = [];
  if (profile?.industry) voiceLines.push(`领域/行业：${profile.industry}`);
  if (profile?.audience) voiceLines.push(`习惯面对的读者：${profile.audience}`);
  if (profile?.tone) voiceLines.push(`惯用语气：${profile.tone}`);
  if (profile?.commonPhrases && profile.commonPhrases.length > 0) {
    voiceLines.push(`常用表达：${profile.commonPhrases.slice(0, 8).join("、")}`);
  }
  if (profile?.styleFingerprint && profile.styleFingerprint.sampleCount > 0) {
    voiceLines.push(`句法节奏：${getFingerprintSummary(profile.styleFingerprint)}`);
    voiceLines.push(
      `平均句长约 ${Math.round(profile.styleFingerprint.avgSentenceLength)} 字，平均段落约 ${Math.round(profile.styleFingerprint.avgParagraphSentenceCount)} 句`
    );
  }
  if (voiceLines.length > 0) {
    applied.push("作者声音档案（含句法节奏指纹）");
  }

  // ── Assemble ────────────────────────────────────────────────────────────
  const blocks: string[] = [prompt];

  if (additions.length > 0) {
    blocks.push(`## 输出要求\n${additions.map((a) => `- ${a}`).join("\n")}`);
  }

  if (voiceLines.length > 0) {
    blocks.push(`## 作者声音档案（请让成品贴合这个人的写法）\n${voiceLines.map((l) => `- ${l}`).join("\n")}`);
  }

  blocks.push("不要输出泛泛而谈的套话。如果不确定某处细节，就用合理假设写下去，不要空着。");

  const score = Math.max(0, Math.min(100, Math.round((earned / relevant.length) * 100)));

  return {
    score,
    issues,
    optimized: blocks.join("\n\n"),
    applied,
  };
}
