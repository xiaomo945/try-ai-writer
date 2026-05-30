"use client";

import { useState } from "react";
import { creditPackages, useCredits } from "@/lib/credits";
import Link from "next/link";
import Logo from "@/app/components/Logo";
import { Loader2 } from "lucide-react";

export default function CreditsPurchasePage() {
  const { addPoints } = useCredits();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (pkg: (typeof creditPackages)[0]) => {
    // 如果是在开发/测试环境，直接添加点数
    if (process.env.NODE_ENV === "development") {
      addPoints(pkg.credits);
      alert(`Test mode: Added ${pkg.credits} credits!`);
      return;
    }

    setLoading(pkg.id);
    
    try {
      // 调用支付 API
      const response = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          plan: `credits-${pkg.id}`,
          credits: pkg.credits,
          price: pkg.price
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Payment failed (${response.status})`);
      }

      const data = await response.json();
      
      // 检查返回的 checkout URL
      if (!data.url) {
        throw new Error("No checkout URL returned from payment provider");
      }
      
      // 跳转到支付页面
      window.location.href = data.url;
      
    } catch (error) {
      console.error("Purchase error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to start payment";
      alert(`Payment Error: ${errorMessage}\n\nPlease try again or contact support.`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-gray-950 dark:to-gray-900">
      <header className="border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-emerald-600 font-display text-xl">
            <Logo size={32} />
            Use <span className="font-extrabold">AI Writer</span>
          </Link>
          <Link href="/pricing" className="btn-outline text-sm px-4 py-2">
            Back to Pricing
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-extrabold text-slate-900 dark:text-white mb-4">
            💎 Buy Credits
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Get extra credits for Claude generations and file uploads
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`card relative ${pkg.id === "medium" ? "scale-105 border-emerald-300 shadow-lg" : ""}`}
            >
              {pkg.id === "medium" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-1 rounded-full text-white text-sm font-semibold shadow-md">
                  Most Popular
                </div>
              )}
              <div className="pt-4">
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2">
                  {pkg.id === "small" ? "Starter" : pkg.id === "medium" ? "Pro" : "Enterprise"}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    ${pkg.price}
                  </span>
                </div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-6">
                  {pkg.credits} Credits
                </p>
                <ul className="text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
                  <li>• {pkg.credits} DeepSeek generations</li>
                  <li>• {Math.floor(pkg.credits / 5)} Claude generations</li>
                  <li>• {Math.floor(pkg.credits / 3)} file uploads</li>
                </ul>
                <button
                  onClick={() => handlePurchase(pkg)}
                  disabled={loading !== null}
                  className={`w-full min-h-[48px] flex items-center justify-center rounded-xl font-semibold transition-all duration-300 ${
                    pkg.id === "medium"
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-1"
                      : "btn-primary"
                  } ${loading !== null ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loading === pkg.id ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Buy Now"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
