'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

export default function PaymentPendingPage() {
  useEffect(() => {
    // Track payment pending page view
    trackEvent('payment_pending_view', 'engagement');
  }, []);

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-10 h-10 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-display font-extrabold text-slate-900 mb-4">
          Payment Coming Soon
        </h1>
        
        <p className="text-lg text-slate-500 mb-8">
          We're finalizing our payment system. Your subscription will be available shortly.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center w-full py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-500/25"
          >
            Back to Pricing
          </Link>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full py-4 text-slate-600 font-medium hover:text-slate-900 transition-colors duration-200"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}