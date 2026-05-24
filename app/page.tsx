import { Zap, Shield, Brain, Check, X, Sparkles, PenTool, Users } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast Drafts",
    description: "From prompt to polished draft in under 30 seconds. No more staring at a blank page.",
  },
  {
    icon: Brain,
    title: "Deep Context Awareness",
    description: "Remembers your brand voice, tone, and style preferences across every session.",
  },
  {
    icon: Shield,
    title: "100% Private & Secure",
    description: "Your data is never used for training or sold. Built with privacy first.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For casual writers",
    features: ["10 generations/day", "Basic templates", "Email support"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$5",
    description: "For serious creators",
    features: ["100 generations/day", "All templates", "API access", "Priority support", "Custom tone"],
    cta: "Start Pro",
    popular: true,
  },
  {
    name: "Team",
    price: "$15",
    description: "For small teams",
    features: ["Unlimited generations", "5 members", "Priority support", "API access", "Brand kit", "Analytics"],
    cta: "Start Team",
    popular: false,
  },
];

const comparisonData = [
  { feature: "Monthly Price", ours: "$5", jasper: "$49", copyai: "$49" },
  { feature: "Free Tier", ours: "10/day", jasper: "7-day trial", copyai: "2K words/mo" },
  { feature: "Chinese Optimization", ours: true, jasper: false, copyai: false },
  { feature: "No AI Training", ours: true, jasper: false, copyai: false },
];

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center w-full">
      {/* Hero */}
      <section className="w-full min-h-[90vh] bg-gradient-to-b from-slate-50 to-white flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 py-20 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold leading-tight">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Write Better, Faster, Cheaper</span>
              <br />
              <span className="text-slate-900 dark:text-white">Meet Use AI Writer</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-[600px]">
              The AI writing tool built for creators who refuse to overpay. Start free &mdash; no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="btn-primary text-center">Start Writing Free</Link>
              <Link href="/pricing" className="btn-outline text-center">See Pricing</Link>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 border-2 border-white dark:border-gray-950"
                  />
                ))}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">100+</span> early adopters joined
              </p>
            </div>
          </div>
          <div className="hidden lg:flex justify-center">
            <div className="w-full max-w-md aspect-[4/3] bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-2xl shadow-emerald-500/10 p-8 flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-gray-700">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-slate-400 font-mono">editor.useaiwriter.com</span>
              </div>
              <div className="flex-1 space-y-3">
                <div className="h-3 bg-slate-100 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-slate-100 dark:bg-gray-700 rounded w-full" />
                <div className="h-3 bg-slate-100 dark:bg-gray-700 rounded w-5/6" />
                <div className="h-3 bg-emerald-100 dark:bg-emerald-900/40 rounded w-full" />
                <div className="h-3 bg-emerald-100 dark:bg-emerald-900/40 rounded w-2/3" />
                <div className="h-3 bg-slate-100 dark:bg-gray-700 rounded w-4/5" />
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-gray-700">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-emerald-600 font-medium">AI generating...</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full bg-slate-50 dark:bg-gray-900 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 dark:text-white">
              Why Creators Love Us
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-[500px] mx-auto">
              Built for speed, privacy, and quality &mdash; not compromises.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="card-hover group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-6 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                    <Icon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="w-full py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 dark:text-white">
              Why Choose Us?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-[500px] mx-auto">
              See how we stack up against the competition.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-gray-800">
                  <th className="p-5 font-semibold text-slate-700 dark:text-slate-300">Feature</th>
                  <th className="p-5 font-semibold text-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Use AI Writer
                    </div>
                  </th>
                  <th className="p-5 font-semibold text-slate-500">Jasper</th>
                  <th className="p-5 font-semibold text-slate-500">Copy.ai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-gray-800">
                {comparisonData.map((row) => (
                  <tr key={row.feature}>
                    <td className="p-5 text-slate-700 dark:text-slate-300 font-medium">{row.feature}</td>
                    <td className="p-5 font-bold text-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10">
                      {typeof row.ours === "boolean" ? (
                        <Check className="w-5 h-5 text-emerald-600" />
                      ) : (
                        row.ours
                      )}
                    </td>
                    <td className="p-5 text-slate-500">
                      {typeof row.jasper === "boolean" ? (
                        row.jasper ? <Check className="w-5 h-5 text-emerald-600" /> : <X className="w-5 h-5 text-red-500" />
                      ) : (
                        row.jasper
                      )}
                    </td>
                    <td className="p-5 text-slate-500">
                      {typeof row.copyai === "boolean" ? (
                        row.copyai ? <Check className="w-5 h-5 text-emerald-600" /> : <X className="w-5 h-5 text-red-500" />
                      ) : (
                        row.copyai
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="w-full bg-slate-50 dark:bg-gray-900 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 dark:text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-[500px] mx-auto">
              Start free. Upgrade when you need more power.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`card flex flex-col relative ${
                  plan.popular
                    ? "ring-2 ring-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/10"
                    : ""
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                    Most Popular
                  </span>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-1">{plan.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{plan.description}</p>
                </div>
                <p className="text-4xl font-display font-extrabold text-slate-900 dark:text-white mb-6">
                  {plan.price}
                  <span className="text-lg font-normal text-slate-500 font-sans">/mo</span>
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check size={18} className="text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={plan.popular ? "btn-primary w-full text-center" : "btn-outline w-full text-center"}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Extra Features Row */}
      <section className="w-full py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <PenTool className="w-10 h-10 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-2">Multiple Writing Modes</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Blog posts, emails, social media, and custom prompts.</p>
            </div>
            <div className="text-center">
              <Users className="w-10 h-10 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-2">Team Collaboration</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Share brand kits and templates across your team.</p>
            </div>
            <div className="text-center">
              <Shield className="w-10 h-10 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-2">Enterprise Security</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">SOC 2 compliant with end-to-end encryption.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-gray-950 py-20 md:py-28">
        <div className="max-w-2xl mx-auto text-center px-4 space-y-6">
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white">
            Ready to write 3x faster?
          </h2>
          <p className="text-lg md:text-xl text-slate-300">
            Join 100+ creators already using Use AI Writer.
          </p>
          <Link href="/login" className="btn-primary text-lg px-10 py-4 inline-block">
            Start Writing Free
          </Link>
        </div>
      </section>
    </main>
  );
}
