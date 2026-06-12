/**
 * Unified client-side storage abstraction.
 * Wraps localStorage with JSON serialization, error handling, and fallback.
 */

const STORAGE_PREFIX = "tryai_";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getStorage(): Storage | null {
  if (!isBrowser()) return null;
  try {
    const key = "__storage_test__";
    localStorage.setItem(key, key);
    localStorage.removeItem(key);
    return localStorage;
  } catch {
    return null;
  }
}

function key(prefix: string, name: string): string {
  return `${STORAGE_PREFIX}${prefix}_${name}`;
}

export function createStorage(prefix: string) {
  const storage = getStorage();

  return {
    get<T>(name: string): T | null {
      if (!storage) return null;
      try {
        const raw = storage.getItem(key(prefix, name));
        if (raw === null) return null;
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    },

    set<T>(name: string, value: T): boolean {
      if (!storage) return false;
      try {
        storage.setItem(key(prefix, name), JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },

    remove(name: string): void {
      if (!storage) return;
      try {
        storage.removeItem(key(prefix, name));
      } catch {
        // ignore
      }
    },

    keys(): string[] {
      if (!storage) return [];
      const result: string[] = [];
      const fullPrefix = `${STORAGE_PREFIX}${prefix}_`;
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k?.startsWith(fullPrefix)) {
          result.push(k.slice(fullPrefix.length));
        }
      }
      return result;
    },

    clear(): void {
      if (!storage) return;
      const fullPrefix = `${STORAGE_PREFIX}${prefix}_`;
      const toRemove: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k?.startsWith(fullPrefix)) {
          toRemove.push(k);
        }
      }
      toRemove.forEach((k) => {
        try { storage.removeItem(k); } catch { /* ignore */ }
      });
    },
  };
}