"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "@/app/components/Logo";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export function NavWrapper() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-obsidian-950/80 backdrop-blur-2xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={32} />
          <span className="text-lg font-display font-extrabold text-white">
            Try AI<span className="text-emerald-400">Writer</span>
          </span>
        </Link>
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/write" className="text-slate-300 hover:text-white transition-colors">Write</Link>
          <Link href="/templates" className="text-slate-300 hover:text-white transition-colors">Templates</Link>
          <Link href="/interview" className="text-slate-300 hover:text-white transition-colors">Interview</Link>
          <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</Link>
          <Link href="/blog" className="text-slate-300 hover:text-white transition-colors">Blog</Link>
          <ThemeToggle />
          {session ? (
            <>
              <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">Dashboard</Link>
              <div className="flex items-center gap-3">
                {session.user?.image ? (
                  <img src={session.user.image} alt={session.user.name || 'User'} className="w-8 h-8 rounded-full border-2 border-white/20" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                    {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="text-white text-sm font-medium">{session.user?.name || 'User'}</span>
              </div>
              <Link href="/write" className="btn-primary !min-h-[40px] !px-5 !py-2 !text-sm">Write Now</Link>
            </>
          ) : (
            <>
              <Link href="/write" className="btn-primary !min-h-[40px] !px-5 !py-2 !text-sm">Try Free</Link>
              <Link href="/login" className="btn-outline !min-h-[40px] !px-5 !py-2 !text-sm">Sign In</Link>
            </>
          )}
        </div>
        {/* Mobile burger */}
        <button
          className="md:hidden text-slate-300 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-obsidian-950/95 backdrop-blur-2xl border-b border-white/5">
          <div className="flex flex-col gap-4 px-6 py-6">
            <Link href="/write" className="text-slate-300 hover:text-white transition-colors text-lg" onClick={() => setMobileMenuOpen(false)}>Write</Link>
            <Link href="/templates" className="text-slate-300 hover:text-white transition-colors text-lg" onClick={() => setMobileMenuOpen(false)}>Templates</Link>
            <Link href="/interview" className="text-slate-300 hover:text-white transition-colors text-lg" onClick={() => setMobileMenuOpen(false)}>Interview</Link>
            <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors text-lg" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
            <Link href="/blog" className="text-slate-300 hover:text-white transition-colors text-lg" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
            <div className="flex items-center justify-center py-2"><ThemeToggle /></div>
            {session ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-lg">
                  {session.user?.image ? (
                    <img src={session.user.image} alt={session.user.name || 'User'} className="w-10 h-10 rounded-full border-2 border-white/20" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold">
                      {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-white text-base font-medium">{session.user?.name || 'User'}</span>
                    <span className="text-emerald-400 text-xs">Signed in</span>
                  </div>
                </div>
                <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors text-lg" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                <Link href="/write" className="btn-primary w-full text-center" onClick={() => setMobileMenuOpen(false)}>Write Now</Link>
              </>
            ) : (
              <>
                <Link href="/write" className="btn-primary w-full text-center" onClick={() => setMobileMenuOpen(false)}>Try Free</Link>
                <Link href="/login" className="btn-outline w-full text-center" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}