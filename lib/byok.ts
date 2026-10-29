"use client";

/**
 * Bring-your-own-key (BYOK) client storage.
 *
 * The user's API key is kept ONLY in their browser's localStorage and is sent
 * per-request as a header. It is never written to our database or logs. This
 * keeps AI writing zero-cost for the site operator.
 */

export type ByokProvider = "deepseek" | "claude";

const KEY_STORAGE = "byok-api-key";
const PROVIDER_STORAGE = "byok-provider";

export interface ByokConfig {
  provider: ByokProvider;
  apiKey: string;
}

export function getByok(): ByokConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const apiKey = localStorage.getItem(KEY_STORAGE) || "";
    const rawProvider = localStorage.getItem(PROVIDER_STORAGE);
    const provider: ByokProvider = rawProvider === "claude" ? "claude" : "deepseek";
    if (!apiKey) return null;
    return { provider, apiKey };
  } catch {
    return null;
  }
}

export function setByok(provider: ByokProvider, apiKey: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROVIDER_STORAGE, provider);
    localStorage.setItem(KEY_STORAGE, apiKey.trim());
    window.dispatchEvent(new Event("byok-change"));
  } catch {
    // ignore (private mode / quota)
  }
}

export function clearByok(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY_STORAGE);
    localStorage.removeItem(PROVIDER_STORAGE);
    window.dispatchEvent(new Event("byok-change"));
  } catch {
    // ignore
  }
}

/** Headers to attach to /api/generate requests. Empty when no key is set. */
export function getByokHeaders(): Record<string, string> {
  const config = getByok();
  if (!config) return {};
  return {
    "x-user-api-key": config.apiKey,
    "x-user-provider": config.provider,
  };
}
