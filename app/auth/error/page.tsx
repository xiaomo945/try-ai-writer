"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-display font-extrabold text-slate-900 mb-4">
          Sign In Failed
        </h1>
        
        <p className="text-lg text-slate-500 mb-8">
          We couldn&apos;t sign you in with Google. This might be because you cancelled the request or there was a connection issue.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-500/25"
          >
            Try Again
          </Link>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full py-4 text-slate-600 font-medium hover:text-slate-900 transition-colors duration-200"
          >
            Back to Home
          </Link>
          <p className="text-sm text-slate-500">
            Want to skip signing in?{" "}
            <Link href="/free-trial" className="text-emerald-600 hover:underline font-medium">
              Try it free →
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}