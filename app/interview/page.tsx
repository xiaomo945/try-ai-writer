import { Sparkles, ArrowRight, ChevronRight, Brain } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Creative Interview Engine | Use AI Writer",
  description: "Tell your digital twin what you want. It asks the right questions, then assembles the perfect prompt. Creative AI writing interview assistant.",
};

export default function InterviewPage() {
  const examples = [
    {
      title: "Novel Writing",
      input: "I want to write a novel",
      questions: [
        "What genre is this novel? (e.g., sci-fi, romance, mystery)",
        "Who's your main character, and what do they want?",
        "What's the central conflict or problem they face?",
        "What tone are you going for? (e.g., hopeful, dark, whimsical)",
        "Any specific themes or messages you want to explore?"
      ],
      output: "Complete novel outline with 3 acts, character arcs, and chapter summaries"
    },
    {
      title: "Sales Email",
      input: "我需要一封销售邮件",
      questions: [
        "What product or service are you selling?",
        "Who's the target audience for this email?",
        "What's the main benefit or value proposition?"
      ],
      output: "High-converting sales email with subject line, body, and CTA"
    },
    {
      title: "Amazon Listing",
      input: "帮我写亚马逊Listing",
      questions: [
        "What's your product name and key features?",
        "Who's your target customer?",
        "What problems does your product solve?",
        "Who are your main competitors?"
      ],
      output: "Optimized Amazon listing with 5-point description, title, and keywords"
    }
  ];

  return (
    <main className="flex flex-col items-center w-full bg-[#0A0A0C] text-white min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0C]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">Use AI<span className="text-blue-400">Writer</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors">Home</Link>
            <Link href="/write" className="text-slate-300 hover:text-white transition-colors">Write</Link>
            <Link href="/templates" className="text-slate-300 hover:text-white transition-colors">Templates</Link>
            <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" className="btn-primary !min-h-[40px] !px-5 !py-2 !text-sm">Start Writing</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-container section-spacing pt-32">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 mb-6">
            <Brain className="w-4 h-4 text-purple-400" />
            <span>Creative Interview Engine</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
            From Vague Idea to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Perfect Draft
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 mt-6 max-w-2xl mx-auto leading-relaxed">
            Tell your digital twin what you want. It asks the right questions, then assembles the perfect prompt.
          </p>
          <Link href="/write" className="btn-primary mt-10 text-base sm:text-lg">
            Try Creative Interview <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Examples */}
      <section className="section-container section-spacing">
        <div className="space-y-12">
          {examples.map((example, i) => (
            <div key={i} className="glass-card">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold">{example.title}</h3>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Input */}
                <div className="space-y-2">
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-mono">Your Input</div>
                  <div className="glass-card p-4 border-white/10">
                    <p className="text-slate-300 font-mono text-sm">"{example.input}"</p>
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-2">
                  <div className="text-xs text-purple-400 uppercase tracking-wider font-mono flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" /> AI Questions
                  </div>
                  <div className="space-y-2">
                    {example.questions.map((q, j) => (
                      <div key={j} className="glass-card-purple p-3 border-purple-500/10">
                        <p className="text-slate-200 font-mono text-sm">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Output */}
                <div className="space-y-2">
                  <div className="text-xs text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Generated Output
                  </div>
                  <div className="glass-card-emerald p-4 border-emerald-500/10">
                    <p className="text-slate-200 font-mono text-sm">{example.output}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-container section-spacing">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-8 sm:p-12" style={{background: "radial-gradient(circle at 50% 50%, rgba(91,156,245,0.1), rgba(155,109,255,0.05), transparent)"}}>
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">Ready to see it in action?</h2>
            <p className="text-lg text-slate-400 mb-10">Try the Creative Interview Engine right now and get your first perfect draft.</p>
            <Link href="/write" className="btn-primary text-base sm:text-lg">
              Try Creative Interview <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}