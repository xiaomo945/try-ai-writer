import { Zap, Shield, Brain, Check } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center w-full">
      {/* Hero */}
      <section className="w-full max-w-7xl mx-auto px-4 py-20 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h1 className="text-5xl lg:text-6xl xl:text-7xl text-slate-900 dark:text-white leading-tight">Write Better, Faster, Cheaper — Meet Use AI Writer</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-lg">The AI writing tool built for creators who refuse to overpay.</p>
          <div className="flex flex-wrap gap-4">
            <a href="/login" className="btn-primary">Start Writing Free</a>
            <a href="/pricing" className="btn-outline">See Pricing</a>
          </div>
          <div className="flex items-center gap-4 pt-8">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (<div key={i} className="w-10 h-10 rounded-full bg-emerald-200 dark:bg-emerald-800 border-2 border-white dark:border-gray-950" />))}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold text-slate-700 dark:text-slate-300">100+</span> early adopters joined</p>
          </div>
        </div>
        <div className="hidden lg:flex justify-center">
          <div className="w-full max-w-md aspect-[4/3] bg-slate-100 dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-xl flex items-center justify-center">
            <p className="text-slate-400 dark:text-gray-600 text-lg font-mono">[ Editor SVG Placeholder ]</p>
          </div>
        </div>
      </section>
      {/* Features */}
      <section className="w-full bg-slate-50 dark:bg-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div className="card-hover"><Zap className="w-12 h-12 text-emerald-600 mb-4" /><h3 className="text-2xl mb-2">Lightning Fast Drafts</h3><p className="text-slate-600 dark:text-slate-400">From prompt to polished draft in under 30 seconds.</p></div>
          <div className="card-hover"><Brain className="w-12 h-12 text-emerald-600 mb-4" /><h3 className="text-2xl mb-2">Deep Context Awareness</h3><p className="text-slate-600 dark:text-slate-400">Remembers your brand voice, tone, and style preferences.</p></div>
          <div className="card-hover"><Shield className="w-12 h-12 text-emerald-600 mb-4" /><h3 className="text-2xl mb-2">100% Private & Secure</h3><p className="text-slate-600 dark:text-slate-400">Your data is never used for training or sold.</p></div>
        </div>
      </section>
      {/* Comparison */}
      <section className="w-full max-w-7xl mx-auto px-4 py-24">
        <h2 className="text-4xl text-center mb-16">Why Choose Us?</h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-gray-800">
          <table className="w-full text-left">
            <thead><tr className="bg-slate-50 dark:bg-gray-900"><th className="p-4 font-semibold">Feature</th><th className="p-4 font-semibold text-emerald-600">Use AI Writer</th><th className="p-4 font-semibold">Jasper</th><th className="p-4 font-semibold">Copy.ai</th></tr></thead>
            <tbody className="divide-y divide-slate-200 dark:divide-gray-800">
              <tr><td className="p-4">Monthly Price</td><td className="p-4 font-bold text-emerald-600">$5</td><td className="p-4">$49</td><td className="p-4">$49</td></tr>
              <tr><td className="p-4">Free Tier</td><td className="p-4 font-bold text-emerald-600">10/day</td><td className="p-4">7-day trial</td><td className="p-4">2K words/mo</td></tr>
              <tr><td className="p-4">Chinese Opt.</td><td className="p-4 text-emerald-600"><Check size={20} /></td><td className="p-4 text-slate-400">❌</td><td className="p-4 text-slate-400">❌</td></tr>
              <tr><td className="p-4">Privacy</td><td className="p-4 text-emerald-600">🔒 No Training</td><td className="p-4 text-orange-500">⚠️</td><td className="p-4 text-orange-500">⚠️</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      {/* Pricing */}
      <section className="w-full bg-slate-50 dark:bg-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-4"><h2 className="text-4xl text-center mb-16">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="card flex flex-col"><h3 className="text-2xl mb-2">Free</h3><p className="text-slate-600 dark:text-slate-400 mb-6">For casual writers</p><p className="text-4xl font-bold mb-6">$0<span className="text-lg font-normal text-slate-500">/mo</span></p><ul className="space-y-3 mb-8 flex-1"><li className="flex items-center gap-2"><Check size={18} className="text-emerald-600" />10 generations/day</li><li className="flex items-center gap-2"><Check size={18} className="text-emerald-600" />Basic templates</li></ul><a href="/login" className="btn-outline w-full">Get Started</a></div>
            <div className="card flex flex-col border-2 border-emerald-600 relative"><span className="absolute top-0 right-6 -translate-y-1/2 bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-semibold">Popular</span><h3 className="text-2xl mb-2">Pro</h3><p className="text-slate-600 dark:text-slate-400 mb-6">For serious creators</p><p className="text-4xl font-bold mb-6">$5<span className="text-lg font-normal text-slate-500">/mo</span></p><ul className="space-y-3 mb-8 flex-1"><li className="flex items-center gap-2"><Check size={18} className="text-emerald-600" />100 generations/day</li><li className="flex items-center gap-2"><Check size={18} className="text-emerald-600" />All templates</li><li className="flex items-center gap-2"><Check size={18} className="text-emerald-600" />API access</li></ul><a href="/login" className="btn-primary w-full">Start Pro</a></div>
            <div className="card flex flex-col"><h3 className="text-2xl mb-2">Team</h3><p className="text-slate-600 dark:text-slate-400 mb-6">For small teams</p><p className="text-4xl font-bold mb-6">$15<span className="text-lg font-normal text-slate-500">/mo</span></p><ul className="space-y-3 mb-8 flex-1"><li className="flex items-center gap-2"><Check size={18} className="text-emerald-600" />Unlimited</li><li className="flex items-center gap-2"><Check size={18} className="text-emerald-600" />5 members</li><li className="flex items-center gap-2"><Check size={18} className="text-emerald-600" />Priority support</li></ul><a href="/login" className="btn-outline w-full">Start Team</a></div>
          </div>
        </div>
      </section>
      {/* CTA */}
      <section className="w-full bg-slate-900 dark:bg-gray-950 py-24"><div className="max-w-2xl mx-auto text-center px-4 space-y-6"><h2 className="text-4xl text-white">Ready to write 3x faster?</h2><p className="text-xl text-slate-300">Join 100+ creators already using Use AI Writer.</p><a href="/login" className="btn-primary text-lg px-10 py-4">Start Writing Free</a></div></section>
    </main>
  );
}
