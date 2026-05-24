export type Tone = "formal" | "casual" | "humorous" | "professional";

export interface BrandVoiceProfile {
  tone: Tone;
  style: string;
  commonPhrases: string[];
  industry: string;
  targetAudience: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandVoiceSample {
  id: string;
  content: string;
  mode: "blog" | "email" | "social" | "custom";
  timestamp: string;
  keyPoints: string[];
}

export interface KeyViewPoint {
  id: string;
  text: string;
  sourceSampleId: string;
  sourceSampleTitle: string;
}

const STORAGE_KEY_PROFILE = "use-ai-writer-brand-profile";
const STORAGE_KEY_SAMPLES = "use-ai-writer-brand-samples";
const STORAGE_KEY_VIEWPOINTS = "use-ai-writer-key-viewpoints";

export function getToday(): string {
  return new Date().toISOString();
}

export function loadProfileFromStorage(): BrandVoiceProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) return null;
    return JSON.parse(raw) as BrandVoiceProfile;
  } catch {
    return null;
  }
}

export function saveProfileToStorage(profile: BrandVoiceProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function loadSamplesFromStorage(): BrandVoiceSample[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAMPLES);
    if (!raw) return [];
    return JSON.parse(raw) as BrandVoiceSample[];
  } catch {
    return [];
  }
}

export function saveSamplesToStorage(samples: BrandVoiceSample[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_SAMPLES, JSON.stringify(samples));
  } catch {
    // ignore
  }
}

export function loadViewpointsFromStorage(): KeyViewPoint[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VIEWPOINTS);
    if (!raw) return [];
    return JSON.parse(raw) as KeyViewPoint[];
  } catch {
    return [];
  }
}

export function saveViewpointsToStorage(viewpoints: KeyViewPoint[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_VIEWPOINTS, JSON.stringify(viewpoints));
  } catch {
    // ignore
  }
}

export function createDefaultProfile(overrides?: Partial<BrandVoiceProfile>): BrandVoiceProfile {
  const today = getToday();
  return {
    tone: "professional",
    style: "clear and concise",
    commonPhrases: [],
    industry: "",
    targetAudience: "",
    createdAt: today,
    updatedAt: today,
    ...overrides,
  };
}

export function getContextPromptFromProfile(profile: BrandVoiceProfile): string {
  let prompt = `You are writing in a ${profile.tone} tone. `;
  prompt += `Your style is ${profile.style}. `;
  if (profile.commonPhrases.length > 0) {
    prompt += `Common phrases: ${profile.commonPhrases.join(", ")}. `;
  }
  if (profile.industry) {
    prompt += `Industry: ${profile.industry}. `;
  }
  if (profile.targetAudience) {
    prompt += `Audience: ${profile.targetAudience}.`;
  }
  return prompt;
}
