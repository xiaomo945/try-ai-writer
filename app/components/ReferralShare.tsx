"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Share2, Twitter } from "lucide-react";
import { initializeReferral, getReferralLink, REFERRAL_REWARDS } from "@/lib/referral";
import { useToast } from "./ToastContainer";

export function ReferralShare() {
  const [referralData, setReferralData] = useState<any>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const data = initializeReferral();
    setReferralData(data);
  }, []);

  if (!referralData) return null;

  const referralLink = getReferralLink(referralData.referralCode);
  const referralsCount = referralData.referrals?.length || 0;
  const progress = Math.min((referralsCount / REFERRAL_REWARDS.milestone.threshold) * 100, 100);

  const copyToClipboard = async (text: string, type: "link" | "code") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "link") {
        setLinkCopied(true);
        addToast("Referral link copied to clipboard!", "success");
        setTimeout(() => setLinkCopied(false), 2000);
      } else {
        setCodeCopied(true);
        addToast("Referral code copied to clipboard!", "success");
        setTimeout(() => setCodeCopied(false), 2000);
      }
    } catch (e) {
      addToast("Failed to copy to clipboard", "error");
    }
  };

  const shareOnTwitter = () => {
    const text = "I've been using Use AI Writer to write content faster in my own voice! Join me and get 5 extra free generations: ";
    const url = encodeURIComponent(referralLink);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`;
    window.open(twitterUrl, "_blank", "noopener noreferrer");
  };

  return (
    <div className="card bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <Share2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">
            Invite Friends & Earn Rewards! 🎁
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Share Use AI Writer and get Pro access for free!
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
          <span>Progress to 1 month Pro</span>
          <span className="font-semibold text-purple-600 dark:text-purple-400">
            {referralsCount}/{REFERRAL_REWARDS.milestone.threshold} referrals
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-slate-200 dark:border-gray-800">
          <div className="text-2xl font-display font-bold text-purple-600 dark:text-purple-400">
            +{REFERRAL_REWARDS.perReferral.proDays}d
          </div>
          <div className="text-xs text-slate-500">Pro access per referral</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-slate-200 dark:border-gray-800">
          <div className="text-2xl font-display font-bold text-blue-600 dark:text-blue-400">
            +{REFERRAL_REWARDS.milestone.proDays}d
          </div>
          <div className="text-xs text-slate-500">Bonus at {REFERRAL_REWARDS.milestone.threshold} referrals</div>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
          Your Referral Code
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-center font-mono text-xl font-semibold text-slate-800 dark:text-slate-200 tracking-widest">
            {referralData.referralCode}
          </div>
          <button
            onClick={() => copyToClipboard(referralData.referralCode, "code")}
            className="btn-outline min-h-[44px] px-4"
          >
            {codeCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
          Your Referral Link
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 bg-slate-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-gray-700"
          />
          <button
            onClick={() => copyToClipboard(referralLink, "link")}
            className="btn-primary min-h-[44px] px-4"
          >
            {linkCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={shareOnTwitter}
          className="flex-1 btn-primary min-h-[44px] flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600"
        >
          <Twitter className="w-5 h-5" />
          Share on Twitter
        </button>
      </div>
    </div>
  );
}
