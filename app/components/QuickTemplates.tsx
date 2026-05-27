"use client";

interface QuickTemplate {
  id: string;
  icon: string;
  title: string;
  template: string;
}

const templates: QuickTemplate[] = [
  {
    id: "blog-post",
    icon: "📝",
    title: "Blog Post",
    template: "Write a blog post about [topic]"
  },
  {
    id: "professional-email",
    icon: "📧",
    title: "Professional Email",
    template: "Draft a professional email for [purpose]"
  },
  {
    id: "social-media",
    icon: "📱",
    title: "Social Media",
    template: "Create social media captions for [product]"
  },
  {
    id: "amazon-listing",
    icon: "🛒",
    title: "Amazon Listing",
    template: "Write an Amazon listing for [product]"
  },
  {
    id: "newsletter",
    icon: "📬",
    title: "Newsletter",
    template: "Draft a newsletter about [topic]"
  },
  {
    id: "creative-story",
    icon: "✨",
    title: "Creative Story",
    template: "Write a creative story about [idea]"
  }
];

interface QuickTemplatesProps {
  onSelectTemplate: (template: string) => void;
}

export function QuickTemplates({ onSelectTemplate }: QuickTemplatesProps) {
  const handleSelect = (template: QuickTemplate) => {
    onSelectTemplate(template.template);
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">⚡</span>
        <h3 className="font-display font-bold text-white">Quick Start Templates</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleSelect(template)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-center group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">{template.icon}</span>
            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
              {template.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
