"use client";
import { Zap, Brain, Shield, Sparkles, ArrowRight, ChevronDown, Check, Star, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Logo from "@/app/components/Logo";
import DemoAnimation from "@/app/components/DemoAnimation";
import { Testimonials } from "@/app/components/Testimonials";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="flex flex-col items-center w-full bg-obsidian-950 text-white min-h-screen">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-obsidian-950/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-lg font-display font-extrabold text-white">Use AI<span className="text-blue-400">Writer</span></span>
          </Link>
          {/* 桌面端导航 */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link href="/write" className="text-slate-300 hover:text-white transition-colors">Write</Link>
            <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</Link>
            <Link href="/blog" className="text-slate-300 hover:text-white transition-colors">Blog</Link>
            <Link href="/login" className="btn-primary !min-h-[40px] !px-5 !py-2 !text-sm">Start Writing</Link>
          </div>
          {/* 移动端汉堡菜单 */}
          <button 
            className="md:hidden text-slate-300 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {/* 移动端下拉菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-obsidian-950/95 backdrop-blur-2xl border-b border-white/5">
            <div className="flex flex-col gap-4 px-6 py-6">
              <Link href="/write" className="text-slate-300 hover:text-white transition-colors text-lg" onClick={() => setMobileMenuOpen(false)}>Write</Link>
              <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors text-lg" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
              <Link href="/blog" className="text-slate-300 hover:text-white transition-colors text-lg" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
              <Link href="/login" className="btn-primary w-full text-center" onClick={() => setMobileMenuOpen(false)}>Start Writing Free</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero区 — 左右分栏 */}
      <section className="section-container section-spacing pt-32 md:pt-40">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="flex flex-col items-start">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-extrabold leading-tight" style={{textShadow: "0 0 100px rgba(91,156,245,0.3)"}}>
              Your Thoughts,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Amplified.
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-slate-400 mt-6 max-w-lg leading-relaxed">
              The AI that learns your brand voice, not just your prompts. Write better, faster, cheaper — meet Use AI Writer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
              <Link href="/login" className="btn-primary text-base sm:text-lg w-full sm:w-auto text-center">
                Start Writing Free <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/pricing" className="btn-outline text-base sm:text-lg w-full sm:w-auto text-center">
                See Pricing
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-white/5">
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-obsidian-950" />
                ))}
              </div>
              <p className="text-sm text-slate-400"><span className="text-white font-semibold">500+</span> creators already writing</p>
            </div>
          </div>
          <div className="hidden lg:flex justify-center">
            <div className="w-full max-w-lg glass-card p-6">
              <DemoAnimation />
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-16"><ChevronDown className="w-6 h-6 text-slate-600 animate-bounce" /></div>
      </section>

      {/* 社会证明条 */}
      <section className="section-container py-12">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-16 text-slate-500 text-sm">
          <span className="text-slate-400 font-medium">Trusted by creators from</span>
          <span className="text-white font-semibold">Product Hunt</span>
          <span className="text-white font-semibold">Reddit</span>
          <span className="text-white font-semibold">Twitter/X</span>
          <span className="text-white font-semibold">Indie Hackers</span>
        </div>
      </section>

      {/* Bento Grid 功能展示 */}
      <section className="section-container section-spacing">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold">
            Everything you need to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">write better.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400 mt-4 max-w-2xl mx-auto">Powerful features packed in a minimalist interface. No clutter, just results.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">
          <div className="glass-card-blue md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-5"><Zap className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" /></div>
              <h3 className="text-xl sm:text-2xl font-display font-bold mb-3">Generate in 30 Seconds</h3>
              <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-lg">From prompt to polished draft faster than brewing coffee. Claude-powered quality, DeepSeek speed.</p>
            </div>
            <div className="mt-6 flex items-center gap-4"><span className="text-4xl sm:text-5xl font-display font-extrabold text-blue-400">30s</span><span className="text-slate-500 text-sm">average time<br/>to first draft</span></div>
          </div>
          <div className="glass-card-purple flex flex-col">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4"><Brain className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" /></div>
            <h3 className="text-lg sm:text-xl font-display font-bold mb-2">Brand Voice Learning</h3>
            <p className="text-slate-400 leading-relaxed text-sm sm:text-base">Remembers your tone, style, and phrases. Writes like you, not a robot.</p>
          </div>
          <div className="glass-card-emerald flex flex-col">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4"><Shield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" /></div>
            <h3 className="text-lg sm:text-xl font-display font-bold mb-2">100% Private</h3>
            <p className="text-slate-400 leading-relaxed text-sm sm:text-base">Your data is never used for training or sold. Enterprise-grade privacy.</p>
          </div>
          <div className="glass-card-blue md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-5"><Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" /></div>
              <h3 className="text-xl sm:text-2xl font-display font-bold mb-3">Creative Interview Engine</h3>
              <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-lg">Tell your digital twin what you want — it asks the right questions, then assembles the perfect prompt for you.</p>
            </div>
            <div className="mt-6 font-mono text-sm text-slate-500">{">"} "What tone should it have? Who's your audience?"<br/>{">"} "Got it. Generating now..."</div>
          </div>
        </div>
      </section>

      {/* 定价区 — 3列水平对比 */}
      <section className="section-container section-spacing">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold">
            Simple,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Transparent</span>{" "}
            Pricing
          </h2>
          <p className="text-base sm:text-lg text-slate-400 mt-4">Start free, upgrade when you need more. No hidden fees.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[ 
            { name: "Free", price: "$0", desc: "For casual writers", features: ["10 generations/day", "DeepSeek model", "Basic brand voice"], btn: "outline" },
            { name: "Pro", price: "$9", desc: "For serious creators", features: ["100 generations/day", "Claude + DeepSeek", "Full brand voice", "Document upload"], btn: "primary", popular: true },
            { name: "Max", price: "$25", desc: "For power users", features: ["Unlimited generations", "Claude + DeepSeek", "Advanced brand voice", "Document + image upload", "Priority support"], btn: "primary" }
          ].map((plan) => (
            <div key={plan.name} className={`glass-card flex flex-col relative ${plan.popular ? 'glass-card-purple' : ''}`} style={plan.popular ? {borderColor: "rgba(155,109,255,0.25)", boxShadow: "0 0 48px rgba(155,109,255,0.1)"} : {}}>
              {plan.popular && <span className="absolute top-0 right-6 -translate-y-1/2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500">Most Popular</span>}
              <h3 className="text-xl font-display font-bold mb-2">{plan.name}</h3>
              <p className="text-slate-400 text-sm mb-6">{plan.desc}</p>
              <p className="text-4xl sm:text-5xl font-display font-extrabold mb-8">{plan.price}<span className="text-base sm:text-lg font-normal text-slate-500">/mo</span></p>
              <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 flex-1">
                {plan.features.map((f, j) => <li key={j} className="flex items-center gap-2 sm:gap-3 text-sm text-slate-300"><Check className="w-4 h-4 text-blue-400 flex-shrink-0" />{f}</li>)}
              </ul>
              <Link href="/login" className={plan.btn === 'primary' ? 'btn-primary w-full text-center' : 'btn-outline w-full text-center'}>
                {plan.name === 'Free' ? 'Get Started' : `Start ${plan.name}`}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 用户评价区 */}
      <section className="section-container section-spacing">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold">Loved by Creators Worldwide</h2>
          <p className="text-base sm:text-lg text-slate-400 mt-4">Join 500+ writers who already use Use AI Writer</p>
        </div>
        <Testimonials />
      </section>

      {/* FAQ区 */}
      <section className="section-container section-spacing max-w-3xl">
        <h2 className="text-3xl font-display font-extrabold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: "What's the difference between DeepSeek and Claude?", a: "DeepSeek is fast and affordable (great for drafts). Claude Sonnet 4.6 delivers premium writing quality (Pro/Max plans). You can switch anytime." },
            { q: "Can I cancel anytime?", a: "Absolutely. No contracts, no cancellation fees. You can cancel or change your plan at any time." },
            { q: "Is my data used to train AI?", a: "Never. Your content and brand voice data are 100% private. We do not use your data for model training." },
            { q: "How does brand voice learning work?", a: "Upload a writing sample or let our Creative Interview Engine guide you. The AI learns your tone, vocabulary, and style preferences over time." },
            { q: "Do I need a credit card to start?", a: "No! Start with the Free plan — no credit card required. Upgrade when you need more power." },
          ].map((faq, i) => (
            <details key={i} className="glass-card group cursor-pointer">
              <summary className="flex items-center justify-between font-semibold text-white text-sm sm:text-base">{faq.q}<ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0" /></summary>
              <p className="mt-4 text-slate-400 leading-relaxed text-sm sm:text-base">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 底部CTA */}
      <section className="w-full section-spacing">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="glass-card p-8 sm:p-12 md:p-16 relative overflow-hidden" style={{background: "radial-gradient(circle at 50% 50%, rgba(91,156,245,0.1), rgba(155,109,255,0.05), transparent)"}}>
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold mb-6">Ready to write 3x faster?</h2>
            <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-lg mx-auto">Join 500+ creators already using Use AI Writer. Start free, no credit card required.</p>
            <Link href="/login" className="btn-primary text-base sm:text-lg px-10 sm:px-14 py-5 sm:py-6 rounded-2xl">Start Writing Free <ArrowRight className="ml-2 w-5 h-5" /></Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <p className="text-sm text-slate-500">© 2026 Use AI Writer. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 text-sm text-slate-400">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <a href="https://useaitools.me" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Use AI Tools</a>
            <Link href="/login" className="btn-primary !min-h-[40px] !px-5 !py-2 !text-sm">Start Free</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}