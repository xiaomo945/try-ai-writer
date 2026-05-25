import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SessionProvider } from "@/components/SessionProvider";
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap" 
          rel="stylesheet"
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
          {children}
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
