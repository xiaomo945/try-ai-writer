"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Share2, Twitter, Users } from "lucide-react";
import { initializeReferral, getReferralLink, REFERRAL_REWARDS } from "@/lib/referral-client";
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
    const text = `I'm using @TryAIWriter to write better content with AI. It learns my brand voice and saves me hours. Try it free: ${referralLink}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, "_blank", "noopener noreferrer");
  };

  return (
    <div className="card bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-gray-950 border-emerald-200 dark:border-emerald-800">
      <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 rounded-xl p-4 mb-4 text-center border border-emerald-200 dark:border-emerald-800/50">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Users className="w-5 h-5 text-emerald-600" />
          <span className="text-lg font-display font-bold text-emerald-700 dark:text-emerald-400">
            邀请好友，双方各得3天Pro
          </span>
        </div>
        <p className="text-sm text-emerald-600/80 dark:text-emerald-400/70">
          邀请满5人，你额外获得1个月Pro
        </p>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
          <span className="flex items-center gap-1">
            <Share2 className="w-4 h-4" /> 已邀请 {referralsCount}/5 人
          </span>
          {referralsCount >= 5 && (
            <span className="text-emerald-600 font-semibold">🎉 恭喜！你已获得1个月Pro</span>
          )}
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800/50">
          <div className="text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400">
            +{REFERRAL_REWARDS.perReferral.proDays}天
          </div>
          <div className="text-xs text-slate-500">每次邀请双方各得</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800/50">
          <div className="text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400">
            +{REFERRAL_REWARDS.milestone.proDays}天
          </div>
          <div className="text-xs text-slate-500">满5人额外奖励</div>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
          你的邀请链接
        </label>
        <button
          onClick={() => copyToClipboard(referralLink, "link")}
          className="w-full btn-primary min-h-[48px] flex items-center justify-center gap-2 text-base"
        >
          {linkCopied ? (
            <>
              <Check className="w-5 h-5" /> 已复制！
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" /> 复制邀请链接
            </>
          )}
        </button>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
          邀请码
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-center font-mono text-lg font-semibold text-slate-800 dark:text-slate-200 tracking-widest">
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

      <div className="flex gap-3">
        <button
          onClick={shareOnTwitter}
          className="flex-1 bg-gray-900 dark:bg-black hover:bg-gray-700 dark:hover:bg-gray-800 text-white min-h-[44px] flex items-center justify-center gap-2 rounded-xl font-medium transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          分享到 X
        </button>
      </div>
    </div>
  );
}
