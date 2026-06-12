"use client";

import { createStorage } from "./storage";

const storage = createStorage("workflows");

interface WorkflowStep {
  id: string;
  title: string;
  prompt: string;
  type: "generate" | "edit" | "review";
}

interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  steps: WorkflowStep[];
  isPreset?: boolean;
  createdAt: string;
  publishedAt?: string;
  author?: string;
}

interface AllWorkflows {
  presets: WorkflowDefinition[];
  custom: WorkflowDefinition[];
  community: WorkflowDefinition[];
}

function getPresetWorkflows(): WorkflowDefinition[] {
  return [
    {
      id: "preset-blog-post",
      name: "Blog Post Writer",
      description: "Write engaging blog posts from outline to polished draft",
      icon: "📝",
      steps: [
        {
          id: "blog-outline",
          title: "Outline",
          prompt: "Create a detailed outline for a blog post on the given topic, including main sections, subpoints, and key takeaways.",
          type: "generate",
        },
        {
          id: "blog-draft",
          title: "Draft",
          prompt: "Write a complete first draft of the blog post based on the outline, focusing on clear structure and engaging content.",
          type: "generate",
        },
        {
          id: "blog-polish",
          title: "Polish",
          prompt: "Review and polish the draft for clarity, tone, grammar, and flow. Improve word choice and ensure the conclusion is strong.",
          type: "edit",
        },
      ],
      isPreset: true,
      createdAt: "2025-01-01T00:00:00.000Z",
    },
    {
      id: "preset-email-sequence",
      name: "Email Sequence",
      description: "Craft a complete email sequence from subject lines to follow-ups",
      icon: "📧",
      steps: [
        {
          id: "email-subjects",
          title: "Subject Lines",
          prompt: "Generate 5 compelling subject line options for the email sequence. Each should be concise, curiosity-driven, and optimized for open rates.",
          type: "generate",
        },
        {
          id: "email-body",
          title: "Body",
          prompt: "Write the email body copy based on the chosen subject line. Keep it concise, persuasive, and include a clear call-to-action.",
          type: "generate",
        },
        {
          id: "email-followup",
          title: "Follow-up",
          prompt: "Write a follow-up email that references the previous message, adds new value, and creates urgency without being pushy.",
          type: "generate",
        },
      ],
      isPreset: true,
      createdAt: "2025-01-01T00:00:00.000Z",
    },
    {
      id: "preset-social-media",
      name: "Social Media Pack",
      description: "Create scroll-stopping social media content with hooks and captions",
      icon: "📱",
      steps: [
        {
          id: "social-hook",
          title: "Hook",
          prompt: "Write an attention-grabbing hook for a social media post. It should stop the scroll and make the reader want to continue.",
          type: "generate",
        },
        {
          id: "social-post",
          title: "Post",
          prompt: "Write the main social media post content that delivers on the hook's promise. Keep it engaging, concise, and platform-appropriate.",
          type: "generate",
        },
        {
          id: "social-caption",
          title: "Caption",
          prompt: "Write a caption that complements the post, includes relevant hashtags, and encourages engagement through a question or call-to-action.",
          type: "generate",
        },
      ],
      isPreset: true,
      createdAt: "2025-01-01T00:00:00.000Z",
    },
    {
      id: "preset-seo-article",
      name: "SEO Article",
      description: "Produce search-optimized articles with keyword research and on-page SEO",
      icon: "🔍",
      steps: [
        {
          id: "seo-keywords",
          title: "Keyword Research",
          prompt: "Identify primary and secondary keywords for the article topic. Include search intent analysis and suggest long-tail variations.",
          type: "generate",
        },
        {
          id: "seo-outline",
          title: "Outline",
          prompt: "Create an SEO-optimized outline using the target keywords. Structure headings (H2/H3) to target featured snippets and answer common questions.",
          type: "generate",
        },
        {
          id: "seo-draft",
          title: "Draft",
          prompt: "Write a comprehensive article draft based on the outline. Naturally incorporate target keywords and maintain readability.",
          type: "generate",
        },
        {
          id: "seo-optimize",
          title: "Optimize",
          prompt: "Review the draft for SEO optimization: keyword density, meta description, internal linking suggestions, and content completeness. Suggest improvements.",
          type: "review",
        },
      ],
      isPreset: true,
      createdAt: "2025-01-01T00:00:00.000Z",
    },
    {
      id: "preset-product-description",
      name: "Product Description",
      description: "Write compelling product descriptions that highlight features and benefits",
      icon: "🛍️",
      steps: [
        {
          id: "product-features",
          title: "Features",
          prompt: "List and describe the key features of the product. Focus on what makes each feature unique and how it works.",
          type: "generate",
        },
        {
          id: "product-benefits",
          title: "Benefits",
          prompt: "Translate each feature into a customer benefit. Explain how each feature solves a problem or improves the user's life.",
          type: "generate",
        },
        {
          id: "product-description",
          title: "Description",
          prompt: "Write a compelling product description that weaves together features and benefits. Include a strong opening, persuasive body, and clear call-to-action.",
          type: "generate",
        },
      ],
      isPreset: true,
      createdAt: "2025-01-01T00:00:00.000Z",
    },
    {
      id: "preset-press-release",
      name: "Press Release",
      description: "Create professional press releases with headlines, body, and quotes",
      icon: "📰",
      steps: [
        {
          id: "pr-headline",
          title: "Headline",
          prompt: "Write a clear, attention-grabbing press release headline that summarizes the news and includes the company name. Keep it under 100 characters.",
          type: "generate",
        },
        {
          id: "pr-body",
          title: "Body",
          prompt: "Write the press release body following the inverted pyramid structure. Include the who, what, when, where, and why in the opening paragraph, then expand with details.",
          type: "generate",
        },
        {
          id: "pr-quotes",
          title: "Quotes",
          prompt: "Write 2-3 professional quotes from key stakeholders that add credibility and a human element to the press release. Each quote should sound authentic and reinforce the key message.",
          type: "generate",
        },
      ],
      isPreset: true,
      createdAt: "2025-01-01T00:00:00.000Z",
    },
  ];
}

function getCustomWorkflows(): WorkflowDefinition[] {
  return storage.get<WorkflowDefinition[]>("custom") ?? [];
}

function saveCustomWorkflow(workflow: WorkflowDefinition): void {
  const existing = getCustomWorkflows();
  const index = existing.findIndex((w) => w.id === workflow.id);
  if (index >= 0) {
    existing[index] = workflow;
  } else {
    existing.push(workflow);
  }
  storage.set("custom", existing);
}

function deleteCustomWorkflow(workflowId: string): void {
  const existing = getCustomWorkflows();
  const filtered = existing.filter((w) => w.id !== workflowId);
  storage.set("custom", filtered);
}

function publishWorkflow(workflow: WorkflowDefinition): void {
  const community = getCommunityWorkflows();
  const published: WorkflowDefinition = {
    ...workflow,
    publishedAt: new Date().toISOString(),
    author: workflow.author ?? "Anonymous",
  };
  community.push(published);
  storage.set("community", community);
}

function unpublishWorkflow(workflowId: string): void {
  const community = getCommunityWorkflows();
  const filtered = community.filter((w) => w.id !== workflowId);
  storage.set("community", filtered);
}

function getCommunityWorkflows(): WorkflowDefinition[] {
  const workflows = storage.get<WorkflowDefinition[]>("community") ?? [];
  return workflows.sort((a, b) => {
    const dateA = a.publishedAt ?? "";
    const dateB = b.publishedAt ?? "";
    return dateB.localeCompare(dateA);
  });
}

function isWorkflowPublished(workflowId: string): boolean {
  const community = getCommunityWorkflows();
  return community.some((w) => w.id === workflowId);
}

function getAllWorkflows(): AllWorkflows {
  return {
    presets: getPresetWorkflows(),
    custom: getCustomWorkflows(),
    community: getCommunityWorkflows(),
  };
}

export type { WorkflowStep, WorkflowDefinition, AllWorkflows };
export {
  getPresetWorkflows,
  getCustomWorkflows,
  saveCustomWorkflow,
  deleteCustomWorkflow,
  publishWorkflow,
  unpublishWorkflow,
  getCommunityWorkflows,
  isWorkflowPublished,
  getAllWorkflows,
};
