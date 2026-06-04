"use client";

import { useState, useEffect } from "react";
import { FileText, MessageSquare, PenTool, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getCommunityWorkflows, type WorkflowDefinition } from "@/lib/workflows";

const categories = [
  {
    name: "Business Writing",
    icon: <FileText className="w-6 h-6 text-blue-400" />,
    templates: [
      { id: "amazon-listing", name: "Amazon Listing", desc: "Optimize your product listings for higher conversions", category: "Business" },
      { id: "google-ads", name: "Google Ads", desc: "High-converting ad copy for search campaigns", category: "Business" },
      { id: "email-marketing", name: "Email Marketing", desc: "Compelling emails that drive clicks and sales", category: "Business" },
      { id: "sales-page", name: "Sales Page", desc: "Long-form sales copy that converts visitors to customers", category: "Business" }
    ]
  },
  {
    name: "Content Creation",
    icon: <PenTool className="w-6 h-6 text-purple-400" />,
    templates: [
      { id: "blog-post", name: "Blog Post", desc: "SEO-friendly blog posts for your audience", category: "Content" },
      { id: "social-media", name: "Social Media", desc: "Engaging posts for Twitter, LinkedIn, Instagram", category: "Content" },
      { id: "newsletter", name: "Newsletter", desc: "Weekly newsletters your subscribers will love", category: "Content" },
      { id: "youtube-scripts", name: "YouTube Scripts", desc: "Complete scripts for engaging YouTube videos", category: "Content" }
    ]
  },
  {
    name: "Professional Writing",
    icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
    templates: [
      { id: "press-release", name: "Press Release", desc: "Professional press releases for media outreach", category: "Professional" },
      { id: "case-study", name: "Case Study", desc: "Customer success stories that build trust", category: "Professional" },
      { id: "white-paper", name: "White Paper", desc: "In-depth white papers for thought leadership", category: "Professional" },
      { id: "job-description", name: "Job Description", desc: "Attract the right candidates with clear JDs", category: "Professional" }
    ]
  },
  {
    name: "Creative Writing",
    icon: <MessageSquare className="w-6 h-6 text-violet-400" />,
    templates: [
      { id: "story", name: "Story", desc: "Compelling short stories or novel chapters", category: "Creative" },
      { id: "poem", name: "Poem", desc: "Beautiful poetry in any style or form", category: "Creative" },
      { id: "script", name: "Script", desc: "Screenplays, stage plays, or video scripts", category: "Creative" },
      { id: "character", name: "Character Description", desc: "Rich, detailed character profiles", category: "Creative" }
    ]
  }
];

function CommunityWorkflowsSection() {
  const [communityWorkflows, setCommunityWorkflows] = useState<WorkflowDefinition[]>([]);

  useEffect(() => {
    setCommunityWorkflows(getCommunityWorkflows());
  }, []);

  if (communityWorkflows.length === 0) {
    return (
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold">Community Workflows</h2>
        </div>
        <div className="glass-card p-8 text-center">
          <p className="text-slate-400 mb-4">还没有社区工作流</p>
          <p className="text-sm text-slate-500 mb-6">去创建并分享你的第一个工作流吧 →</p>
          <Link href="/write" className="btn-primary text-sm">去创建工作流</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold">Community Workflows</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {communityWorkflows.map((workflow) => (
          <Link
            key={workflow.id}
            href={`/write?workflow=${workflow.id}`}
            className="glass-card hover:scale-[1.02] transition-all duration-300 flex flex-col"
          >
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">{workflow.name}</h3>
              <p className="text-sm text-slate-400 mb-3 line-clamp-2">{workflow.description}</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-slate-500">by {workflow.author || "Anonymous"}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                  {workflow.steps.length} steps
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
              <span className="text-sm text-slate-400">Use Workflow</span>
              <ArrowRight className="w-5 h-5 text-emerald-400" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function TemplatesPage() {
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
            <Link href="/interview" className="text-slate-300 hover:text-white transition-colors">Interview</Link>
            <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" className="btn-primary !min-h-[40px] !px-5 !py-2 !text-sm">Start Writing</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-container section-spacing pt-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
            16+ Templates for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Every Use Case
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 mt-6 max-w-2xl mx-auto">
            Professional templates to get you started faster. Pick a template, customize, and generate.
          </p>
        </div>
      </section>

      {/* Template Categories */}
      <section className="section-container section-spacing pt-0">
        {categories.map((category, i) => (
          <div key={i} className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                {category.icon}
              </div>
              <h2 className="text-2xl font-bold">{category.name}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.templates.map((template, j) => (
                <Link
                  key={j}
                  href={`/write?template=${template.id}`}
                  className="glass-card hover:scale-[1.02] transition-all duration-300 flex flex-col"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">{template.name}</h3>
                    <p className="text-sm text-slate-400 mb-4">{template.desc}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">
                        {template.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                    <span className="text-sm text-slate-400">Use Template</span>
                    <ArrowRight className="w-5 h-5 text-blue-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-8" />

      {/* Community Workflows */}
      <CommunityWorkflowsSection />

      {/* CTA */}
      <section className="section-container section-spacing">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-8 sm:p-12" style={{background: "radial-gradient(circle at 50% 50%, rgba(91,156,245,0.1), rgba(155,109,255,0.05), transparent)"}}>
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">Ready to get writing?</h2>
            <p className="text-lg text-slate-400 mb-10">Pick a template and generate your first piece in 30 seconds.</p>
            <Link href="/write" className="btn-primary text-base sm:text-lg">
              Start Writing Free <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}