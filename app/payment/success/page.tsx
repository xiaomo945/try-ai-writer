"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import Logo from "@/app/components/Logo";

export default function PaymentSuccessPage() {
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
