import { MetadataRoute } from 'next';

const blogPosts = [
  { slug: "01-ai-content-strategy", title: "The Complete AI Content Strategy for 2026", date: "2026-01-15" },
  { slug: "02-brand-voice-consistency", title: "Maintaining Brand Voice Consistency Across All Channels", date: "2026-01-22" },
  { slug: "03-productivity-hacks", title: "10 Productivity Hacks for Content Creators in 2026", date: "2026-02-01" },
  { slug: "04-seo-fundamentals", title: "SEO Fundamentals That Still Matter in 2026", date: "2026-02-10" },
  { slug: "05-future-of-writing", title: "The Future of Writing: Human-AI Collaboration", date: "2026-02-20" },
  { slug: "06-ai-writing-for-email-marketing", title: "AI Writing for Email Marketing: Boost Open Rates with Better Copy", date: "2026-05-25" },
  { slug: "07-overcoming-writers-block-with-ai", title: "How to Overcome Writer's Block with AI: A Practical Guide", date: "2026-05-25" },
  { slug: "08-ai-content-strategy-2026", title: "Building an AI-Powered Content Strategy in 2026", date: "2026-05-25" },
  { slug: "09-ai-vs-human-writers", title: "AI vs. Human Writers: Why the Future is Collaborative, Not Competitive", date: "2026-05-25" },
  { slug: "10-multilingual-ai-writing", title: "Breaking Language Barriers: How AI Writing Tools Handle 50+ Languages", date: "2026-05-25" },
  { slug: "11-seo-ai-writing-best-practices", title: "SEO and AI Writing: Best Practices for Ranking in 2026", date: "2026-05-25" },
  { slug: "12-ai-writing-for-social-media-managers", title: "AI Writing Tools Every Social Media Manager Needs in 2026", date: "2026-05-25" },
  { slug: "13-how-to-train-ai-on-your-writing-style", title: "How to Train AI on Your Writing Style: The Complete Guide", date: "2026-05-25" },
  { slug: "14-ai-writing-api-integration", title: "Integrating AI Writing APIs into Your Workflow: A Developer's Guide", date: "2026-05-25" },
  { slug: "15-future-of-content-creation-ai", title: "The Future of Content Creation: Why AI Is the New Normal", date: "2026-05-25" },
  { slug: "how-to-write-blog-posts-with-ai", title: "How to Write Blog Posts with AI: The Complete Guide", date: "2026-05-25" },
  { slug: "claude-vs-deepseek-for-writing", title: "Claude vs DeepSeek for Content Writing: Which Should You Use?", date: "2026-05-25" },
  { slug: "ai-writing-tools-affordable", title: "Affordable AI Writing Tools That Don't Suck (2026 Edition)", date: "2026-05-25" },
  { slug: "brand-voice-ai-writing", title: "Brand Voice AI Writing: How to Create Your Digital Twin", date: "2026-05-25" },
  { slug: "ai-writing-for-startup-founders", title: "AI Writing for Startup Founders", date: "2026-05-25" },
  { slug: "ai-writing-ethics-transparency", title: "The Ethics of AI Writing", date: "2026-05-25" },
  { slug: "ai-writing-tools-for-non-native-speakers", title: "Best AI Writing Tools for Non-Native Speakers", date: "2026-05-25" },
  { slug: "how-to-choose-ai-writing-tool", title: "How to Choose the Right AI Writing Tool", date: "2026-05-25" },
  { slug: "ai-writing-for-ecommerce", title: "AI Writing for E-commerce", date: "2026-05-25" },
  { slug: "ai-writing-myths-debunked", title: "5 AI Writing Myths Debunked", date: "2026-05-25" },
  { slug: "ai-writing-for-academic-research", title: "AI Writing Tools for Academic Research", date: "2026-05-25" },
  { slug: "personal-brand-building-with-ai", title: "Building a Personal Brand with AI", date: "2026-05-25" },
  { slug: "ai-writing-for-newsletters", title: "How to Write Newsletters with AI", date: "2026-05-25" },
  { slug: "ai-writing-trends-to-watch", title: "7 AI Writing Trends to Watch in 2026", date: "2026-05-25" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tryaiwriter.com';
  const now = new Date();
  
  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    ...blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
