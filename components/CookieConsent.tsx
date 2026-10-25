"use client";

import { useEffect, useState } from "react";
import { useConsent } from "./ConsentProvider";

/**
 * Minimal cookie/consent banner. Only shows when the user has not yet decided.
 * AdSense and GDPR/ePrivacy require consent before loading ad scripts.
 */
export function CookieConsent() {
  const { consent, setConsent } = useConsent();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  if (consent !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 pointer-events-none">
      <div className="max-w-3xl mx-auto pointer-events-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 shadow-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 flex-1">
          We use cookies to show relevant ads and analyze traffic. Accept to
          support this free writing tool — no account required.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setConsent("denied")}
            className="btn-outline text-sm min-h-[40px] px-4"
          >
            Decline
          </button>
          <button
            onClick={() => setConsent("granted")}
            className="btn-primary text-sm min-h-[40px] px-4"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
