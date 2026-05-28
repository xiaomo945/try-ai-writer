"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle } from "lucide-react";

export function WaitlistSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    
    // Simulate API call for now
    setTimeout(() => {
      setStatus("success");
      setMessage("Thanks! You're on the list. We'll notify you when we launch!");
      setEmail("");
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass-card p-8 sm:p-10">
        <div className="text-center mb-8">
          <h3 className="text-2xl sm:text-3xl font-display font-extrabold mb-3">Get Launch Updates & AI Writing Tips</h3>
          <p className="text-slate-400">Get notified when we launch on Product Hunt — plus weekly AI writing tips.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {status === "success" ? (
            <div className="flex items-center justify-center gap-3 text-emerald-400 bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4">
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium">{message}</span>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 px-5 py-3 bg-obsidian-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 min-h-[48px]"
                  disabled={status === "loading"}
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="btn-primary min-h-[48px] px-6 py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? "Signing up..." : "Join Waitlist"}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              {status === "error" && (
                <p className="text-red-400 text-sm text-center">{message}</p>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
}
