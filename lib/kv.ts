/**
 * Key-value storage abstraction.
 *
 * Why this exists
 * ---------------
 * `lib/subscription-store.ts` and `lib/referral.ts` originally wrote JSON files
 * into `data/` with `fs.writeFileSync`. On Vercel that cannot work: serverless
 * instances have ephemeral, non-shared filesystems. A payment webhook handled
 * by instance A writes the subscription, then a request served by instance B
 * reads nothing. The subscription "silently" never activates -- which is
 * exactly the symptom reported.
 *
 * Backends
 * --------
 * 1. Upstash Redis over plain REST (default in production). The free tier is
 *    enough for this site's scale, and the project already talks to every
 *    other API with raw `fetch`, so no SDK is needed.
 * 2. The local filesystem (development, or a self-hosted Node server with a
 *    persistent volume).
 * 3. An in-memory Map (last resort). It keeps the site from crashing when no
 *    backend is configured, but state does not survive a restart, so the
 *    server logs a warning rather than pretending everything is fine.
 *
 * Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to use Redis.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";

export type KVBackend = "redis" | "filesystem" | "memory";

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const FILE_DIR = join(process.cwd(), "data", ".kv");

const memoryStore = new Map<string, string>();

let warnedAboutBackend = false;

function detectBackend(): KVBackend {
  if (REDIS_URL && REDIS_TOKEN) return "redis";
  // Tests run hermetically in memory so they never touch the disk and stay
  // order-independent.
  if (process.env.NODE_ENV === "test") return "memory";
  if (process.env.NODE_ENV === "production") return "memory";
  return "filesystem";
}

export function getBackend(): KVBackend {
  return detectBackend();
}

function warnOnce() {
  if (warnedAboutBackend) return;
  warnedAboutBackend = true;
  // Never warn under test — the in-memory backend is the intended choice there.
  if (process.env.NODE_ENV === "test") return;
  if (detectBackend() === "memory") {
    console.warn(
      "[kv] No persistent backend configured. Data will be lost on restart. " +
        "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to persist state."
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Redis (Upstash REST)                                                        */
/* -------------------------------------------------------------------------- */

async function redisCommand<T>(
  command: (string | number)[],
  { raw = false }: { raw?: boolean } = {}
): Promise<T> {
  if (!REDIS_URL || !REDIS_TOKEN) {
    throw new Error("Redis is not configured");
  }

  const res = await fetch(REDIS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Redis error (${res.status}): ${text.substring(0, 200)}`);
  }

  const payload = (await res.json()) as { result: T; error?: string };
  if (payload.error) {
    throw new Error(`Redis error: ${payload.error}`);
  }
  return raw ? payload.result : payload.result;
}

/* -------------------------------------------------------------------------- */
/* Filesystem                                                                  */
/* -------------------------------------------------------------------------- */

function ensureFileDir() {
  if (!existsSync(FILE_DIR)) {
    mkdirSync(FILE_DIR, { recursive: true });
  }
}

function filePathFor(key: string): string {
  // Keys may contain characters that are not safe in a filename.
  const safe = key.replace(/[^a-zA-Z0-9._-]/g, "_");
  return join(FILE_DIR, `${safe}.json`);
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                  */
/* -------------------------------------------------------------------------- */

export async function kvGet(key: string): Promise<string | null> {
  warnOnce();
  switch (detectBackend()) {
    case "redis": {
      try {
        const result = await redisCommand<string | null>(["GET", key]);
        return result ?? null;
      } catch (err) {
        console.error(`[kv] GET ${key} failed, falling back to memory:`, err);
        return memoryStore.get(key) ?? null;
      }
    }
    case "filesystem": {
      ensureFileDir();
      const fp = filePathFor(key);
      if (!existsSync(fp)) return null;
      try {
        return readFileSync(fp, "utf-8");
      } catch {
        return null;
      }
    }
    default:
      return memoryStore.get(key) ?? null;
  }
}

export async function kvSet(
  key: string,
  value: string,
  options: { ttlSeconds?: number } = {}
): Promise<void> {
  warnOnce();
  switch (detectBackend()) {
    case "redis": {
      try {
        if (options.ttlSeconds) {
          await redisCommand(["SET", key, value, "EX", options.ttlSeconds]);
        } else {
          await redisCommand(["SET", key, value]);
        }
        return;
      } catch (err) {
        console.error(`[kv] SET ${key} failed, falling back to memory:`, err);
        memoryStore.set(key, value);
        return;
      }
    }
    case "filesystem": {
      ensureFileDir();
      writeFileSync(filePathFor(key), value, "utf-8");
      return;
    }
    default:
      memoryStore.set(key, value);
  }
}

export async function kvDel(key: string): Promise<void> {
  switch (detectBackend()) {
    case "redis": {
      try {
        await redisCommand(["DEL", key]);
      } catch (err) {
        console.error(`[kv] DEL ${key} failed:`, err);
      }
      return;
    }
    case "filesystem": {
      ensureFileDir();
      const fp = filePathFor(key);
      if (existsSync(fp)) {
        try {
          writeFileSync(fp, "", "utf-8");
        } catch {
          // ignore
        }
      }
      return;
    }
    default:
      memoryStore.delete(key);
  }
}

export async function kvIncr(key: string): Promise<number> {
  switch (detectBackend()) {
    case "redis": {
      try {
        const result = await redisCommand<number>(["INCR", key]);
        return Number(result);
      } catch (err) {
        console.error(`[kv] INCR ${key} failed:`, err);
        const next = (Number(memoryStore.get(key) ?? "0") || 0) + 1;
        memoryStore.set(key, String(next));
        return next;
      }
    }
    case "filesystem": {
      const current = Number(await kvGet(key) ?? "0") || 0;
      const next = current + 1;
      await kvSet(key, String(next));
      return next;
    }
    default: {
      const next = (Number(memoryStore.get(key) ?? "0") || 0) + 1;
      memoryStore.set(key, String(next));
      return next;
    }
  }
}

/**
 * List keys under a prefix. Redis uses SCAN with a cursor; the filesystem
 * backend reads the directory. The result is capped so a single call can never
 * pull an unbounded number of keys into memory.
 */
export async function kvListByPrefix(
  prefix: string,
  limit = 500
): Promise<string[]> {
  switch (detectBackend()) {
    case "redis": {
      const keys: string[] = [];
      let cursor = "0";
      try {
        do {
          const result = await redisCommand<[string, string[]]>([
            "SCAN",
            cursor,
            "MATCH",
            `${prefix}*`,
            "COUNT",
            100,
          ]);
          cursor = result[0] ?? "0";
          keys.push(...(result[1] ?? []));
          if (keys.length >= limit) break;
        } while (cursor !== "0");
      } catch (err) {
        console.error(`[kv] SCAN ${prefix} failed:`, err);
        return [];
      }
      return keys.slice(0, limit);
    }
    case "filesystem": {
      ensureFileDir();
      try {
        return readdirSync(FILE_DIR)
          .filter((f) => f.endsWith(".json"))
          .map((f) => f.slice(0, -5))
          .filter((k) => k.startsWith(prefix.replace(/[^a-zA-Z0-9._-]/g, "_")))
          .slice(0, limit);
      } catch {
        return [];
      }
    }
    default:
      return [...memoryStore.keys()]
        .filter((k) => k.startsWith(prefix))
        .slice(0, limit);
  }
}

/* -------------------------------------------------------------------------- */
/* JSON helpers                                                                 */
/* -------------------------------------------------------------------------- */

export async function kvGetJson<T>(key: string): Promise<T | null> {
  const raw = await kvGet(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function kvSetJson(
  key: string,
  value: unknown,
  options: { ttlSeconds?: number } = {}
): Promise<void> {
  await kvSet(key, JSON.stringify(value), options);
}
