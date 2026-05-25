import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-emerald-600" />
      </div>
      <h3 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">{description}</p>
      {actionLabel && (actionHref || actionOnClick) && (
        actionHref ? (
          <Link href={actionHref} className="btn-primary text-sm">
            {actionLabel}
          </Link>
        ) : (
          <button onClick={actionOnClick} className="btn-primary text-sm">
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
