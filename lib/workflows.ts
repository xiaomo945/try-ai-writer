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
  /** Groups presets in the picker. Business/marketing vs. fiction craft. */
  category?: WorkflowCategory;
  steps: WorkflowStep[];
  isPreset?: boolean;
  createdAt: string;
  publishedAt?: string;
  author?: string;
}

export type WorkflowCategory = "business" | "fiction";

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
      category: "business",
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
      category: "business",
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
      category: "business",
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
      category: "business",
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
      category: "business",
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
      category: "business",
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

    // ── Fiction ────────────────────────────────────────────────────────────
    // Ordered the way novelists actually work: you earn the right to draft a
    // scene only after you know whose scene it is and what it costs them.
    {
      id: "preset-short-story",
      name: "短篇小说",
      description: "从一句话前提到可发表的完整短篇，逐步落地",
      icon: "🖋️",
      category: "fiction",
      steps: [
        {
          id: "story-premise",
          title: "核心前提",
          prompt: "把用户给的想法压缩成一句有力的故事前提：谁，在什么处境下，想要什么，而什么挡在中间。用一句话说完，不超过 40 字。然后列出这个故事成立需要的三个支点。",
          type: "generate",
        },
        {
          id: "story-characters",
          title: "人物速写",
          prompt: "基于上面的前提，写出主要人物的速写：外在目标（他以为自己要什么）、内在需求（他真正需要什么）、以及一个塑造了他的过去事件。每个人物再给一个只有他会有的说话方式或小动作。",
          type: "generate",
        },
        {
          id: "story-beats",
          title: "场面节拍",
          prompt: "把故事拆成 5-7 个场面节拍。每个节拍写清：这一场发生在哪、谁在场、发生了什么转折、结束时人物的处境如何变化。最后一场必须是不可逆的。",
          type: "generate",
        },
        {
          id: "story-draft",
          title: "初稿",
          prompt: "按节拍表写出完整初稿。用具体动作和感官细节推进，人物说话要有各自的口吻差异，不要概括性叙述，不要解释人物在想什么，用行为和对话呈现。",
          type: "generate",
        },
        {
          id: "story-polish",
          title: "打磨",
          prompt: "通读初稿并打磨：删掉所有解释性旁白和形容词堆砌，强化开头第一句的吸引力，检查结尾是否兑现了前提。逐条列出你改了什么、为什么改，然后给出定稿。",
          type: "edit",
        },
      ],
      isPreset: true,
      createdAt: "2025-01-01T00:00:00.000Z",
    },
    {
      id: "preset-novel-chapter",
      name: "小说章节",
      description: "单章写作：从场次目标到留钩子的结尾",
      icon: "📖",
      category: "fiction",
      steps: [
        {
          id: "chapter-goal",
          title: "场次目标",
          prompt: "明确这一章的任务：这一场由谁推动、他想要什么、失败会怎样。再写清这一章结束时必须发生的那个不可逆变化。一句话概括本章在全书中的作用。",
          type: "generate",
        },
        {
          id: "chapter-opening",
          title: "开场",
          prompt: "写这一章的开场。要求：第一句就把读者放进具体时空和具体处境，不要从天气或回忆开始。用一个正在发生的动作或冲突开场。",
          type: "generate",
        },
        {
          id: "chapter-draft",
          title: "章节草稿",
          prompt: "基于场次目标和开场，写完这一章。按场面分段，描写与对话并重。人物说话要能听出区别，不要用'他说''她说'以外的提示语硬造节奏。遇到情绪转折点放慢，用细节撑住。",
          type: "generate",
        },
        {
          id: "chapter-dialogue",
          title: "对话打磨",
          prompt: "只处理对话：删掉所有寒暄和解释性台词，给每个人物加上潜台词（嘴上说的和真正想要的不一样），让冲突在对话里发生而不是被叙述出来。保留对话原有的意思。",
          type: "edit",
        },
        {
          id: "chapter-hook",
          title: "结尾钩子",
          prompt: "重写本章最后一段，让它在收束本场的同时抛出下一个疑问：一个新信息、一个突然的转折，或一个未回答的问题。不要写成总结句。",
          type: "edit",
        },
      ],
      isPreset: true,
      createdAt: "2025-01-01T00:00:00.000Z",
    },
    {
      id: "preset-character",
      name: "人物塑造",
      description: "造一个站得住的人物：欲望、伤口、声音、弧光",
      icon: "🎭",
      category: "fiction",
      steps: [
        {
          id: "char-wound",
          title: "背景与伤口",
          prompt: "塑造这个人物的过去：一个塑造了其核心信念的具体事件。写清这件事发生时他多大、他当时做了什么选择、这个选择让他得出了什么关于世界的结论。这个结论日后会害他。",
          type: "generate",
        },
        {
          id: "char-want-fear",
          title: "欲望与恐惧",
          prompt: "区分两个层次：外在目标（他以为自己要的、可量化的东西）和内在需求（他真正缺的、自己意识不到的）。再写出他最怕发生的事——恐惧必须和上面的伤口同源。",
          type: "generate",
        },
        {
          id: "char-voice",
          title: "声音与习惯",
          prompt: "设计这个人物独有的说话方式：用词范围、句子长短、口头禅、回避的话题、说谎时的特征。再给两个只有他会做的小动作（一个在紧张时，一个在得意时）。写一段 100 字的他说话的样例。",
          type: "generate",
        },
        {
          id: "char-arc",
          title: "人物弧光",
          prompt: "设计弧光：他从错误信念走向什么真相，故事中哪个时刻他第一次动摇，哪个时刻他必须做出与开篇相反的选择。给出这个选择会让他付出什么代价。",
          type: "generate",
        },
      ],
      isPreset: true,
      createdAt: "2025-01-01T00:00:00.000Z",
    },
    {
      id: "preset-dialogue-scene",
      name: "对话场景",
      description: "写一段有潜台词的对话，让冲突在台词里发生",
      icon: "💬",
      category: "fiction",
      steps: [
        {
          id: "dialogue-subtext",
          title: "潜台词设定",
          prompt: "在写台词之前先定好：这场对话里每个人分别想要什么、谁绝对不能把什么说出口、谁在撒谎。再写清权力关系在对话过程中如何变化。",
          type: "generate",
        },
        {
          id: "dialogue-draft",
          title: "对话草稿",
          prompt: "写出对话。规则：每句台词都要有目的，不许有寒暄和复述已知信息；人物靠打断、答非所问、突然沉默来推进；动作提示语要短，只用必要的。",
          type: "generate",
        },
        {
          id: "dialogue-tighten",
          title: "收紧节奏",
          prompt: "压缩对话：删掉所有可以直接删掉而不损失意思的句子，把说出来的东西尽量改成暗示，检查每个转折是否来得突然。保留原意，输出收紧后的版本。",
          type: "edit",
        },
      ],
      isPreset: true,
      createdAt: "2025-01-01T00:00:00.000Z",
    },
    {
      id: "preset-worldbuilding",
      name: "世界观构建",
      description: "搭一个能支撑故事的世界，而不是堆设定",
      icon: "🌍",
      category: "fiction",
      steps: [
        {
          id: "world-rules",
          title: "规则与代价",
          prompt: "定下这个世界的三条硬规则。关键：每条规则必须写明违反或使用的代价——没有代价的规则不会产生冲突，也就产生不了故事。",
          type: "generate",
        },
        {
          id: "world-society",
          title: "社会与日常",
          prompt: "描述普通人在这个世界里的一天：靠什么谋生、怕什么、什么是稀缺的。从具体人的日常切入，不要写百科条目。给出两个能体现阶层差异的细节。",
          type: "generate",
        },
        {
          id: "world-history",
          title: "冲突源头",
          prompt: "写一段塑造了现状的历史：一场具体的争端、背叛或灾难，以及它留下的至今没人解决的东西。这段历史必须能直接生成当下的矛盾。",
          type: "generate",
        },
        {
          id: "world-hooks",
          title: "与故事的咬合",
          prompt: "把上面的设定收束到故事上：列出 3 个可以直接开场的冲突起点，每个都要说明它利用了哪条世界规则、代价是什么、谁会被卷进去。",
          type: "review",
        },
      ],
      isPreset: true,
      createdAt: "2025-01-01T00:00:00.000Z",
    },
    {
      id: "preset-mystery-plot",
      name: "悬疑情节",
      description: "设计谜面、埋线索、布误导、收网",
      icon: "🔎",
      category: "fiction",
      steps: [
        {
          id: "mystery-answer",
          title: "先定真相",
          prompt: "先写下真相：谁做的、怎么做到的、动机是什么。再写清这件事表面看起来像什么——读者会被引导去相信的那个错误版本。真相必须比表面版本更合理，不能靠巧合。",
          type: "generate",
        },
        {
          id: "mystery-clues",
          title: "线索布局",
          prompt: "把真相当成已知答案往回埋线索。列出 6-8 条线索，每条注明：出现在第几场、以什么面目出现、读者此刻会怎么误读它。线索必须分散在不同场次，不能集中。",
          type: "generate",
        },
        {
          id: "mystery-herrings",
          title: "误导与反转",
          prompt: "设计 2-3 条指向错误答案的误导，每条都要有独立的合理性（不能是为了骗而骗）。再设计一个反转：读者在某个时刻意识到自己一直理解错了什么。说明这个反转由哪条早先埋下的线索支撑。",
          type: "generate",
        },
        {
          id: "mystery-reveal",
          title: "揭示场景",
          prompt: "写揭示真相的那一场。要求：揭示必须通过人物主动的选择和行动完成，不能靠角色站出来解释。写清揭示后每个人物付出了什么代价。",
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

function getWorkflowsByCategory(category: WorkflowCategory): WorkflowDefinition[] {
  return getPresetWorkflows().filter((w) => w.category === category);
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
  getWorkflowsByCategory,
  getCustomWorkflows,
  saveCustomWorkflow,
  deleteCustomWorkflow,
  publishWorkflow,
  unpublishWorkflow,
  getCommunityWorkflows,
  isWorkflowPublished,
  getAllWorkflows,
};
