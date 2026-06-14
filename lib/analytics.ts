// Analytics System with localStorage persistence

export interface AnalyticsEvent {
  id: string;
  name: string;
  category: string;
  userId?: string;
  timestamp: string;
  metadata: Record<string, string | number | boolean>;
  sessionId: string;
}

export interface PageViewEvent {
  id: string;
  path: string;
  referrer?: string;
  userId?: string;
  timestamp: string;
  duration?: number;
  sessionId: string;
}

export interface FunnelStep {
  funnelId: string;
  stepName: string;
  stepOrder: number;
  userId: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface FunnelData {
  funnelId: string;
  steps: FunnelStepData[];
  totalUsers: number;
}

export interface FunnelStepData {
  stepName: string;
  stepOrder: number;
  users: number;
  conversionRate: number;
  dropoffRate: number;
}

export interface FunnelDropoffAnalysis {
  stepName: string;
  stepOrder: number;
  usersAtStep: number;
  usersLost: number;
  dropoffRate: number;
  isCriticalDropoff: boolean;
}

export interface UserJourney {
  userId: string;
  sessionId: string;
  events: JourneyEvent[];
  startTime: string;
  endTime?: string;
}

export interface JourneyEvent {
  type: 'page_view' | 'event' | 'funnel_step';
  name: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
}

const STORAGE_KEYS = {
  EVENTS: 'analytics_events',
  PAGE_VIEWS: 'analytics_page_views',
  FUNNEL_STEPS: 'analytics_funnel_steps',
  USER_JOURNEYS: 'analytics_user_journeys',
  SESSION_ID: 'analytics_session_id',
} as const;

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (!isClient()) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error('Failed to save to localStorage');
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function getSessionId(): string {
  if (!isClient()) return 'server-session';
  let sessionId = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
  if (!sessionId) {
    sessionId = generateId();
    sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  }
  return sessionId;
}

export function trackEvent(
  name: string,
  category: string = 'general',
  metadata: Record<string, string | number | boolean> = {},
  userId?: string
): void {
  const events = getFromStorage<AnalyticsEvent[]>(STORAGE_KEYS.EVENTS, []);
  events.push({
    id: generateId(),
    name,
    category,
    userId,
    timestamp: new Date().toISOString(),
    metadata,
    sessionId: getSessionId(),
  });
  setToStorage(STORAGE_KEYS.EVENTS, events);
}

export function trackPageView(
  path: string,
  referrer?: string,
  userId?: string
): void {
  const pageViews = getFromStorage<PageViewEvent[]>(STORAGE_KEYS.PAGE_VIEWS, []);
  pageViews.push({
    id: generateId(),
    path,
    referrer,
    userId,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
  });
  setToStorage(STORAGE_KEYS.PAGE_VIEWS, pageViews);

  // Also track as an event
  trackEvent('page_view', 'navigation', { path, referrer: referrer ?? '' }, userId);
}

export function trackFunnelStep(
  funnelId: string,
  stepName: string,
  stepOrder: number,
  userId: string,
  metadata?: Record<string, string | number | boolean>
): void {
  const steps = getFromStorage<FunnelStep[]>(STORAGE_KEYS.FUNNEL_STEPS, []);
  steps.push({
    funnelId,
    stepName,
    stepOrder,
    userId,
    timestamp: new Date().toISOString(),
    metadata,
  });
  setToStorage(STORAGE_KEYS.FUNNEL_STEPS, steps);

  // Also track as an event
  trackEvent('funnel_step', 'conversion', { funnelId, stepName, stepOrder }, userId);
}

export function getFunnelData(funnelId: string): FunnelData {
  const steps = getFromStorage<FunnelStep[]>(STORAGE_KEYS.FUNNEL_STEPS, []);
  const funnelSteps = steps.filter(s => s.funnelId === funnelId);

  // Get unique users per step
  const stepMap = new Map<number, Set<string>>();
  for (const step of funnelSteps) {
    if (!stepMap.has(step.stepOrder)) {
      stepMap.set(step.stepOrder, new Set());
    }
    stepMap.get(step.stepOrder)!.add(step.userId);
  }

  // Get unique users per step name
  const stepNameMap = new Map<string, Set<string>>();
  for (const step of funnelSteps) {
    if (!stepNameMap.has(step.stepName)) {
      stepNameMap.set(step.stepName, new Set());
    }
    stepNameMap.get(step.stepName)!.add(step.userId);
  }

  // Build step data
  const allStepNames = [...new Set(funnelSteps.map(s => s.stepName))];
  const sortedStepNames = allStepNames.sort((a, b) => {
    const orderA = funnelSteps.find(s => s.stepName === a)?.stepOrder ?? 0;
    const orderB = funnelSteps.find(s => s.stepName === b)?.stepOrder ?? 0;
    return orderA - orderB;
  });

  const totalUsers = stepMap.size > 0
    ? Math.max(...[...stepMap.values()].map(s => s.size))
    : 0;

  const stepData: FunnelStepData[] = sortedStepNames.map((stepName, index) => {
    const users = stepNameMap.get(stepName)?.size ?? 0;
    const prevUsers = index === 0 ? totalUsers : (stepNameMap.get(sortedStepNames[index - 1]!)?.size ?? totalUsers);
    const conversionRate = prevUsers > 0 ? (users / prevUsers) * 100 : 0;
    const dropoffRate = 100 - conversionRate;

    return {
      stepName,
      stepOrder: index + 1,
      users,
      conversionRate,
      dropoffRate,
    };
  });

  return {
    funnelId,
    steps: stepData,
    totalUsers,
  };
}

export function getFunnelConversionRate(funnelId: string): number {
  const data = getFunnelData(funnelId);
  if (data.steps.length === 0 || data.totalUsers === 0) return 0;

  const lastStep = data.steps[data.steps.length - 1];
  if (!lastStep) return 0;

  return (lastStep.users / data.totalUsers) * 100;
}

export function getFunnelDropoffAnalysis(funnelId: string): FunnelDropoffAnalysis[] {
  const data = getFunnelData(funnelId);
  if (data.steps.length === 0) return [];

  const analyses: FunnelDropoffAnalysis[] = [];
  const avgDropoff = data.steps.reduce((sum, s) => sum + s.dropoffRate, 0) / data.steps.length;

  for (let i = 0; i < data.steps.length; i++) {
    const step = data.steps[i]!;
    const prevUsers = i === 0 ? data.totalUsers : (data.steps[i - 1]?.users ?? data.totalUsers);
    const usersLost = prevUsers - step.users;

    analyses.push({
      stepName: step.stepName,
      stepOrder: step.stepOrder,
      usersAtStep: step.users,
      usersLost,
      dropoffRate: step.dropoffRate,
      isCriticalDropoff: step.dropoffRate > avgDropoff * 1.5 && step.dropoffRate > 30,
    });
  }

  return analyses;
}

export function trackUserJourney(
  userId: string,
  eventType: 'page_view' | 'event' | 'funnel_step',
  eventName: string,
  metadata?: Record<string, string | number | boolean>
): void {
  const journeys = getFromStorage<UserJourney[]>(STORAGE_KEYS.USER_JOURNEYS, []);
  const sessionId = getSessionId();

  let journey = journeys.find(j => j.userId === userId && j.sessionId === sessionId);

  if (!journey) {
    journey = {
      userId,
      sessionId,
      events: [],
      startTime: new Date().toISOString(),
    };
    journeys.push(journey);
  }

  journey.events.push({
    type: eventType,
    name: eventName,
    timestamp: new Date().toISOString(),
    metadata,
  });

  journey.endTime = new Date().toISOString();

  setToStorage(STORAGE_KEYS.USER_JOURNEYS, journeys);
}
