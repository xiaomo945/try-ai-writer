"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Copy, CheckCircle2, Download, Users, DollarSign, TrendingUp, Gift } from "lucide-react";

export default function AffiliateDashboard() {
  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [successfulSubs, setSuccessfulSubs] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = "demo-user";
    fetch(`/api/referral/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
      .then((r) => r.json())
      .then((data) => {
        setReferralCode(data.referralCode || "");
        setReferralLink(data.referralLink || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch(`/api/referral/stats?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        setReferralCount(data.referralCount || 0);
        setSuccessfulSubs(data.successfulSubscriptions || 0);
      })
      .catch(() => {});
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Affiliate Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Share Try AI Writer and earn rewards</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
            <Users className="h-6 w-6 text-emerald-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{referralCount}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Referrals</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
            <DollarSign className="h-6 w-6 text-emerald-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{successfulSubs}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Conversions</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
            <TrendingUp className="h-6 w-6 text-emerald-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">20%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Commission Rate</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Referral Link</h2>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={referralLink}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Code: {referralCode}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Promotional Materials</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 transition-colors">
              <Download className="h-5 w-5 text-emerald-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">Social Media Kit</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Ready-to-share graphics</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 transition-colors">
              <Gift className="h-5 w-5 text-emerald-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">Email Templates</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pre-written copy</p>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="text-sm text-emerald-600 hover:underline font-medium">
              Home
            </Link>
            <Link href="/pricing" className="text-sm text-emerald-600 hover:underline font-medium">
              Pricing
            </Link>
            <Link href="/free-trial" className="text-sm text-emerald-600 hover:underline font-medium">
              Free Trial
            </Link>
            <Link href="/write" className="text-sm text-emerald-600 hover:underline font-medium">
              Try AI Writer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
