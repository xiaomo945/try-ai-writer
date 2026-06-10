import { describe, it, expect } from "vitest";
import { getReferralLink, findReferrerByCode, createReferralRecord, trackReferralConversion } from "@/lib/referral";

describe("referral (server-side)", () => {
  it("should create a referral record", () => {
    const record = createReferralRecord("user-test-1");
    expect(record.userId).toBe("user-test-1");
    expect(record.code).toMatch(/^REF-[A-Z0-9]{6}$/);
    expect(record.referralCount).toBe(0);
  });

  it("should return existing record on duplicate create", () => {
    const first = createReferralRecord("user-test-2");
    const second = createReferralRecord("user-test-2");
    expect(second.code).toBe(first.code);
  });

  it("should generate valid referral links", () => {
    const link = getReferralLink("REF-ABC123", "https://tryaiwriter.com");
    expect(link).toBe("https://tryaiwriter.com/?ref=REF-ABC123");
  });

  it("should find referrer by code", () => {
    const record = createReferralRecord("user-test-3");
    const found = findReferrerByCode(record.code);
    expect(found).not.toBeNull();
    expect(found?.userId).toBe("user-test-3");
  });

  it("should track referral conversion", () => {
    const referrer = createReferralRecord("user-test-referrer");
    const result = trackReferralConversion("user-test-new", referrer.code);

    expect(result.referrerId).toBe("user-test-referrer");
    expect(result.rewards).not.toBeNull();
    expect(result.rewards?.referrerReward.proDays).toBe(3);
    expect(result.rewards?.refereeReward.extraGenerations).toBe(5);
  });

  it("should return null for invalid referral code", () => {
    const result = trackReferralConversion("user-test-bad", "REF-INVALID");
    expect(result.referrerId).toBeNull();
    expect(result.rewards).toBeNull();
  });
});