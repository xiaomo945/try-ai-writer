/**
 * Contextual affiliate offers.
 *
 * For a brand-new site with almost no traffic, contextual affiliate links
 * (high-RPM, no minimum-traffic requirement) monetize far better than display
 * ads, which need volume to earn anything. This module is the operator's
 * editable list — flip `enabled` and set real `href`s (your affiliate IDs).
 *
 * Display ads (AdSlot) layer on top once traffic + AdSense approval arrive.
 */

export interface AffiliateItem {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  /** Where the card may appear: "tools" | "blog" | "home" | "sidebar". */
  placement: string[];
  enabled: boolean;
}

export const AFFILIATES: AffiliateItem[] = [
  {
    id: "example-ai-writing-assistant",
    title: "Example: Your favorite AI writing assistant",
    description:
      "Replace this with a real affiliate product. Contextual offers about writing, productivity, or hosting convert best on a writing tool.",
    href: "https://example.com/?ref=YOUR_AFFILIATE_ID",
    cta: "Check it out",
    placement: ["tools", "blog", "home"],
    enabled: false,
  },
];

export function getAffiliates(placement: string): AffiliateItem[] {
  return AFFILIATES.filter(
    (a) => a.enabled && a.placement.includes(placement)
  );
}
