/**
 * Ad configuration.
 *
 * The site is monetized with display ads. To stay policy-compliant (Google
 * AdSense, GDPR/ePrivacy) and CLS-safe, ads are:
 *   - consent-gated  (only render after the user accepts cookies),
 *   - lazy           (only mount when scrolled into view),
 *   - space-reserved (each slot reserves min-height so layout never shifts).
 *
 * All values are public env vars, so they are safe to read on the client.
 *
 * Network priority (auto-selected): AdSense  >  Monetag  >  Adsterra.
 * Ads are OFF until NEXT_PUBLIC_ADS_ENABLED=true AND a network is configured,
 * so the site never shows empty/broken boxes in dev or before approval.
 */

export type AdNetwork = "adsense" | "monetag" | "adsterra" | "none";

export interface SlotSpec {
  /** Reserved vertical space (px) to prevent Cumulative Layout Shift. */
  minHeight: number;
  /** Optional fixed desktop width; undefined = fluid/responsive. */
  width?: number;
  /** Label shown above the unit (ad policies require ads to be identifiable). */
  label?: string;
}

/** Logical slot ids -> reserved dimensions. Reuse these in <AdSlot slot="..." />. */
export const AD_SLOTS: Record<string, SlotSpec> = {
  banner_top: { minHeight: 100, width: 728, label: "Advertisement" },
  banner_bottom: { minHeight: 100, width: 728, label: "Advertisement" },
  inarticle: { minHeight: 280, width: 336, label: "Advertisement" },
  native: { minHeight: 220, label: "Sponsored" },
  sidebar: { minHeight: 600, width: 300, label: "Advertisement" },
};

export interface AdConfig {
  enabled: boolean;
  network: AdNetwork;
  adsenseClient?: string;
  /** logical slot id -> AdSense ad slot id */
  adsenseSlots: Record<string, string>;
  monetagZone?: string;
  adsterraZone?: string;
  affiliateEnabled: boolean;
}

export function getAdConfig(): AdConfig {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const monetagZone = process.env.NEXT_PUBLIC_MONETAG_ZONE;
  const adsterraZone = process.env.NEXT_PUBLIC_ADSTERRA_ZONE;

  let network: AdNetwork = "none";
  if (adsenseClient) network = "adsense";
  else if (monetagZone) network = "monetag";
  else if (adsterraZone) network = "adsterra";

  const enabled =
    process.env.NEXT_PUBLIC_ADS_ENABLED === "true" && network !== "none";

  const adsenseSlots: Record<string, string> = {};
  for (const slot of Object.keys(AD_SLOTS)) {
    const id = process.env[`NEXT_PUBLIC_ADSENSE_SLOT_${slot.toUpperCase()}`];
    if (id) adsenseSlots[slot] = id;
  }

  return {
    enabled,
    network,
    adsenseClient,
    adsenseSlots,
    monetagZone,
    adsterraZone,
    affiliateEnabled: process.env.NEXT_PUBLIC_AFFILIATE_ENABLED !== "false",
  };
}
