"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ConsentValue = "granted" | "denied" | null;

const STORAGE_KEY = "ad-consent";

interface ConsentContextValue {
  consent: ConsentValue;
  setConsent: (value: "granted" | "denied") => void;
}

const ConsentContext = createContext<ConsentContextValue>({
  consent: null,
  setConsent: () => {},
});

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsentState] = useState<ConsentValue>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ConsentValue;
      if (stored === "granted" || stored === "denied") {
        setConsentState(stored);
      }
    } catch {
      // localStorage unavailable (private mode) — treat as undecided.
    }
  }, []);

  const setConsent = (value: "granted" | "denied") => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore
    }
    setConsentState(value);
    // Let other tabs / late-mounted slots react.
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("ad-consent-change"));
    }
  };

  return (
    <ConsentContext.Provider value={{ consent, setConsent }}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  return useContext(ConsentContext);
}
