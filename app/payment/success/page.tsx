"use client";

import { useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import Logo from "@/app/components/Logo";
import { trackEvent, trackFunnelStep } from "@/lib/analytics";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const plan = searchParams.get("plan") || "unknown";
    
    // Track payment success
    trackEvent("payment_success", "conversion", { plan });
    trackFunnelStep("payment", "payment_success", 3, "anonymous", { plan });
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-obsidian-950 text-white flex flex-col items-center justify-center px-4 sm:px-6">
      <Link href="/" className="mb-12">
        <Logo size={48} />
      </Link>
      
      <div className="max-w-md w-full text-center">
        <CheckCircle className="w-24 h-24 text-emerald-500 mx-auto mb-8" />
        
        <h1 className="text-4xl sm:text-5xl font-display font-extrabold mb-4">
          Payment Successful! 🎉
        </h1>
        
        <p className="text-lg text-slate-400 mb-10">
          Thank you for upgrading! Your credits have been added to your account.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard" className="btn-primary text-base flex-1">
            Go to Dashboard
          </Link>
          <Link href="/write" className="btn-outline text-base flex-1">
            Start Writing
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-white">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
