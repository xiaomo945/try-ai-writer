import { Tone } from "./brand-voice";

const FORMAL_WORDS = [
  "therefore", "thus", "hence", "consequently", "nevertheless", "nonetheless",
  "furthermore", "moreover", "additionally", "subsequently", "accordingly",
  "henceforth", "thereafter", "hereinafter", "heretofore", "hitherto", "thusly",
  "utilize", "implement", "facilitate", "enhance", "optimize", "prioritize",
  "initiate", "commence", "terminate", "conclude", "ascertain", "determine",
  "establish", "validate", "verify", "confirm", "acknowledge", "recognize", "perceive",
  "comprehend", "understand", "appreciate", "recognize", "identify", "analyze",
  "evaluate", "assess", "examine", "investigate", "research", "study",
  "collaborate", "cooperate", "partner", "liaise", "communicate", "correspond",
  "liaison", "coordinate", "organize", "arrange", "schedule", "plan",
  "strategize", "plan", "design", "develop", "create", "produce", "generate"
];

const CASUAL_WORDS = [
  "gonna", "wanna", "gotta", "gimme", "lemme", "dunno", "ain't", "ya",
  "y'all", "guys", "dude", "bro", "mate", "chill", "cool", "awesome",
  "lit", "fire", "slay", "vibe", "vibes", "chillax", "chillin",
  "chill out", "hang out", "catch up", "chit chat", "small talk",
  "like", "literally", "basically", "seriously", "totally", "absolutely",
  "definitely", "sure", "yeah", "nope", "nah", "yep", "yup",
  "okay", "ok", "k", "kk", "haha", "lol", "lmao", "rofl",
  "omg", "omfg", "wtf", "brb", "ttyl", "gtg", "cu", "ily"
];

const HUMOROUS_INDICATORS = ["😂", "🤣", "😆", "😄", "😁", "😀", "😂", "🤪", "😜", "😝", "🤪", "🤩", "😸", "😹", "🤭", "🤫", "🤔", "🤠", "😎", "🤓", "😈", "👻", "👽", "🤖", "🎉", "🎊", "🎈", "🎁", "🎀", "🎃", "🎄", "🎅", "🎆", "🎇", "🎈", "🎉", "🎊", "🎀", "🎁", "🎃", "🎄", "🎅", "🎆", "🎇", "🎈"];

function countMatches(text: string, words: string[]): number {
  let count = 0;
  const lowerText = text.toLowerCase();
  words.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const matches = lowerText.match(regex);
    if (matches) count += matches.length;
  });
  return count;
}

function countExclamations(text: string): number {
  return (text.match(/!/g) || []).length;
}

function countEmojis(text: string): number {
  let count = 0;
  HUMOROUS_INDICATORS.forEach(emoji => {
    count += (text.match(new RegExp(emoji, "g")) || []).length;
  });
  return count;
}

function averageSentenceLength(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 0;
  const totalWords = sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0);
  return totalWords / sentences.length;
}

export function analyzeTone(text: string): { tone: Tone; confidence: number } {
  const formalCount = countMatches(text, FORMAL_WORDS);
  const casualCount = countMatches(text, CASUAL_WORDS);
  const exclamationCount = countExclamations(text);
  const emojiCount = countEmojis(text);
  const avgSentenceLen = averageSentenceLength(text);
  
  let formalScore = formalCount * 2;
  let casualScore = casualCount * 2;
  let humorousScore = 0;
  let professionalScore = 0;
  
  if (avgSentenceLen > 20) formalScore += 3;
  if (avgSentenceLen < 10) casualScore += 2;
  if (exclamationCount > 3) humorousScore += 2;
  if (emojiCount > 0) {
    casualScore += emojiCount;
    humorousScore += emojiCount * 2;
  }
  
  professionalScore = formalScore;
  
  const scores = {
    formal: formalScore,
    casual: casualScore,
    humorous: humorousScore,
    professional: professionalScore,
  };
  
  let maxScore = 0;
  let tone: Tone = "professional";
  Object.entries(scores).forEach(([key, score]) => {
    if (score > maxScore) {
      maxScore = score;
      tone = key as Tone;
    }
  });
  
  const total = Object.values(scores).reduce((sum, s) => sum + s, 0);
  const confidence = total === 0 ? 0.5 : Math.min(maxScore / total, 0.95);
  
  return { tone, confidence };
}
