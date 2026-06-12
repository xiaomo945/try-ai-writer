/**
 * Structured logger utility.
 * In production, console.log is suppressed; only warn/error are emitted.
 * In development, all levels are visible.
 */

const isProduction = process.env.NODE_ENV === "production";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  module: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

function format(entry: LogEntry): string {
  return `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.module}] ${entry.message}`;
}

function createLogger(module: string) {
  function log(level: LogLevel, message: string, data?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      module,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    const formatted = format(entry);

    switch (level) {
      case "debug":
        if (!isProduction) console.debug(formatted, data ?? "");
        break;
      case "info":
        if (!isProduction) console.log(formatted, data ?? "");
        break;
      case "warn":
        console.warn(formatted, data ?? "");
        break;
      case "error":
        console.error(formatted, data ? JSON.stringify(data) : "");
        break;
    }
  }

  return {
    debug: (msg: string, data?: Record<string, unknown>) => log("debug", msg, data),
    info: (msg: string, data?: Record<string, unknown>) => log("info", msg, data),
    warn: (msg: string, data?: Record<string, unknown>) => log("warn", msg, data),
    error: (msg: string, data?: Record<string, unknown>) => log("error", msg, data),
  };
}

export { createLogger };
export type { LogLevel, LogEntry };