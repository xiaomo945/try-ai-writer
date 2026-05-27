import { BrandVoiceProfile } from './brand-voice';
import type { MemoryItem } from './memory-bank';
import { getPersonaGreeting, getPersonaQuestions } from './digital-twin-persona';

export interface InterviewResult {
  needsInterview: boolean;
  greeting: string;
  questions: string[];
  enhancedPrompt?: string;
  triggerReason?: string;
  questionCount?: number;
  contextualHints?: Record<number, string>;
  transitionPhrases?: string[];
  isFollowUp?: boolean;
}

interface TransitionPhrase {
  prefix: string;
  followUp?: string;
}

const TRANSITION_PHRASES: TransitionPhrase[] = [
  { prefix: "好问题！让我想想...", followUp: "关于这个方面" },
  { prefix: "明白了！让我再确认一下...", followUp: "关于这一点" },
  { prefix: "有意思！让我深入了解一下...", followUp: "接着这个话题" },
  { prefix: "让我帮你理清思路...", followUp: "关于这一点" },
  { prefix: "了解了，那关于...", followUp: "让我再问一下" },
  { prefix: "让我想想...", followUp: "关于这一点" },
  { prefix: "嗯，很好的方向...", followUp: "让我确认一下" },
];

const GREETING_TRANSITIONS = [
  "让我来帮你理清思路...",
  "好，让我们聊聊你的想法...",
  "很高兴帮你思考这个话题...",
  "让我先了解一下你的需求...",
  "我们来深入聊聊..."
];

const ANSWER_REACTION_PHRASES = [
  "了解了！",
  "明白了！",
  "很好！",
  "原来如此！",
  "有意思！"
];

const FOLLOW_UP_PHRASES = [
  "关于这一点，你还有什么想补充的吗？",
  "那这个细节能再展开说说吗？",
  "还有哪些方面需要考虑？",
  "这个角度很有意思，还有补充吗？",
  "好的，还有什么我应该知道的吗？"
];

const MEMORY_REFERENCE_TEMPLATES = [
  "根据你之前关于\"{keyword}\"的想法，你这次想深入哪个方向？",
  "我记得你对\"{keyword}\"有过思考，这次有什么新想法吗？",
  "之前你提到过\"{keyword}\"，这次想怎么展开？"
];

function getRandomTransition(index: number): TransitionPhrase {
  const phraseIndex = index % TRANSITION_PHRASES.length;
  return TRANSITION_PHRASES[phraseIndex] ?? { prefix: "让我想想..." };
}

function getRandomGreetingTransition(): string {
  const index = Math.floor(Math.random() * GREETING_TRANSITIONS.length);
  return GREETING_TRANSITIONS[index] ?? "让我来帮你理清思路...";
}

function getRandomAnswerReaction(): string {
  const index = Math.floor(Math.random() * ANSWER_REACTION_PHRASES.length);
  return ANSWER_REACTION_PHRASES[index] ?? "了解了！";
}

function getRandomFollowUp(): string {
  const index = Math.floor(Math.random() * FOLLOW_UP_PHRASES.length);
  return FOLLOW_UP_PHRASES[index] ?? "关于这一点，你还有什么想补充的吗？";
}

function getMemoryReference(keyword: string): string {
  const templates = MEMORY_REFERENCE_TEMPLATES;
  if (templates.length === 0) return `根据你之前关于"${keyword}"的想法，你这次想深入哪个方向？`;
  const index = Math.floor(Math.random() * templates.length);
  const template = templates[index]!;
  return template.replace('{keyword}', keyword);
}

function findRelevantMemoryForQuestion(
  questionIndex: number,
  questions: string[],
  memories: MemoryItem[]
): { keyword: string; memory: MemoryItem } | null {
  if (questionIndex === 0 || memories.length === 0) return null;
  
  const prevQuestion = questions[questionIndex - 1];
  if (!prevQuestion) return null;
  
  const previousQuestion = prevQuestion.toLowerCase();
  const relevantMemories = memories.filter(m => 
    m.keywords.some(k => previousQuestion.includes(k.toLowerCase())) ||
    m.content.toLowerCase().includes(previousQuestion.slice(0, 20))
  );
  
  if (relevantMemories.length === 0) return null;
  
  const memory = relevantMemories[0]!;
  const keyword = memory.keywords[0] || memory.content.slice(0, 10);
  return { keyword, memory };
}

function hasKeyElements(prompt: string): boolean {
  const KEY_ELEMENTS = [
    '主题', '内容', '读者', '受众', '风格', '语气', '目的', '目标', '字数',
    'topic', 'content', 'audience', 'readers', 'style', 'tone', 'purpose', 'goal', 'word',
    '长度', '格式', '长度', '受众', '宣传', '推广', '介绍', '文章', '博客', '邮件'
  ];
  const lower = prompt.toLowerCase();
  return KEY_ELEMENTS.some(el => lower.includes(el.toLowerCase()));
}

function hasDetailedDescription(prompt: string): boolean {
  if (prompt.includes('：') || prompt.includes(':')) {
    const parts = prompt.split(/[：:]/);
    if (parts.length > 1 && parts[1] && parts[1].trim().length > 20) {
      return true;
    }
  }
  
  const sentences = prompt.split(/[.。!！?？\n]/);
  if (sentences.filter(s => s.trim().length > 10).length >= 2) {
    return true;
  }
  
  return false;
}

function countRelevantMemories(topic: string, memories: MemoryItem[]): number {
  if (!topic.trim() || !memories || memories.length === 0) return 0;
  
  const lowerTopic = topic.toLowerCase();
  return memories.filter(m => 
    m.keywords.some(k => k.toLowerCase().includes(lowerTopic)) ||
    m.content.toLowerCase().includes(lowerTopic)
  ).length;
}

function calculateDynamicQuestionCount(
  prompt: string,
  hasUserContext: boolean,
  hasBrandProfile: boolean,
  relevantMemoryCount: number
): number {
  const promptLength = prompt.trim().length;
  const hasDetailedPrompt = promptLength > 80 && hasKeyElements(prompt) && hasDetailedDescription(prompt);
  
  if (hasDetailedPrompt) {
    return 0;
  }
  
  if (relevantMemoryCount > 0) {
    return 2;
  }
  
  if (hasUserContext) {
    return 2;
  }
  
  if (!hasKeyElements(prompt)) {
    return hasBrandProfile ? 3 : 4;
  }
  
  if (!hasDetailedDescription(prompt)) {
    return hasBrandProfile ? 2 : 3;
  }
  
  return 2;
}

function enrichQuestionsWithContext(
  questions: string[],
  previousAnswers: string[],
  memories: MemoryItem[]
): { questions: string[]; hints: Record<number, string> } {
  const enrichedQuestions: string[] = [];
  const contextualHints: Record<number, string> = {};
  let memoryUsed = false;
  
  questions.forEach((question, index) => {
    if (index === 0) {
      const greetingTransition = getRandomGreetingTransition();
      enrichedQuestions.push(`${greetingTransition} ${question}`);
      return;
    }
    
    const transition = getRandomTransition(index);
    const prevAnswer = previousAnswers[index - 1];
    
    if (!memoryUsed && memories && memories.length > 0) {
      const memoryRef = findRelevantMemoryForQuestion(index, questions, memories);
      if (memoryRef) {
        memoryUsed = true;
        const memoryRefText = getMemoryReference(memoryRef.keyword);
        const followUp = getRandomFollowUp();
        enrichedQuestions.push(`${memoryRefText} ${followUp} ${question}`);
        contextualHints[index] = `记忆引用："${memoryRef.memory.content.slice(0, 30)}..."`;
        return;
      }
    }
    
    if (prevAnswer && prevAnswer.trim()) {
      const reaction = getRandomAnswerReaction();
      const extractedKeyword = extractKeywordFromAnswer(prevAnswer);
      if (extractedKeyword) {
        contextualHints[index] = `基于你刚才提到的"${extractedKeyword}"`;
        const followUp = getRandomFollowUp();
        enrichedQuestions.push(`${reaction} ${transition.followUp || transition.prefix}，${followUp} ${question}`);
      } else {
        const followUp = getRandomFollowUp();
        enrichedQuestions.push(`${reaction} ${followUp} ${question}`);
      }
    } else {
      enrichedQuestions.push(`${transition.prefix} ${question}`);
    }
  });
  
  return { questions: enrichedQuestions, hints: contextualHints };
}

function extractKeywordFromAnswer(answer: string): string | null {
  const cleaned = answer.trim();
  if (cleaned.length < 3) return null;
  
  const words = cleaned.split(/[\s,.!?;，。、；]+/).filter(w => w.length > 2);
  if (words.length > 0) {
    const lastWord = words[words.length - 1];
    return lastWord ? lastWord.slice(0, 15) : cleaned.slice(0, 15);
  }
  
  return cleaned.slice(0, 15);
}

export function interviewUser(
  prompt: string,
  mode: string,
  brandProfile?: BrandVoiceProfile,
  historicalViews?: string[],
  memories?: MemoryItem[]
): InterviewResult {
  const trimmedPrompt = prompt.trim();
  const greeting = getPersonaGreeting(brandProfile);
  const relevantMemoryCount = countRelevantMemories(trimmedPrompt, memories || []);
  
  const hasUserContext = relevantMemoryCount > 0 || (memories !== undefined && memories.length >= 3);
  const hasBrandProfile = !!brandProfile;
  const dynamicQuestionCount = calculateDynamicQuestionCount(
    trimmedPrompt,
    hasUserContext,
    hasBrandProfile,
    relevantMemoryCount
  );

  if (dynamicQuestionCount === 0) {
    return {
      needsInterview: false,
      greeting,
      questions: [],
      triggerReason: 'detailed_prompt',
      questionCount: 0
    };
  }

  const baseQuestions = getPersonaQuestions(brandProfile, trimmedPrompt, historicalViews, memories);
  const { questions: enrichedQuestions, hints } = enrichQuestionsWithContext(
    baseQuestions.slice(0, dynamicQuestionCount),
    [],
    memories || []
  );
  
  const transitionPhrases = enrichedQuestions.map((_, index) => {
    if (index === 0) return getRandomGreetingTransition();
    return getRandomTransition(index).prefix;
  });

  return {
    needsInterview: true,
    greeting: `${greeting} ${getRandomGreetingTransition()}`,
    questions: enrichedQuestions,
    triggerReason: 'dynamic_interview',
    questionCount: enrichedQuestions.length,
    contextualHints: hints,
    transitionPhrases
  };
}

export function buildContextualFollowUp(
  questionIndex: number,
  previousAnswer: string,
  allPreviousAnswers: string[]
): string {
  const transition = getRandomTransition(questionIndex);
  const keyword = extractKeywordFromAnswer(previousAnswer);
  
  if (keyword && questionIndex > 0) {
    const randomFollowUp = FOLLOW_UP_PHRASES[Math.floor(Math.random() * FOLLOW_UP_PHRASES.length)];
    return `了解了，那关于"${keyword}"，${randomFollowUp}`;
  }
  
  return `${transition.prefix} ${transition.followUp || '让我再确认一下'}...`;
}
