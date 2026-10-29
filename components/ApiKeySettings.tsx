"use client";

import { useEffect, useState } from "react";
import { KeyRound, X, Check, Trash2 } from "lucide-react";
import {
  getByok,
  setByok,
  clearByok,
  type ByokProvider,
} from "@/lib/byok";

/**
 * Compact BYOK settings control. The key is stored only in the user's browser
 * (localStorage) and sent per-request — never persisted server-side.
 */
export function ApiKeySettings() {
  const [open, setOpen] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [provider, setProvider] = useState<ByokProvider>("deepseek");
  const [keyInput, setKeyInput] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => {
      const cfg = getByok();
      setHasKey(!!cfg);
      if (cfg) setProvider(cfg.provider);
    };
    sync();
    window.addEventListener("byok-change", sync);
    return () => window.removeEventListener("byok-change", sync);
  }, []);

  const save = () => {
    if (keyInput.trim().length < 10) return;
    setByok(provider, keyInput.trim());
    setKeyInput("");
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const remove = () => {
    clearByok();
    setKeyInput("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:border-emerald-500/60 transition-colors"
        title="Use your own AI API key (stored in your browser only)"
      >
        <KeyRound className="w-4 h-4" />
        API Key
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            hasKey ? "bg-emerald-500" : "bg-slate-400"
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 z-50 w-80 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 shadow-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Your AI API key
            </h3>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
            Stored only in this browser and sent per request. The site never
            stores it. DeepSeek keys are cheap; Claude keys are stronger.
          </p>

          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as ByokProvider)}
            className="w-full mb-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
          >
            <option value="deepseek">DeepSeek (api.deepseek.com)</option>
            <option value="claude">Claude / Anthropic</option>
          </select>

          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            API key
          </label>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder={provider === "claude" ? "sk-ant-..." : "sk-..."}
            className="w-full mb-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={save}
              disabled={keyInput.trim().length < 10}
              className="btn-primary text-sm min-h-[40px] px-4 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saved ? (
                <span className="inline-flex items-center gap-1">
                  <Check className="w-4 h-4" /> Saved
                </span>
              ) : (
                "Save key"
              )}
            </button>
            {hasKey && (
              <button
                onClick={remove}
                className="btn-outline text-sm min-h-[40px] px-3"
                title="Remove saved key"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
