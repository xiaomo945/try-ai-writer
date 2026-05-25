"use client";

import Link from "next/link";
import { ScrollReveal } from "./ScrollReveal";

export function SocialProofWall() {
  return (
    <ScrollReveal>
      <section className="w-full py-12 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* Featured on Product Hunt */}
            <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
              <div className="mb-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full">
                  <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-sm font-semibold text-orange-700">Product Hunt</span>
                </div>
              </div>
              <p className="text-sm text-slate-500">Featured on #1</p>
              <p className="text-slate-900 font-semibold text-lg mt-1">Launch Day</p>
            </div>

            {/* Trusted by creators */}
            <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
              <div className="flex items-center -space-x-2 mb-3">
                {["bg-emerald-400", "bg-blue-400", "bg-purple-400", "bg-pink-400", "bg-amber-400"].map((color, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full ${color} border-2 border-white flex items-center justify-center`}
                  >
                    <span className="text-white text-xs font-bold">{String.fromCharCode(65 + i)}</span>
                  </div>
                ))}
              </div>
              <p className="text-2xl font-bold text-slate-900">500+</p>
              <p className="text-sm text-slate-500 mt-1">Trusted by creators worldwide</p>
            </div>

            {/* Rating */}
            <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-2xl font-bold text-slate-900">4.9/5</p>
              <p className="text-sm text-slate-500 mt-1">from 120+ reviews</p>
            </div>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
