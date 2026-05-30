import { BrandVoiceProfile } from "./brand-voice";
import type { MemoryItem } from "./memory-bank";
import { getPreviousInterviewTopics, findSimilarPreviousTopic, hasInterviewedAbout } from "./interview-memory";

export function getPersonaGreeting(profile?: BrandVoiceProfile): string {
  if (profile) {
    const toneText = profile.tone || "自然且专业";
    return `嗨，我是你的数字写作分身。今天想创作点什么？我记着你喜欢${toneText}的风格。`;
  }
  return "嗨，我是你的数字写作分身。告诉我你的想法，我会帮你变成好作品。";
}

function extractKeywords(text: string): string[] {
  if (!text) return [];
  const words = text.split(/[\s,.!?;]+/).filter(word => word.length > 2);
  return [...new Set(words.map(w => w.toLowerCase()))];
}

function getRelevantMemories(currentTopic: string, memories: MemoryItem[]): MemoryItem[] {
  if (!currentTopic.trim()) return [];
  const lowerTopic = currentTopic.toLowerCase();
  const topicKeywords = extractKeywords(currentTopic);
  return memories.filter(m => {
    return m.keywords.some(k => topicKeywords.some(tk => k.includes(tk) || tk.includes(k))) ||
           m.content.toLowerCase().includes(lowerTopic);
  }).slice(0, 3);
}

type WritingMode = "blog" | "email" | "social" | "custom";

const BLOG_QUESTIONS = [
  "你这次想写的核心主题是什么？能具体说说想覆盖哪些要点吗？",
  "这篇文章的目标读者是谁？他们最关心什么问题？",
  "你希望传达的核心观点或独特见解是什么？",
  "有没有什么数据、案例或个人经历可以支撑你的观点？",
  "字数大概多少？需要包含哪些章节结构？",
];

const EMAIL_QUESTIONS = [
  "这封邮件的核心目标是什么？（通知/说服/邀请/跟进…）",
  "收件人是谁？你们的关系如何？（客户/同事/合作伙伴…）",
  "你希望收件人读完后做什么？（行动号召）",
  "邮件语气应该是怎样的？（正式/友好/紧迫/温暖…）",
  "大概多长？需要包含哪些关键信息？",
];

const SOCIAL_QUESTIONS = [
  "你要发在哪个平台？（Twitter/LinkedIn/Instagram/TikTok…）",
  "目标受众是谁？他们通常在什么场景下看到这条内容？",
  "你想聊什么话题？有没有想带的标签或关键词？",
  "这条内容的互动目标是什么？（点赞/评论/分享/点击链接…）",
  "需要配合图片或视频吗？文案需要什么视觉配合？",
];

const CREATIVE_FICTION_KEYWORDS = ["小说", "故事", "虚构", "角色", "情节", "世界观", "novel", "story", "fiction", "character", "plot", "worldbuilding"];

const CREATIVE_QUESTIONS = [
  "你想创作什么类型的故事？能描述一下核心设定吗？",
  "主角是什么样的人？有什么独特的动机或困境？",
  "故事发生在什么样的世界？有什么特别的规则或氛围？",
  "你希望读者读完后的感受是什么？（感动/紧张/思考…）",
  "故事的基调是怎样的？（黑暗/温暖/悬疑/奇幻…）",
];

const GENERIC_QUESTIONS = [
  "你这次想写的核心主题是什么？",
  "这篇文章是给谁看的？（目标人群）",
  "你希望这次的文字是什么语气？（专业/轻松/故事感…）",
  "有没有什么特别想强调的要点？",
  "大概需要多长的内容？",
];

function detectWritingMode(prompt: string): WritingMode {
  const lower = prompt.toLowerCase();
  const blogKeywords = ["博客", "blog", "文章", "article", "帖子", "post", "指南", "guide", "教程", "tutorial"];
  const emailKeywords = ["邮件", "email", "信", "letter", "通知", "newsletter", "邀请", "invitation", "跟进", "follow-up"];
  const socialKeywords = ["社交", "social", "推文", "tweet", "帖子", "linkedin", "instagram", "tiktok", "facebook", "twitter", "微博", "朋友圈"];
  if (blogKeywords.some(k => lower.includes(k))) return "blog";
  if (emailKeywords.some(k => lower.includes(k))) return "email";
  if (socialKeywords.some(k => lower.includes(k))) return "social";
  return "custom";
}

function isCreativeFiction(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  return CREATIVE_FICTION_KEYWORDS.some(k => lower.includes(k));
}

function getModeQuestions(mode: WritingMode, isFiction: boolean): string[] {
  if (isFiction) return CREATIVE_QUESTIONS;
  switch (mode) {
    case "blog": return BLOG_QUESTIONS;
    case "email": return EMAIL_QUESTIONS;
    case "social": return SOCIAL_QUESTIONS;
    default: return GENERIC_QUESTIONS;
  }
}

const MODE_TRANSITIONS: Record<WritingMode, string[]> = {
  blog: ["好的，让我帮你理清这篇文章的思路...", "写博客最关键的是对读者有价值，让我来帮你...", "好文章需要好结构，我们一起来梳理..."],
  email: ["邮件最重要的是目标明确，让我帮你...", "好的，我们来打造一封高转化邮件...", "邮件写作讲究精炼有力，让我帮你..."],
  social: ["社交内容需要一秒抓住注意力，让我帮你...", "好的，我们来打造一条高互动的内容...", "社交平台讲究节奏感，让我帮你..."],
  custom: ["让我来帮你理清思路...", "好，让我们聊聊你的想法...", "很高兴帮你思考这个话题..."],
};

export function getPersonaQuestions(
  profile?: BrandVoiceProfile,
  topic?: string,
  historicalViews?: string[],
  memories?: MemoryItem[]
): string[] {
  const questions: string[] = [];
  const mode = detectWritingMode(topic || "");
  const isFiction = isCreativeFiction(topic || "");
  const modeQuestions = getModeQuestions(mode, isFiction);

  const similarTopic = topic ? findSimilarPreviousTopic(topic) : null;
  const hasInterviewed = topic ? hasInterviewedAbout(topic) : false;

  if (memories && topic) {
    const relevantMemories = getRelevantMemories(topic, memories);
    if (relevantMemories.length > 0) {
      const memory = relevantMemories[0];
      const memoryKeyword = memory?.keywords?.[0] || memory?.content?.slice(0, 15) || "";
      questions.push(`你之前提到过${memoryKeyword}，这次是想继续那个方向，还是换个角度？`);
    }
  }

  if (similarTopic) {
    questions.push(`你之前提到过"${similarTopic}"，这次想从哪个新角度探讨？`);
    if (modeQuestions[1]) questions.push(modeQuestions[1]);
    if (modeQuestions[2]) questions.push(modeQuestions[2]);
    return questions.slice(0, 3);
  }

  if (hasInterviewed) {
    if (modeQuestions[0]) questions.push(modeQuestions[0]);
    if (modeQuestions[1]) questions.push(modeQuestions[1]);
    if (modeQuestions[2]) questions.push(modeQuestions[2]);
    return questions.slice(0, 3);
  }

  if (topic && topic.length > 0) {
    questions.push(modeQuestions[0] || `你这次的核心主题是"${topic}"吗？能再补充一点背景吗？`);
  } else {
    questions.push(modeQuestions[0] || "你这次想写的核心主题是什么？");
  }

  if (profile?.industry && mode === "blog") {
    questions.push(`你是想给${profile.industry}行业的读者看吗？他们最关心什么？`);
  } else {
    questions.push(modeQuestions[1] || "这篇文章是给谁看的？（目标人群）");
  }

  if (profile?.tone) {
    questions.push(`还是保持你喜欢的${profile.tone}风格吗？`);
  } else {
    questions.push(modeQuestions[2] || "你希望这次的文字是什么语气？");
  }

  if (mode === "blog" && modeQuestions[3]) {
    questions.push(modeQuestions[3]);
  }
  if (mode === "email" && modeQuestions[3]) {
    questions.push(modeQuestions[3]);
  }
  if (mode === "social" && modeQuestions[3]) {
    questions.push(modeQuestions[3]);
  }
  if (isFiction && modeQuestions[3]) {
    questions.push(modeQuestions[3]);
  }

  if (historicalViews && historicalViews.length > 0) {
    questions.push(`你之前提到过"${historicalViews[0]}"，这次还想从这个角度写吗？`);
  }

  return questions.slice(0, 5);
}

export function getModeGreeting(mode: WritingMode): string {
  const transitions = MODE_TRANSITIONS[mode] || MODE_TRANSITIONS.custom;
  const index = Math.floor(Math.random() * transitions.length);
  return transitions[index] || "让我来帮你理清思路...";
}

export { detectWritingMode, type WritingMode };
