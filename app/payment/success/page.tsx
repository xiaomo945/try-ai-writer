import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment Successful — Use AI Writer",
  description: "Thank you for upgrading! Your account has been upgraded.",
};

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950 px-4">
      <div className="card max-w-md w-full p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-10 h-10 text-emerald-600"
            >
              <path d="M20 6L9 17l-5-5" className="animate-draw" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white mb-3">
          Thank You for Upgrading!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Your account has been upgraded. Start writing with Claude now.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/dashboard" className="btn-primary w-full">
            Go to Dashboard
          </Link>
          <Link href="/write" className="btn-outline w-full">
            Start Writing
          </Link>
        </div>
      </div>
    </main>
  );
}