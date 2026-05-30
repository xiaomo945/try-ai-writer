import React from "react";
import {
  FileText,
  Search,
  Sparkles,
  MessageSquare,
  Layers,
  Bot,
  Zap,
  BookOpen,
  TrendingUp,
  Users,
  Settings,
} from "lucide-react";

type EmptyStateType =
  | "no-history"
  | "no-brand-voice"
  | "no-content"
  | "no-results"
  | "no-memory"
  | "no-internet"
  | "custom";

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  icon?: React.ComponentType<any>;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

const emptyStateConfig: Record<
  EmptyStateType,
  {
    icon: React.ComponentType<any>;
    title: string;
    description: string;
    iconBg: string;
  }
> = {
  "no-history": {
    icon: FileText,
    title: "No History Yet",
    description: "You haven't created any content yet. Start your first writing session!",
    iconBg: "bg-blue-500/10",
  },
  "no-brand-voice": {
    icon: Layers,
    title: "Brand Voice Not Set",
    description: "AI hasn't learned your style yet. Go to writing page to enable brand voice learning!",
    iconBg: "bg-purple-500/10",
  },
  "no-content": {
    icon: Sparkles,
    title: "Your Content Will Appear Here",
    description: "Describe what you need and let AI help you create amazing content!",
    iconBg: "bg-amber-500/10",
  },
  "no-results": {
    icon: Search,
    title: "No Results Found",
    description: "We couldn't find anything matching your search. Try different keywords!",
    iconBg: "bg-slate-500/10",
  },
  "no-memory": {
    icon: MessageSquare,
    title: "Memory Bank Is Empty",
    description: "Start a conversation with your AI twin to build your knowledge base!",
    iconBg: "bg-emerald-500/10",
  },
  "no-internet": {
    icon: Zap,
    title: "Connection Lost",
    description: "Check your internet connection and try again.",
    iconBg: "bg-red-500/10",
  },
  custom: {
    icon: Sparkles,
    title: "Nothing Here Yet",
    description: "Start exploring to discover amazing features!",
    iconBg: "bg-slate-500/10",
  },
};

export function EmptyState({
  type,
  title,
  description,
  icon: IconProp,
  action,
  className = "",
  compact = false,
}: EmptyStateProps) {
  const config = emptyStateConfig[type];
  const Icon = IconProp || config.icon;

  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-6" : "py-12 md:py-20"} ${className}`}>
      {/* Icon */}
      <div className={`mb-6 ${compact ? "w-12 h-12" : "w-20 h-20"} rounded-full ${config.iconBg} flex items-center justify-center`}>
        <Icon className={`${compact ? "w-6 h-6" : "w-10 h-10"} text-white/80`} />
      </div>

      {/* Title */}
      <h3 className={`${compact ? "text-lg" : "text-xl md:text-2xl"} font-display font-bold text-white mb-2`}>
        {title || config.title}
      </h3>

      {/* Description */}
      <p className={`${compact ? "text-sm" : "text-sm md:text-base"} text-slate-400 mb-6 max-w-md`}>
        {description || config.description}
      </p>

      {/* Action */}
      {action && <div className="w-full max-w-xs">{action}</div>}
    </div>
  );
}

// Predefined empty state variants for common use cases
export function EmptyHistory({ action }: { action?: React.ReactNode }) {
  return <EmptyState type="no-history" action={action} />;
}

export function EmptyBrandVoice({ action }: { action?: React.ReactNode }) {
  return <EmptyState type="no-brand-voice" action={action} />;
}

export function EmptyContent({ action }: { action?: React.ReactNode }) {
  return <EmptyState type="no-content" action={action} />;
}

export function EmptyResults({ action }: { action?: React.ReactNode }) {
  return <EmptyState type="no-results" action={action} />;
}

export function EmptyMemory({ action }: { action?: React.ReactNode }) {
  return <EmptyState type="no-memory" action={action} />;
}
