// Performance tracking system with Web Vitals and custom metrics

export interface WebVitalsMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  inp?: number; // Interaction to Next Paint
}

export interface CustomMetric {
  name: string;
  value: number;
  unit: string;
  category: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface PerformanceReport {
  webVitals: WebVitalsMetrics;
  customMetrics: CustomMetric[];
  pageLoadTime?: number;
  domInteractive?: number;
  domContentLoaded?: number;
  timestamp: string;
}

const STORAGE_KEYS = {
  WEB_VITALS: 'performance_web_vitals',
  CUSTOM_METRICS: 'performance_custom_metrics',
  PERFORMANCE_REPORTS: 'performance_reports',
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

export function trackWebVitals(): void {
  if (!isClient()) return;

  // Check if PerformanceObserver is available
  if (!('PerformanceObserver' in window)) {
    console.warn('PerformanceObserver not supported');
    return;
  }

  const metrics: WebVitalsMetrics = {};

  // First Contentful Paint (FCP)
  try {
    const fcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metrics.fcp = fcpEntry.startTime;
        saveWebVitals(metrics);
      }
    });
    fcpObserver.observe({ type: 'paint', buffered: true });
  } catch (e) {
    console.error('Error observing FCP:', e);
  }

  // Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        metrics.lcp = lastEntry.startTime;
        saveWebVitals(metrics);
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    console.error('Error observing LCP:', e);
  }

  // First Input Delay (FID)
  try {
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const firstInput = entries[0];
      if (firstInput && 'processingStart' in firstInput) {
        const fidEntry = firstInput as PerformanceEventTiming;
        metrics.fid = fidEntry.processingStart - fidEntry.startTime;
        saveWebVitals(metrics);
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    console.error('Error observing FID:', e);
  }

  // Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      for (const entry of entries) {
        if ('hadRecentInput' in entry) {
          const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
            metrics.cls = clsValue;
            saveWebVitals(metrics);
          }
        }
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    console.error('Error observing CLS:', e);
  }

  // Time to First Byte (TTFB)
  try {
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0) {
      const navigationEntry = navigationEntries[0]!;
      metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      saveWebVitals(metrics);
    }
  } catch (e) {
    console.error('Error calculating TTFB:', e);
  }

  // Interaction to Next Paint (INP)
  try {
    let maxINP = 0;
    const inpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      for (const entry of entries) {
        if ('duration' in entry) {
          const eventTiming = entry as PerformanceEventTiming;
          if (eventTiming.duration > maxINP) {
            maxINP = eventTiming.duration;
            metrics.inp = maxINP;
            saveWebVitals(metrics);
          }
        }
      }
    });
    inpObserver.observe({ type: 'event', buffered: true });
  } catch (e) {
    console.error('Error observing INP:', e);
  }
}

function saveWebVitals(metrics: WebVitalsMetrics): void {
  setToStorage(STORAGE_KEYS.WEB_VITALS, metrics);
}

export function trackCustomMetric(
  name: string,
  value: number,
  unit: string = 'ms',
  category: string = 'custom',
  metadata?: Record<string, string | number | boolean>
): void {
  const metrics = getFromStorage<CustomMetric[]>(STORAGE_KEYS.CUSTOM_METRICS, []);
  metrics.push({
    name,
    value,
    unit,
    category,
    timestamp: new Date().toISOString(),
    metadata,
  });
  setToStorage(STORAGE_KEYS.CUSTOM_METRICS, metrics);
}

export function getPerformanceReport(): PerformanceReport {
  const webVitals = getFromStorage<WebVitalsMetrics>(STORAGE_KEYS.WEB_VITALS, {});
  const customMetrics = getFromStorage<CustomMetric[]>(STORAGE_KEYS.CUSTOM_METRICS, []);

  let pageLoadTime: number | undefined;
  let domInteractive: number | undefined;
  let domContentLoaded: number | undefined;

  if (isClient() && 'performance' in window) {
    try {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const navEntry = navigationEntries[0]!;
        pageLoadTime = navEntry.loadEventEnd - navEntry.startTime;
        domInteractive = navEntry.domInteractive - navEntry.startTime;
        domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.startTime;
      }
    } catch (e) {
      console.error('Error getting navigation timing:', e);
    }
  }

  return {
    webVitals,
    customMetrics,
    pageLoadTime,
    domInteractive,
    domContentLoaded,
    timestamp: new Date().toISOString(),
  };
}

export function sendMetricsToAnalytics(endpoint: string): void {
  if (!isClient()) return;

  const report = getPerformanceReport();

  // Send to analytics endpoint
  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(report),
    keepalive: true,
  }).catch(error => {
    console.error('Failed to send metrics to analytics:', error);
  });

  // Also save to local storage for debugging
  const reports = getFromStorage<PerformanceReport[]>(STORAGE_KEYS.PERFORMANCE_REPORTS, []);
  reports.push(report);
  // Keep only last 100 reports
  if (reports.length > 100) {
    reports.splice(0, reports.length - 100);
  }
  setToStorage(STORAGE_KEYS.PERFORMANCE_REPORTS, reports);
}
