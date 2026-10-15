"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  PenTool,
  Megaphone,
  Mail,
  MessageSquare,
  Sparkles,
  Palette,
  TrendingUp,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { getTemplatesByCategory, TEMPLATES } from "@/lib/templates";
import { getCommunityWorkflows, type WorkflowDefinition } from "@/lib/workflows";
import { NavWrapper } from "@/app/components/NavWrapper";

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode }> = {
  Business: { label: "Business Writing", icon: <FileText className="w-6 h-6 text-blue-400" /> },
  Content: { label: "Content Creation", icon: <PenTool className="w-6 h-6 text-purple-400" /> },
  Marketing: { label: "Marketing & Ads", icon: <Megaphone className="w-6 h-6 text-orange-400" /> },
  Email: { label: "Email", icon: <Mail className="w-6 h-6 text-sky-400" /> },
  Social: { label: "Social Media", icon: <MessageSquare className="w-6 h-6 text-pink-400" /> },
  Professional: { label: "Professional Writing", icon: <Sparkles className="w-6 h-6 text-emerald-400" /> },
  Creative: { label: "Creative Writing", icon: <Palette className="w-6 h-6 text-violet-400" /> },
  SEO: { label: "SEO & Web", icon: <TrendingUp className="w-6 h-6 text-teal-400" /> },
};

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
        <div className="glass-card p-8 text-center border border-slate-200 dark:border-white/5">
          <p className="text-slate-500 dark:text-slate-400 mb-4">还没有社区工作流</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">去创建并分享你的第一个工作流吧 →</p>
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
              <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">{workflow.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{workflow.description}</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-slate-400 dark:text-slate-500">by {workflow.author || "Anonymous"}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {workflow.steps.length} steps
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-white/5">
              <span className="text-sm text-slate-500 dark:text-slate-400">Use Workflow</span>
              <ArrowRight className="w-5 h-5 text-emerald-400" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const groups = getTemplatesByCategory();

  return (
    <main className="flex flex-col items-center w-full bg-white dark:bg-[#0A0A0C] text-slate-900 dark:text-white min-h-screen">
      <NavWrapper />

      {/* Hero Section */}
      <section className="section-container section-spacing pt-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
            {TEMPLATES.length}+ Templates for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Every Use Case
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 mt-6 max-w-2xl mx-auto">
            Professional templates to get you started faster. Pick a template, customize, and generate.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-400 dark:text-slate-500">
            <Lightbulb className="w-4 h-4" />
            <span>选一个模板会直接带进写作页，自动填好提示词与写作模式</span>
          </div>
        </div>
      </section>

      {/* Template Categories */}
      <section className="section-container section-spacing pt-0">
        {groups.map((group) => {
          const meta = CATEGORY_META[group.category];
          return (
            <div key={group.category} className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  {meta?.icon ?? <FileText className="w-6 h-6 text-slate-400" />}
                </div>
                <h2 className="text-2xl font-bold">{meta?.label ?? group.category}</h2>
                <span className="text-sm text-slate-400 dark:text-slate-500">{group.templates.length}</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {group.templates.map((template) => (
                  <Link
                    key={template.id}
                    href={`/write?template=${template.id}`}
                    className="glass-card hover:scale-[1.02] transition-all duration-300 flex flex-col"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">{template.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{template.desc}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {template.category}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-slate-500 dark:text-slate-400 capitalize">
                          {template.mode}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-white/5">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Use Template</span>
                      <ArrowRight className="w-5 h-5 text-blue-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-8" />

      {/* Community Workflows */}
      <CommunityWorkflowsSection />

      {/* CTA */}
      <section className="section-container section-spacing">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-8 sm:p-12" style={{background: "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.1), rgba(20,184,166,0.05), transparent)"}}>
            <Sparkles className="w-10 h-10 sm:w-12 h-12 text-emerald-500 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-slate-900 dark:text-white">Ready to get writing?</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-10">Pick a template and generate your first piece in 30 seconds.</p>
            <Link href="/write" className="btn-primary text-base sm:text-lg">
              Start Writing Free <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
