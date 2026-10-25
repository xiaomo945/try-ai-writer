import { getAffiliates } from "@/lib/affiliates";

/**
 * Renders the operator's contextual affiliate offers for a placement.
 * Pure/server-rendered, no client JS, no third-party scripts.
 */
export function AffiliateCard({
  placement,
  className = "",
}: {
  placement: string;
  className?: string;
}) {
  const items = getAffiliates(placement);
  if (items.length === 0) return null;

  return (
    <div className={`affiliate-stack space-y-3 ${className}`}>
      {items.map((item) => (
        <a
          key={item.id}
          href={item.href}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="block rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-4 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors"
        >
          <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            Sponsored
          </span>
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
            {item.title}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
            {item.description}
          </p>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {item.cta} →
          </span>
        </a>
      ))}
    </div>
  );
}
