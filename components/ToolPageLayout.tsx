import { AdSlot } from "@/components/AdSlot";
import { AffiliateCard } from "@/components/AffiliateCard";

export interface ToolFaq {
  question: string;
  answer: string;
}

/**
 * Shared shell for the free, local-computation tool pages.
 * Server-rendered for SEO (metadata + FAQ JSON-LD) and wraps the interactive
 * client tool. Includes an in-article ad slot and contextual affiliate card.
 */
export function ToolPageLayout({
  title,
  intro,
  faqs,
  children,
}: {
  title: string;
  intro: string;
  faqs: ToolFaq[];
  children: React.ReactNode;
}) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      <section className="pt-20 pb-6 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-display font-extrabold mb-3 text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">
            {intro}
          </p>
          <p className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Free · runs in your browser · no signup · no API
          </p>
        </div>
      </section>

      <section className="pb-6 px-4">
        <div className="max-w-3xl mx-auto">{children}</div>
      </section>

      <section className="pb-10 px-4">
        <div className="max-w-3xl mx-auto">
          <AdSlot slot="inarticle" className="my-6" />
          <AffiliateCard placement="tools" className="my-6" />
        </div>
      </section>

      <section className="pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <details
                key={i}
                className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/50"
              >
                <summary className="font-medium cursor-pointer text-slate-900 dark:text-white">
                  {f.question}
                </summary>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </main>
  );
}
