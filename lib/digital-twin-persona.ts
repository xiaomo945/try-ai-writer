import { BrandVoiceProfile } from "./brand-voice";

export function getPersonaGreeting(profile?: BrandVoiceProfile): string {
  if (profile) {
    const toneText = profile.tone || "自然且专业";
    return `嗨，我是你的数字写作分身。今天想创作点什么？我记着你喜欢${toneText}的风格。`;
  }
  return "嗨，我是你的数字写作分身。告诉我你的想法，我会帮你变成好作品。";
}

export function getPersonaQuestions(
  profile?: BrandVoiceProfile,
  topic?: string,
  historicalViews?: string[]
): string[] {
  const questions: string[] = [];

  if (topic && topic.length > 0) {
    questions.push(`你这次的核心主题是“${topic}”吗？能再补充一点背景吗？`);
  } else {
    questions.push("你这次想写的核心主题是什么？");
  }

  if (profile?.industry) {
    questions.push(`你是想给${profile.industry}行业的读者看吗？`);
  } else {
    questions.push("这篇文章是给谁看的？（目标人群）");
  }

  if (profile?.tone) {
    questions.push(`还是保持你喜欢的${profile.tone}风格吗？`);
  } else {
    questions.push("你希望这次的文字是什么语气？（专业/轻松/故事感…）");
  }

  if (historicalViews && historicalViews.length > 0) {
    questions.push(`你之前提到过“${historicalViews[0]}”，这次还想从这个角度写吗？`);
  }

  return questions.slice(0, 5);
}
