import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SessionProvider } from "@/components/SessionProvider";
import { Providers } from "@/app/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tryaiwriter.com"),
  title: "Use AI Writer — Claude-Powered AI Writing Tool | Try Free",
  description: "Write blog posts, emails, and social media content 3x faster. Claude-powered AI writer that learns your brand voice. Start free — no credit card required.",
  openGraph: {
    title: "Use AI Writer — Claude-Powered AI Writing Tool",
    description: "Write blog posts, emails, and social media content 3x faster with Claude-powered AI.",
    url: "https://tryaiwriter.com",
    siteName: "Use AI Writer",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Use AI Writer — Claude-Powered",
    description: "Write blog posts, emails, and social media content 3x faster with Claude-powered AI.",
    images: ["/og-image.png"],
  },
};

// BreadcrumbList structured data for all pages
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://tryaiwriter.com/"
    }
  ]
};

// Organization structured data
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Use AI Writer",
  "url": "https://tryaiwriter.com",
  "logo": "https://tryaiwriter.com/logo.png",
  "sameAs": [
    "https://twitter.com/useaiwriter",
    "https://github.com/useaiwriter"
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload critical fonts */}
        <link 
          rel="preload" 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap" 
          as="style"
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght=400;500;600;700&family=Playfair+Display:wght=700;800&family=JetBrains+Mono:wght=400;500&display=swap" 
          rel="stylesheet"
        />

        {/* Favicon */}
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='48' fill='none' stroke='url(#g)' stroke-width='2' opacity='0.3'/><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' style='stop-color:%235b9cf5'/><stop offset='100%25' style='stop-color:%239b6dff'/></linearGradient></defs><circle cx='50' cy='50' r='44' fill='rgba(255,255,255,0.04)'/><path d='M50 30 L55 20 L58 25 L53 32 Z' fill='%235b9cf5'/><path d='M55 20 Q62 25 65 35 Q60 30 55 25 Z' fill='%239b6dff' opacity='0.6'/><path d='M55 20 Q58 15 60 10 Q58 18 55 20 Z' fill='%239b6dff' opacity='0.4'/><circle cx='53' cy='35' r='2' fill='%239b6dff'><animate attributeName='opacity' values='0.5;1;0.5' dur='2s' repeatCount='indefinite'/></circle></svg>"
        />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        
        {/* LCP Performance Monitoring */}
        <script
          dangerouslySetInnerHTML={{ __html: `
            if (typeof window !== 'undefined') {
              try {
                const observer = new PerformanceObserver((list) => {
                  for (const entry of list.getEntries()) {
                    console.log('[LCP] Largest Contentful Paint:', entry.startTime, entry.element);
                  }
                });
                observer.observe({ entryTypes: ['largest-contentful-paint'] });
                
                const clsObserver = new PerformanceObserver((list) => {
                  for (const entry of list.getEntries()) {
                    console.log('[CLS] Cumulative Layout Shift:', entry.value);
                  }
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
              } catch (e) {
                // Ignore errors if browser doesn't support
              }
            }
          `}}
        />
      </head>
      <body className="min-h-screen">
        <SessionProvider>
          <Providers>
            <div className="page-transition">
              {children}
            </div>
          </Providers>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
