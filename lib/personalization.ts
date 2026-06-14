// Personalization System with user profiling and recommendations

export interface UserProfile {
  userId: string;
  interests: string[];
  behaviorTags: string[];
  preferredContentTypes: string[];
  engagementScore: number;
  lastActive: string;
  sessionCount: number;
  pageViews: Record<string, number>;
  events: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface Recommendation {
  id: string;
  type: 'content' | 'feature' | 'action';
  title: string;
  description: string;
  score: number;
  reason: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface RecommendationRequest {
  userId: string;
  context?: string;
  limit?: number;
}

const STORAGE_KEY = 'user_profiles';

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

export function saveUserProfile(profile: UserProfile): void {
  const profiles = getFromStorage<Record<string, UserProfile>>(STORAGE_KEY, {});
  profiles[profile.userId] = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  setToStorage(STORAGE_KEY, profiles);
}

export function loadUserProfile(userId: string): UserProfile | null {
  const profiles = getFromStorage<Record<string, UserProfile>>(STORAGE_KEY, {});
  return profiles[userId] ?? null;
}

export function buildUserProfile(
  userId: string,
  pageViews: Array<{ path: string; timestamp: string }>,
  events: Array<{ name: string; category: string; timestamp: string; metadata?: Record<string, string | number | boolean> }>
): UserProfile {
  const existing = loadUserProfile(userId);

  // Extract interests from page paths and events
  const interests = extractInterests(pageViews, events);
  const behaviorTags = extractBehaviorTags(pageViews, events);
  const preferredContentTypes = extractContentTypes(pageViews);

  // Calculate engagement score
  const engagementScore = calculateEngagementScore(pageViews, events);

  const now = new Date().toISOString();

  const profile: UserProfile = {
    userId,
    interests,
    behaviorTags,
    preferredContentTypes,
    engagementScore,
    lastActive: now,
    sessionCount: existing?.sessionCount ? existing.sessionCount + 1 : 1,
    pageViews: aggregatePageViews(pageViews),
    events: aggregateEvents(events),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  saveUserProfile(profile);
  return profile;
}

function extractInterests(
  pageViews: Array<{ path: string; timestamp: string }>,
  events: Array<{ name: string; category: string; timestamp: string; metadata?: Record<string, string | number | boolean> }>
): string[] {
  const interestMap = new Map<string, number>();

  // Extract from page paths
  for (const pv of pageViews) {
    const path = pv.path.toLowerCase();
    if (path.includes('/blog/')) {
      const category = path.split('/blog/')[1]?.split('/')[0] ?? 'general';
      interestMap.set(category, (interestMap.get(category) ?? 0) + 1);
    }
    if (path.includes('/tools/')) {
      const tool = path.split('/tools/')[1]?.split('/')[0] ?? 'general';
      interestMap.set(`tool:${tool}`, (interestMap.get(`tool:${tool}`) ?? 0) + 1);
    }
  }

  // Extract from events
  for (const event of events) {
    if (event.category === 'content') {
      interestMap.set(event.name, (interestMap.get(event.name) ?? 0) + 2);
    }
  }

  // Sort by frequency and return top interests
  return [...interestMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([interest]) => interest);
}

function extractBehaviorTags(
  pageViews: Array<{ path: string; timestamp: string }>,
  events: Array<{ name: string; category: string; timestamp: string; metadata?: Record<string, string | number | boolean> }>
): string[] {
  const tags = new Set<string>();

  if (pageViews.length > 10) tags.add('power-user');
  if (pageViews.length > 5) tags.add('active');

  const hasPricingVisit = pageViews.some(pv => pv.path.includes('/pricing'));
  if (hasPricingVisit) tags.add('pricing-interested');

  const hasToolUsage = pageViews.some(pv => pv.path.includes('/tools/') || pv.path.includes('/write'));
  if (hasToolUsage) tags.add('tool-user');

  const hasBlogReading = pageViews.some(pv => pv.path.includes('/blog/'));
  if (hasBlogReading) tags.add('content-consumer');

  const conversionEvents = events.filter(e => e.category === 'conversion');
  if (conversionEvents.length > 0) tags.add('converter');

  return [...tags];
}

function extractContentTypes(pageViews: Array<{ path: string; timestamp: string }>): string[] {
  const typeMap = new Map<string, number>();

  for (const pv of pageViews) {
    const path = pv.path.toLowerCase();
    if (path.includes('/blog/')) {
      typeMap.set('blog', (typeMap.get('blog') ?? 0) + 1);
    }
    if (path.includes('/tools/')) {
      typeMap.set('tools', (typeMap.get('tools') ?? 0) + 1);
    }
    if (path.includes('/pricing')) {
      typeMap.set('pricing', (typeMap.get('pricing') ?? 0) + 1);
    }
    if (path.includes('/templates')) {
      typeMap.set('templates', (typeMap.get('templates') ?? 0) + 1);
    }
  }

  return [...typeMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([type]) => type);
}

function calculateEngagementScore(
  pageViews: Array<{ path: string; timestamp: string }>,
  events: Array<{ name: string; category: string; timestamp: string; metadata?: Record<string, string | number | boolean> }>
): number {
  let score = 0;

  // Page views contribute to score
  score += pageViews.length * 2;

  // Events contribute more
  score += events.length * 5;

  // Conversion events contribute even more
  const conversionEvents = events.filter(e => e.category === 'conversion');
  score += conversionEvents.length * 20;

  // Bonus for diverse activity
  const uniquePaths = new Set(pageViews.map(pv => pv.path));
  score += uniquePaths.size * 3;

  // Cap at 100
  return Math.min(100, score);
}

function aggregatePageViews(pageViews: Array<{ path: string; timestamp: string }>): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const pv of pageViews) {
    counts[pv.path] = (counts[pv.path] ?? 0) + 1;
  }
  return counts;
}

function aggregateEvents(events: Array<{ name: string; category: string; timestamp: string; metadata?: Record<string, string | number | boolean> }>): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const event of events) {
    counts[event.name] = (counts[event.name] ?? 0) + 1;
  }
  return counts;
}

export function generateRecommendations(request: RecommendationRequest): Recommendation[] {
  const { userId, context, limit = 5 } = request;
  const profile = loadUserProfile(userId);

  if (!profile) {
    return getDefaultRecommendations();
  }

  const recommendations: Recommendation[] = [];

  // Recommend based on interests
  if (profile.interests.includes('blog') || profile.preferredContentTypes.includes('blog')) {
    recommendations.push({
      id: 'rec-blog-latest',
      type: 'content',
      title: 'Latest AI Writing Tips',
      description: 'Check out our newest blog posts on AI writing techniques',
      score: 85,
      reason: 'Based on your interest in blog content',
    });
  }

  // Recommend tools based on usage
  if (profile.behaviorTags.includes('tool-user')) {
    recommendations.push({
      id: 'rec-tools-explore',
      type: 'feature',
      title: 'Explore Advanced Tools',
      description: 'Try our headline generator and outline builder',
      score: 90,
      reason: 'You are an active tool user',
    });
  }

  // Recommend upgrade for power users
  if (profile.behaviorTags.includes('power-user') && !profile.behaviorTags.includes('converter')) {
    recommendations.push({
      id: 'rec-upgrade',
      type: 'action',
      title: 'Upgrade to Pro',
      description: 'Get unlimited access with our Pro plan',
      score: 95,
      reason: 'You are a power user who would benefit from Pro features',
    });
  }

  // Recommend pricing for interested users
  if (profile.behaviorTags.includes('pricing-interested') && !profile.behaviorTags.includes('converter')) {
    recommendations.push({
      id: 'rec-pricing',
      type: 'action',
      title: 'View Pricing Plans',
      description: 'Find the perfect plan for your needs',
      score: 88,
      reason: 'You have shown interest in our pricing',
    });
  }

  // Recommend templates for content creators
  if (profile.preferredContentTypes.includes('templates') || profile.behaviorTags.includes('content-consumer')) {
    recommendations.push({
      id: 'rec-templates',
      type: 'content',
      title: 'Browse Templates',
      description: 'Get started faster with our ready-to-use templates',
      score: 82,
      reason: 'Based on your content preferences',
    });
  }

  // Context-specific recommendations
  if (context === 'dashboard') {
    recommendations.push({
      id: 'rec-dashboard-action',
      type: 'action',
      title: 'Start Writing',
      description: 'Create your next masterpiece',
      score: 80,
      reason: 'Quick action from your dashboard',
    });
  }

  // Sort by score and limit
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function getDefaultRecommendations(): Recommendation[] {
  return [
    {
      id: 'rec-default-1',
      type: 'content',
      title: 'Getting Started Guide',
      description: 'Learn how to make the most of AI Writer',
      score: 75,
      reason: 'Recommended for new users',
    },
    {
      id: 'rec-default-2',
      type: 'feature',
      title: 'Try Our Tools',
      description: 'Explore our suite of AI writing tools',
      score: 70,
      reason: 'Popular feature',
    },
    {
      id: 'rec-default-3',
      type: 'action',
      title: 'View Pricing',
      description: 'See our flexible pricing options',
      score: 65,
      reason: 'Find the right plan for you',
    },
  ];
}
