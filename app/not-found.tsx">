"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-6 py-24 max-w-lg mx-auto">
        {/* Big 404 */}
        <h1 className="text-8xl md:text-9xl font-display font-bold text-slate-200 mb-4">
          404
        </h1>

        {/* Headline */}
        <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
          Page not found
        </h2>

        {/* Subhead */}
        <p className="text-lg text-slate-500 mb-10 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          No worries—let's get you back on track!
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/"
            className="btn-primary w-full sm:w-auto px-10 py-4 text-base"
          >
            Back to Home
          </Link>
          <Link
            href="/write"
            className="btn-outline w-full sm:w-auto px-10 py-4 text-base"
          >
            Start Writing
          </Link>
        </div>

        {/* Useful Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Looking for inspiration?</span>
            <Link href="/blog" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Visit our blog
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Pricing questions?</span>
            <Link href="/pricing" className="text-emerald-600 hover:text-emerald-700 font-medium">
              View pricing
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
