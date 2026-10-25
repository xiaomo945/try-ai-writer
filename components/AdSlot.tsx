"use client";

import { useEffect, useRef, useState } from "react";
import { AD_SLOTS, type AdNetwork } from "@/lib/ads";
import { useConsent } from "./ConsentProvider";

function detectNetwork(): AdNetwork {
  if (process.env.NEXT_PUBLIC_ADSENSE_CLIENT) return "adsense";
  if (process.env.NEXT_PUBLIC_MONETAG_ZONE) return "monetag";
  if (process.env.NEXT_PUBLIC_ADSTERRA_ZONE) return "adsterra";
  return "none";
}

function adsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
}

let adsenseInjected = false;
function injectAdsense(client: string) {
  if (adsenseInjected || typeof document === "undefined") return;
  if (document.querySelector('script[src*="adsbygoogle.js"]')) {
    adsenseInjected = true;
    return;
  }
  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
  document.head.appendChild(s);
  adsenseInjected = true;
}

/**
 * A consent-gated, CLS-safe, lazy display-ad slot.
 *
 * - Reserves space via the slot's min-height so the page never jumps (CLS).
 * - Only mounts the real ad when scrolled into view (IntersectionObserver).
 * - Only renders after the user grants cookie consent.
 * - If ads are disabled or no network is configured, it shows a labeled
 *   placeholder instead of an empty/broken box.
 */
export function AdSlot({
  slot,
  className = "",
}: {
  slot: string;
  className?: string;
}) {
  const spec = AD_SLOTS[slot] ?? { minHeight: 100, label: "Advertisement" };
  const { consent } = useConsent();
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!ref.current || inView) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [inView]);

  const net = detectNetwork();
  const enabled = adsEnabled();
  const showAd = enabled && consent === "granted" && inView && net !== "none";

  useEffect(() => {
    if (showAd && net === "adsense" && process.env.NEXT_PUBLIC_ADSENSE_CLIENT) {
      injectAdsense(process.env.NEXT_PUBLIC_ADSENSE_CLIENT);
    }
  }, [showAd, net]);

  return (
    <div
      ref={ref}
      className={`ad-slot ${className}`}
      style={{ minHeight: spec.minHeight }}
      aria-label="Advertisement"
    >
      <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
        {spec.label ?? "Advertisement"}
      </span>

      {!showAd && (
        <div
          className="flex items-center justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600 text-xs text-center px-3"
          style={{ height: Math.max(spec.minHeight - 20, 40) }}
        >
          {!enabled
            ? "Ad space — set NEXT_PUBLIC_ADS_ENABLED=true"
            : consent !== "granted"
              ? "Accept cookies to view ads"
              : net === "none"
                ? "Advertisement"
                : "Loading…"}
        </div>
      )}

      {showAd && net === "adsense" && !failed && (
        <AdsenseUnit slot={slot} />
      )}
      {showAd && net === "monetag" && !failed && (
        <MonetagUnit zone={process.env.NEXT_PUBLIC_MONETAG_ZONE!} onError={() => setFailed(true)} />
      )}
      {showAd && net === "adsterra" && !failed && (
        <AdsterraUnit zone={process.env.NEXT_PUBLIC_ADSTERRA_ZONE!} onError={() => setFailed(true)} />
      )}
      {showAd && failed && (
        <div className="text-xs text-slate-400">Ad unavailable</div>
      )}
    </div>
  );
}

function AdsenseUnit({ slot }: { slot: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slotId = process.env[`NEXT_PUBLIC_ADSENSE_SLOT_${slot.toUpperCase()}`];

  useEffect(() => {
    if (!slotId) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch {
      // ignore push errors (e.g. before script loads)
    }
  }, [slotId]);

  if (!slotId) {
    return (
      <div className="text-xs text-amber-500">
        Missing slot id for “{slot}” (set NEXT_PUBLIC_ADSENSE_SLOT_{slot.toUpperCase()})
      </div>
    );
  }

  return (
    <ins
      className="adsbygoogle block"
      style={{ display: "block" }}
      data-ad-client={client}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

/**
 * Bridge-network units (Monetag / Adsterra). Used only before AdSense is
 * approved — they have no minimum-traffic requirement. Paste the exact snippet
 * from your dashboard into the network console if these defaults do not match
 * your ad type. Scripts are injected only after consent.
 */
function MonetagUnit({
  zone,
  onError,
}: {
  zone: string;
  onError: () => void;
}) {
  useEffect(() => {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://results.monetag.com/tag/${zone}.js`;
    s.onerror = onError;
    document.body.appendChild(s);
  }, [zone]);
  return <div className="monetag-unit w-full" />;
}

function AdsterraUnit({
  zone,
  onError,
}: {
  zone: string;
  onError: () => void;
}) {
  useEffect(() => {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://ss1.adsterra.com/script/${zone}.js`;
    s.onerror = onError;
    document.body.appendChild(s);
  }, [zone]);
  return <div className="adsterra-unit w-full" />;
}
