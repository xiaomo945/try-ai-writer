// A/B Testing System with localStorage persistence

export interface Variant {
  id: string;
  name: string;
  weight: number;
}

export interface ABTest {
  id: string;
  name: string;
  variants: Variant[];
  startDate: string;
  endDate?: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
}

export interface VariantAssignment {
  testId: string;
  variantId: string;
  userId: string;
  assignedAt: string;
}

export interface ConversionEvent {
  testId: string;
  variantId: string;
  userId: string;
  eventName: string;
  timestamp: string;
  value?: number;
}

export interface TestResults {
  testId: string;
  testName: string;
  variants: VariantResult[];
  totalParticipants: number;
  totalConversions: number;
  statisticalSignificance?: number;
}

export interface VariantResult {
  variantId: string;
  variantName: string;
  participants: number;
  conversions: number;
  conversionRate: number;
  confidence?: number;
}

const STORAGE_KEYS = {
  TESTS: 'ab_tests',
  ASSIGNMENTS: 'ab_assignments',
  CONVERSIONS: 'ab_conversions',
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

export function getVariant(testId: string, userId: string): string | null {
  const assignments = getFromStorage<VariantAssignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
  const assignment = assignments.find(a => a.testId === testId && a.userId === userId);
  return assignment?.variantId ?? null;
}

export function assignVariant(testId: string, userId: string): string | null {
  const existing = getVariant(testId, userId);
  if (existing) return existing;

  const tests = getFromStorage<ABTest[]>(STORAGE_KEYS.TESTS, []);
  const test = tests.find(t => t.id === testId);
  if (!test || test.status !== 'running') return null;

  const totalWeight = test.variants.reduce((sum, v) => sum + v.weight, 0);
  let random = Math.random() * totalWeight;
  let selectedVariant = test.variants[0]?.id ?? null;

  for (const variant of test.variants) {
    random -= variant.weight;
    if (random <= 0) {
      selectedVariant = variant.id;
      break;
    }
  }

  if (!selectedVariant) return null;

  const assignments = getFromStorage<VariantAssignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
  assignments.push({
    testId,
    variantId: selectedVariant,
    userId,
    assignedAt: new Date().toISOString(),
  });
  setToStorage(STORAGE_KEYS.ASSIGNMENTS, assignments);

  return selectedVariant;
}

export function trackConversion(
  testId: string,
  variantId: string,
  userId: string,
  eventName: string = 'conversion',
  value?: number
): void {
  const conversions = getFromStorage<ConversionEvent[]>(STORAGE_KEYS.CONVERSIONS, []);
  conversions.push({
    testId,
    variantId,
    userId,
    eventName,
    timestamp: new Date().toISOString(),
    value,
  });
  setToStorage(STORAGE_KEYS.CONVERSIONS, conversions);
}

export function trackEvent(
  eventName: string,
  metadata: Record<string, string | number | boolean> = {}
): void {
  const events = getFromStorage<Array<{ name: string; metadata: Record<string, string | number | boolean>; timestamp: string }>>('ab_events', []);
  events.push({
    name: eventName,
    metadata,
    timestamp: new Date().toISOString(),
  });
  setToStorage('ab_events', events);
}

export function getTestResults(testId: string): TestResults | null {
  const tests = getFromStorage<ABTest[]>(STORAGE_KEYS.TESTS, []);
  const test = tests.find(t => t.id === testId);
  if (!test) return null;

  const assignments = getFromStorage<VariantAssignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
  const conversions = getFromStorage<ConversionEvent[]>(STORAGE_KEYS.CONVERSIONS, []);

  const testAssignments = assignments.filter(a => a.testId === testId);
  const testConversions = conversions.filter(c => c.testId === testId);

  const variantResults: VariantResult[] = test.variants.map(variant => {
    const variantAssignments = testAssignments.filter(a => a.variantId === variant.id);
    const variantConversions = testConversions.filter(c => c.variantId === variant.id);
    const participants = variantAssignments.length;
    const conversionCount = variantConversions.length;
    const conversionRate = participants > 0 ? (conversionCount / participants) * 100 : 0;

    return {
      variantId: variant.id,
      variantName: variant.name,
      participants,
      conversions: conversionCount,
      conversionRate,
    };
  });

  const totalParticipants = testAssignments.length;
  const totalConversions = testConversions.length;

  const statisticalSignificance = variantResults.length === 2 && variantResults[0] && variantResults[1]
    ? calculateStatisticalSignificance(variantResults[0], variantResults[1])
    : undefined;

  return {
    testId,
    testName: test.name,
    variants: variantResults,
    totalParticipants,
    totalConversions,
    statisticalSignificance,
  };
}

export function calculateStatisticalSignificance(
  variant1: VariantResult,
  variant2: VariantResult
): number {
  if (variant1.participants === 0 || variant2.participants === 0) return 0;

  const p1 = variant1.conversions / variant1.participants;
  const p2 = variant2.conversions / variant2.participants;
  const pPooled = (variant1.conversions + variant2.conversions) / (variant1.participants + variant2.participants);

  if (pPooled === 0 || pPooled === 1) return 0;

  const standardError = Math.sqrt(
    pPooled * (1 - pPooled) * (1 / variant1.participants + 1 / variant2.participants)
  );

  if (standardError === 0) return 0;

  const zScore = Math.abs(p1 - p2) / standardError;

  // Convert z-score to p-value using normal distribution approximation
  const pValue = 2 * (1 - normalCDF(zScore));
  return Math.max(0, Math.min(1, pValue));
}

function normalCDF(x: number): number {
  // Approximation of the cumulative distribution function for standard normal
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

export function generateTestReport(testId: string): string {
  const results = getTestResults(testId);
  if (!results) return 'Test not found';

  let report = `A/B Test Report: ${results.testName}\n`;
  report += `${'='.repeat(50)}\n\n`;
  report += `Total Participants: ${results.totalParticipants}\n`;
  report += `Total Conversions: ${results.totalConversions}\n`;
  report += `Overall Conversion Rate: ${results.totalParticipants > 0 ? ((results.totalConversions / results.totalParticipants) * 100).toFixed(2) : 0}%\n\n`;

  report += `Variant Results:\n`;
  report += `${'-'.repeat(50)}\n`;

  for (const variant of results.variants) {
    report += `\n${variant.variantName} (${variant.variantId}):\n`;
    report += `  Participants: ${variant.participants}\n`;
    report += `  Conversions: ${variant.conversions}\n`;
    report += `  Conversion Rate: ${variant.conversionRate.toFixed(2)}%\n`;
  }

  if (results.statisticalSignificance !== undefined) {
    report += `\nStatistical Significance (p-value): ${results.statisticalSignificance.toFixed(4)}\n`;
    if (results.statisticalSignificance < 0.05) {
      report += `Result: Statistically significant (p < 0.05)\n`;
    } else {
      report += `Result: Not statistically significant (p >= 0.05)\n`;
    }
  }

  return report;
}
