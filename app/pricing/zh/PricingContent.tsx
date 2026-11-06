"use client";

import Link from "next/link";
import { Check, KeyRound, PenLine, ShieldCheck, Sparkles, Wrench } from "lucide-react";

const freeTools = [
  "SEO 分析器 — 对照 20+ 项页面因素为任意网页打分",
  "原创度检测 — 区分 AI 生成与人工撰写文本",
  "提示词优化器 — 把模糊需求变成精准提示词",
  "字数统计 — 字数、阅读时长、关键词密度",
  "完整编辑器，含品牌语气学习与模板",
];

const byokFeatures = [
  "粘贴你自己的 DeepSeek 或 Claude API Key",
  "无限次生成 — 无每日上限、无加价",
  "你的 Key 仅保存在浏览器中",
  "绝不上传到我们的服务器",
  "只需按你服务商的 API 价格付费",
];

const faqs = [
  {
    q: "Try AI Writer 真的免费吗？",
    a: "是的。本应用完全免费。AI 写作运行在你自己的 API Key（BYOK）上；我们的离线写作工具则根本不需要 Key。我们不卖订阅，也不卖额度。",
  },
  {
    q: "我的 API Key 保存在哪里？",
    a: "只保存在你浏览器的本地存储中。它会直接发往你选择的服务商，绝不会上传或存储在我们的服务器上。",
  },
  {
    q: "既然免费，你们靠什么赚钱？",
    a: "我们由注重隐私的广告支持，而不是靠订阅。所以没有信用卡、没有试用到期、也没有付费墙。",
  },
  {
    q: "我需要注册账号吗？",
    a: "不需要。你可以不注册就使用每一个工具。账号只是帮你跨设备保存作品和品牌语气。",
  },
];

export default function PricingContentZh() {
  return (
    <>
      <main className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-glass-border">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="bg-gradient-to-r from-[#4A90E2] to-[#A855F7] bg-clip-text text-transparent font-display text-xl font-extrabold">
              Try AI Writer
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/write" className="btn-primary text-sm min-h-[40px] px-4">
                开始写作
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-16 md:py-24">
          {/* Hero */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(168,85,247,0.3)] bg-[rgba(168,85,247,0.08)] px-4 py-1 text-sm text-[#A855F7] mb-6">
              <Sparkles className="w-4 h-4" /> 完全免费 · 无需订阅
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white mb-4">
              永久免费，自带 API Key
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Try AI Writer 不花你一分钱。无需 Key 即可使用免费离线写作工具，或添加你自己的 DeepSeek / Claude API Key 进行无限次 AI 生成。我们靠广告盈利——绝不是靠你。
            </p>
          </div>

          {/* 两种使用方式 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 免费离线工具 */}
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-xl font-display font-bold text-white">免费离线工具</h2>
              </div>
              <p className="text-5xl font-display font-extrabold text-white mt-4">
                ¥0
                <span className="text-base font-normal text-slate-400 ml-2">永久</span>
              </p>
              <p className="text-sm text-slate-400 mt-1">无 API Key、无账号、无限额。</p>
              <ul className="mt-8 space-y-3">
                {freeTools.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="text-sm font-mono text-emerald-400 mt-0.5 flex-shrink-0">{"✓"}</span>
                    <span className="text-slate-400">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/tools"
                className="w-full mt-8 py-3 rounded-lg text-sm font-semibold btn-outline inline-flex items-center justify-center"
              >
                浏览免费工具
              </Link>
            </div>

            {/* BYOK AI 写作 */}
            <div
              className="glass-card p-8 border-[rgba(168,85,247,0.2)]"
              style={{ boxShadow: "0 0 40px rgba(168, 85, 247, 0.1)" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[rgba(168,85,247,0.12)] flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-[#A855F7]" />
                </div>
                <h2 className="text-xl font-display font-bold text-white">AI 写作（自带 Key）</h2>
              </div>
              <p className="text-5xl font-display font-extrabold text-white mt-4">
                你的 Key
                <span className="text-base font-normal text-slate-400 ml-2">无限次</span>
              </p>
              <p className="text-sm text-slate-400 mt-1">你按服务商付费，我们零加价。</p>
              <ul className="mt-8 space-y-3">
                {byokFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="text-sm font-mono text-[#A855F7] mt-0.5 flex-shrink-0">{"✓"}</span>
                    <span className="text-slate-400">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/write"
                className="w-full mt-8 py-3 rounded-lg text-sm font-semibold btn-primary inline-flex items-center justify-center"
              >
                添加你的 API Key
              </Link>
            </div>
          </div>

          {/* 我们如何保持免费 */}
          <div className="mt-16 glass-card p-8 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-display font-bold text-white text-lg mb-1">
                我们如何保持免费
              </h3>
              <p className="text-slate-400">
                我们由广告支持，而非订阅支持。这就是为什么没有信用卡、没有到期的试用、也没有挡在你作品前的付费墙。带上你自己的 API Key，AI 就按你服务商的价格运行；其余一切由我们承担。
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-20">
            <h2 className="text-3xl font-display font-bold text-white text-center mb-12">
              常见问题
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {faqs.map((faq, index) => (
                <div key={index} className="glass-card p-6">
                  <h3 className="font-semibold text-white mb-2 flex items-start gap-2">
                    <PenLine className="w-4 h-4 text-[#4A90E2] mt-1 flex-shrink-0" />
                    {faq.q}
                  </h3>
                  <p className="text-slate-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-12 border-t border-glass-border">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-sm text-slate-500">&copy; 2026 Try AI Writer. 保留所有权利。</p>
          </div>
        </footer>
      </main>
    </>
  );
}
