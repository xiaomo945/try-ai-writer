import { Check, PenTool, Zap, Brain } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "./components/ScrollReveal";
import { plans } from "@/lib/pricing";

const featureStories = [
  {
    icon: Brain,
    title: "Your Brand's Memory.",
    description: "Stop rewriting the same context every time. Use AI Writer remembers your voice, your style, your audience — across every session.",
    visual: "memory",
  },
  {
    icon: Zap,
    title: "From Thought to Draft.",
    description: "Thirty seconds. That's all it takes to go from a rough idea to a polished draft you can actually use.",
    visual: "speed",
  },
  {
    icon: PenTool,
    title: "Write Like You.",
    description: "Not generic AI. Your words, amplified. The tool learns your tone, not just your prompts.",
    visual: "voice",
  },
];

function VisualElement({ type }: { type: string }) {
  if (type === "memory") {
    return (
      <div className="w-full max-w-lg mx-auto md:mx-0">
        <div className="relative">
          <div className="aspect-[4/3] rounded-2xl border border-slate-200 bg-white p-8 flex items-center justify-center">
            <div className="w-full space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="h-4 bg-slate-200 rounded w-32" />
              </div>
              <div className="space-y-2 pl-13">
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-4/5" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Brand Voice Learned</div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full">Professional</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">Concise</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">Friendly</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-50 rounded-full -z-10" />
        </div>
      </div>
    );
  }

  if (type === "speed") {
    return (
      <div className="w-full max-w-lg mx-auto md:mx-0">
        <div className="relative">
          <div className="aspect-[4/3] rounded-2xl border border-slate-200 bg-white p-8 flex flex-col items-center justify-center">
            <div className="text-6xl font-display font-extrabold text-slate-900 mb-6">30s</div>
            <div className="w-full space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-slate-500">1</span>
                </div>
                <div className="h-2 bg-slate-200 rounded flex-1" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="h-2 bg-emerald-200 rounded flex-1" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="h-2 bg-emerald-200 rounded flex-1" />
              </div>
            </div>
            <div className="mt-6 text-sm text-slate-500">Idea → Draft → Done</div>
          </div>
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-slate-100 rounded-full -z-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto md:mx-0">
      <div className="relative">
        <div className="aspect-[4/3] rounded-2xl border border-slate-200 bg-white p-8 flex items-center justify-center">
          <div className="w-full space-y-6">
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <PenTool className="w-8 h-8 text-slate-400" />
              </div>
              <div className="w-8 h-px bg-slate-300" />
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <Brain className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Your Voice</div>
              <div className="text-lg font-semibold text-slate-900">Amplified</div>
            </div>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-100 rounded-full -z-10" />
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center w-full">
      <section className="w-full min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-3xl mx-auto px-6 py-32 text-center hero-fade-in">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-extrabold text-slate-900 leading-none tracking-tight mb-8">
            Write Like You,
            <br />
            <span className="text-slate-500">Only Faster.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 font-normal max-w-xl mx-auto mb-16 leading-relaxed">
            The AI writing tool that learns your voice, not just your prompts.
          </p>
          <Link href="/login" className="btn-primary text-lg px-12 py-5 inline-block">
            Start Writing Free
          </Link>
        </div>
      </section>

      <section className="w-full py-16 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          {featureStories.map((story, index) => (
            <ScrollReveal key={story.title} delay={index * 100}>
              <div className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-24 py-16 md:py-32`}>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 mb-6 leading-tight">
                    {story.title}
                  </h2>
                  <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-md">
                    {story.description}
                  </p>
                </div>
                <div className="flex-1 w-full">
                  <VisualElement type={story.visual} />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="w-full py-16 md:py-32 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-20 md:mb-32">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 mb-6">
                Simple Pricing.
              </h2>
              <p className="text-xl md:text-2xl text-slate-500">
                Start free. Upgrade when you need more.
              </p>
            </div>
          </ScrollReveal>

          <div className="flex flex-col md:flex-row">
            {plans.map((plan, index) => (
              <ScrollReveal key={plan.name} delay={index * 100}>
                <div className={`flex-1 px-8 md:px-12 py-12 ${index < plans.length - 1 ? 'md:border-r md:border-slate-200' : ''}`}>
                  <div className="mb-8">
                    <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">{plan.name}</h3>
                    <p className="text-sm text-slate-500">{plan.description}</p>
                  </div>
                  <p className={`text-5xl font-display mb-2 ${plan.recommended ? 'font-extrabold text-slate-900' : 'font-bold text-slate-700'}`}>
                    {plan.price}
                  </p>
                  <p className="text-sm text-slate-400 mb-10">{plan.period}</p>
                  <ul className="space-y-4 mb-12">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login"
                    className={plan.recommended ? "btn-primary w-full text-center block" : "btn-outline w-full text-center block"}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-24 md:py-40 bg-white">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 mb-10 leading-tight">
              Ready to write differently?
            </h2>
            <Link href="/login" className="btn-primary text-lg px-12 py-5 inline-block">
              Start Writing Free
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <footer className="w-full py-12 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-400">© 2026 Use AI Writer.</p>
        </div>
      </footer>
    </main>
  );
}
