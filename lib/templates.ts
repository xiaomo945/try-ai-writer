/**
 * Writing template catalog.
 *
 * Each template maps to a writing `mode` and carries a `starterPrompt` that
 * pre-fills the editor when the user opens `/write?template=<id>`.
 *
 * NOTE: the original 16 template ids are kept intact so previously shared
 * links keep working.
 */

export type WritingMode = "blog" | "email" | "social" | "custom";

export type WritingTemplate = {
  id: string;
  name: string;
  desc: string;
  category: string;
  mode: WritingMode;
  starterPrompt: string;
};

export const TEMPLATE_CATEGORIES = [
  "Business",
  "Content",
  "Marketing",
  "Email",
  "Social",
  "Professional",
  "Creative",
  "SEO",
] as const;

export const TEMPLATES: WritingTemplate[] = [
  // ---------- Business ----------
  {
    id: "amazon-listing",
    name: "Amazon Listing",
    desc: "Optimize product listings for higher conversions",
    category: "Business",
    mode: "custom",
    starterPrompt:
      "Write a high-converting Amazon product listing for: [product name]. Include a keyword-rich title, 5 benefit-focused bullet points, and a persuasive product description.",
  },
  {
    id: "sales-page",
    name: "Sales Page",
    desc: "Long-form sales copy that converts visitors to customers",
    category: "Business",
    mode: "custom",
    starterPrompt:
      "Write a long-form sales page for: [product or service]. Open with a pain-point hook, present the offer, handle objections, add social proof sections, and close with a strong call to action.",
  },
  {
    id: "business-proposal",
    name: "Business Proposal",
    desc: "Persuasive proposals that win clients",
    category: "Business",
    mode: "custom",
    starterPrompt:
      "Write a business proposal for: [project]. Include the problem statement, proposed solution, deliverables, timeline, pricing, and why we are the right fit.",
  },
  {
    id: "product-description",
    name: "Product Description",
    desc: "Clear, benefit-led descriptions for any product",
    category: "Business",
    mode: "custom",
    starterPrompt:
      "Write a product description for: [product]. Lead with the main benefit, explain key features, and end with a call to action. Keep it under 150 words.",
  },
  {
    id: "company-about",
    name: "About Us Page",
    desc: "A company story people actually want to read",
    category: "Business",
    mode: "custom",
    starterPrompt:
      "Write an About Us page for: [company]. Cover our origin story, what we do, who we help, and what makes us different. Keep the tone warm and human.",
  },

  // ---------- Content ----------
  {
    id: "blog-post",
    name: "Blog Post",
    desc: "SEO-friendly blog posts for your audience",
    category: "Content",
    mode: "blog",
    starterPrompt:
      "Write an SEO-friendly blog post about: [topic]. Use an attention-grabbing H2 title, at least three H3 subheadings, scannable lists, and a clear conclusion.",
  },
  {
    id: "newsletter",
    name: "Newsletter",
    desc: "Weekly newsletters your subscribers will love",
    category: "Content",
    mode: "email",
    starterPrompt:
      "Write a weekly newsletter about: [theme]. Open with a friendly hook, share 2-3 useful items with short summaries, and close with a question to spark replies.",
  },
  {
    id: "youtube-scripts",
    name: "YouTube Scripts",
    desc: "Complete scripts for engaging YouTube videos",
    category: "Content",
    mode: "custom",
    starterPrompt:
      "Write a YouTube video script about: [topic]. Include a hook for the first 15 seconds, section-by-section talking points, pattern interrupts, and a subscribe call to action.",
  },
  {
    id: "listicle",
    name: "Listicle",
    desc: "Scannable numbered list articles",
    category: "Content",
    mode: "blog",
    starterPrompt:
      "Write a listicle: '[number] ways to [goal]'. Give each item a bolded heading, a 2-3 sentence explanation, and a practical takeaway.",
  },
  {
    id: "how-to-guide",
    name: "How-To Guide",
    desc: "Step-by-step tutorials that are easy to follow",
    category: "Content",
    mode: "blog",
    starterPrompt:
      "Write a step-by-step how-to guide for: [task]. Start with what the reader needs, then give numbered steps, common mistakes, and a troubleshooting section.",
  },
  {
    id: "podcast-show-notes",
    name: "Podcast Show Notes",
    desc: "Episode summaries with timestamps and links",
    category: "Content",
    mode: "custom",
    starterPrompt:
      "Write podcast show notes for an episode about: [topic]. Include a short summary, 5 key takeaways, and placeholder timestamps for each segment.",
  },

  // ---------- Marketing ----------
  {
    id: "google-ads",
    name: "Google Ads",
    desc: "High-converting ad copy for search campaigns",
    category: "Marketing",
    mode: "custom",
    starterPrompt:
      "Write Google Ads copy for: [product]. Provide 3 headline variants (30 chars), 2 descriptions (90 chars), and note the main keyword each targets.",
  },
  {
    id: "facebook-ads",
    name: "Facebook / Meta Ads",
    desc: "Scroll-stopping ad copy for social campaigns",
    category: "Marketing",
    mode: "social",
    starterPrompt:
      "Write Facebook ad copy for: [offer]. Give a hook, short body, and 3 headline variants aimed at [audience].",
  },
  {
    id: "landing-page-hero",
    name: "Landing Page Hero",
    desc: "Above-the-fold headline and subheadline",
    category: "Marketing",
    mode: "custom",
    starterPrompt:
      "Write 5 hero headline + subheadline pairs for: [product]. Each headline under 10 words, each subheadline clarifies the value in one sentence.",
  },
  {
    id: "tagline-slogan",
    name: "Tagline & Slogan",
    desc: "Short, memorable brand lines",
    category: "Marketing",
    mode: "custom",
    starterPrompt:
      "Write 10 tagline options for: [brand]. Keep each under 6 words, varied in tone (bold, friendly, premium, playful).",
  },
  {
    id: "email-marketing",
    name: "Email Marketing",
    desc: "Compelling emails that drive clicks and sales",
    category: "Marketing",
    mode: "email",
    starterPrompt:
      "Write a marketing email for: [campaign]. Include a compelling subject line, a short benefit-led body, and one clear call to action.",
  },

  // ---------- Email ----------
  {
    id: "cold-outreach",
    name: "Cold Outreach",
    desc: "Cold emails that actually get replies",
    category: "Email",
    mode: "email",
    starterPrompt:
      "Write a cold outreach email to: [recipient role] about [offer]. Keep it under 120 words, lead with their problem, and ask for a short call.",
  },
  {
    id: "follow-up-email",
    name: "Follow-Up Email",
    desc: "Polite nudges without being annoying",
    category: "Email",
    mode: "email",
    starterPrompt:
      "Write a friendly follow-up email after: [previous touchpoint]. Reference the earlier message, add one new piece of value, and make the ask tiny.",
  },
  {
    id: "thank-you-email",
    name: "Thank-You Email",
    desc: "Gratitude that strengthens relationships",
    category: "Email",
    mode: "email",
    starterPrompt:
      "Write a thank-you email to: [person] for [reason]. Be specific about what you appreciate and end warmly.",
  },
  {
    id: "apology-email",
    name: "Apology Email",
    desc: "Sincere, professional apologies",
    category: "Email",
    mode: "email",
    starterPrompt:
      "Write a professional apology email for: [situation]. Acknowledge the issue, take responsibility, explain the fix, and offer a concrete next step.",
  },
  {
    id: "meeting-request",
    name: "Meeting Request",
    desc: "Clear asks that get time on the calendar",
    category: "Email",
    mode: "email",
    starterPrompt:
      "Write a meeting request email about: [topic]. State the purpose, proposed length, and 2-3 suggested times.",
  },

  // ---------- Social ----------
  {
    id: "social-media",
    name: "Social Media",
    desc: "Engaging posts for Twitter, LinkedIn, Instagram",
    category: "Social",
    mode: "social",
    starterPrompt:
      "Write a social media post about: [topic]. Hook the reader in the first line, keep it tight, and add 3-5 relevant hashtags.",
  },
  {
    id: "linkedin-post",
    name: "LinkedIn Post",
    desc: "Professional thought-leadership posts",
    category: "Social",
    mode: "social",
    starterPrompt:
      "Write a LinkedIn post about: [insight or experience]. Open with a strong first line, use short paragraphs, and end with a question to invite comments.",
  },
  {
    id: "twitter-thread",
    name: "X / Twitter Thread",
    desc: "Multi-post threads that hold attention",
    category: "Social",
    mode: "social",
    starterPrompt:
      "Write a 7-tweet thread about: [topic]. Tweet 1 is the hook, tweets 2-6 deliver one idea each, tweet 7 is the takeaway and CTA.",
  },
  {
    id: "instagram-caption",
    name: "Instagram Caption",
    desc: "Captions with hooks and hashtags",
    category: "Social",
    mode: "social",
    starterPrompt:
      "Write an Instagram caption for: [post]. Include a hook, a short story or insight, a call to action, and 5-8 hashtags.",
  },
  {
    id: "product-launch-social",
    name: "Launch Announcement",
    desc: "Announce a launch across channels",
    category: "Social",
    mode: "social",
    starterPrompt:
      "Write a product launch announcement for: [product]. Cover what it is, who it is for, the key benefit, and where to try it.",
  },

  // ---------- Professional ----------
  {
    id: "press-release",
    name: "Press Release",
    desc: "Professional press releases for media outreach",
    category: "Professional",
    mode: "custom",
    starterPrompt:
      "Write a press release for: [announcement]. Use a standard structure with dateline, headline, summary, body, boilerplate, and contact info.",
  },
  {
    id: "case-study",
    name: "Case Study",
    desc: "Customer success stories that build trust",
    category: "Professional",
    mode: "blog",
    starterPrompt:
      "Write a customer case study for: [customer]. Cover the challenge, the approach, the measurable results, and a closing quote.",
  },
  {
    id: "white-paper",
    name: "White Paper",
    desc: "In-depth white papers for thought leadership",
    category: "Professional",
    mode: "blog",
    starterPrompt:
      "Write a white paper outline and opening section on: [topic]. Include an executive summary, problem framing, methodology, and key findings.",
  },
  {
    id: "job-description",
    name: "Job Description",
    desc: "Attract the right candidates with clear JDs",
    category: "Professional",
    mode: "custom",
    starterPrompt:
      "Write a job description for: [role]. Include role summary, responsibilities, requirements, and what makes the team worth joining.",
  },
  {
    id: "performance-review",
    name: "Performance Review",
    desc: "Constructive, specific feedback",
    category: "Professional",
    mode: "custom",
    starterPrompt:
      "Write a performance review for: [role]. Balance specific strengths with concrete growth areas, and suggest 2-3 goals for next quarter.",
  },
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    desc: "Clean summaries with decisions and action items",
    category: "Professional",
    mode: "custom",
    starterPrompt:
      "Turn these rough points into clean meeting notes: [notes]. Organize into decisions, action items with owners, and open questions.",
  },

  // ---------- Creative ----------
  {
    id: "story",
    name: "Story",
    desc: "Compelling short stories or novel chapters",
    category: "Creative",
    mode: "custom",
    starterPrompt:
      "Write a short story opening about: [premise]. Establish the setting, introduce a character with a clear want, and end on a hook.",
  },
  {
    id: "poem",
    name: "Poem",
    desc: "Beautiful poetry in any style or form",
    category: "Creative",
    mode: "custom",
    starterPrompt:
      "Write a poem about: [subject] in [style, e.g. free verse]. Aim for vivid imagery and a strong closing line.",
  },
  {
    id: "script",
    name: "Script",
    desc: "Screenplays, stage plays, or video scripts",
    category: "Creative",
    mode: "custom",
    starterPrompt:
      "Write a short script scene between: [characters] about [situation]. Use standard formatting with character names and brief stage directions.",
  },
  {
    id: "character",
    name: "Character Description",
    desc: "Rich, detailed character profiles",
    category: "Creative",
    mode: "custom",
    starterPrompt:
      "Write a character profile for: [character]. Cover appearance, background, core motivation, fatal flaw, and a distinctive habit.",
  },
  {
    id: "worldbuilding",
    name: "Worldbuilding",
    desc: "Coherent settings for fiction and games",
    category: "Creative",
    mode: "custom",
    starterPrompt:
      "Describe a fictional setting for: [genre]. Cover geography, culture, power structures, and one interesting conflict.",
  },

  // ---------- SEO ----------
  {
    id: "seo-article",
    name: "SEO Article",
    desc: "Articles structured to rank",
    category: "SEO",
    mode: "blog",
    starterPrompt:
      "Write an SEO article targeting the keyword: [keyword]. Use it in the title, first paragraph, one H3, and naturally through the body. Aim for depth and scannability.",
  },
  {
    id: "meta-description",
    name: "Meta Description",
    desc: "Click-worthy descriptions under 160 chars",
    category: "SEO",
    mode: "custom",
    starterPrompt:
      "Write 5 meta descriptions for a page about: [topic]. Keep each under 160 characters and include a reason to click.",
  },
  {
    id: "product-comparison",
    name: "Product Comparison",
    desc: "X vs Y comparison pages that convert",
    category: "SEO",
    mode: "blog",
    starterPrompt:
      "Write a comparison article: [product A] vs [product B]. Compare pricing, features, ease of use, and give a clear recommendation for each type of user.",
  },
  {
    id: "faq-section",
    name: "FAQ Section",
    desc: "Structured Q&A blocks for SEO",
    category: "SEO",
    mode: "custom",
    starterPrompt:
      "Write an FAQ section for: [product or topic]. Give 8 common questions with concise, direct answers suitable for FAQ schema.",
  },
  {
    id: "pillar-outline",
    name: "Pillar Page Outline",
    desc: "Topic cluster outlines for content strategy",
    category: "SEO",
    mode: "blog",
    starterPrompt:
      "Create a pillar page outline for the topic: [topic]. Include the main H2 sections, supporting subtopics, and suggested internal link targets.",
  },
];

export function getTemplateById(id: string): WritingTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(): {
  category: string;
  templates: WritingTemplate[];
}[] {
  return TEMPLATE_CATEGORIES.map((category) => ({
    category,
    templates: TEMPLATES.filter((t) => t.category === category),
  })).filter((group) => group.templates.length > 0);
}
