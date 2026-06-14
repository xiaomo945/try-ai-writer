import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SessionProvider } from "@/components/SessionProvider";
import { Providers } from "@/app/components/Providers";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tryaiwriter.com"),
  title: "Try AI Writer — Free AI Writing Tool That Learns Your Voice | Start Writing Now",
  description: "Try AI Writer is a free AI writing assistant that learns your brand voice. Generate blog posts, emails, and social media content in seconds. Start writing now — no credit card required.",
  keywords: ["AI writing tool", "free AI writer", "brand voice learning", "AI content generator", "blog writing AI", "email writer", "Claude AI", "DeepSeek AI"],
  openGraph: {
    title: "Try AI Writer — Free AI Writing Tool That Learns Your Voice | Start Writing Now",
    description: "Try AI Writer is a free AI writing assistant that learns your brand voice. Generate blog posts, emails, and social media content in seconds. Start writing now — no credit card required.",
    url: "https://tryaiwriter.com",
    siteName: "Try AI Writer",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Try AI Writer — Free AI Writing Tool That Learns Your Voice | Start Writing Now",
    description: "Try AI Writer is a free AI writing assistant that learns your brand voice. Generate blog posts, emails, and social media content in seconds. Start writing now — no credit card required.",
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
  "name": "Try AI Writer",
  "url": "https://tryaiwriter.com",
  "logo": "https://tryaiwriter.com/logo.png",
  "sameAs": [
    "https://twitter.com/useaiwriter",
    "https://github.com/useaiwriter"
  ]
};

import { ServiceWorkerRegistration } from "@/app/components/ServiceWorkerRegistration";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth dark" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload critical font stylesheet with optimal font-display */}
        <link 
          rel="preload" 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap" 
          as="style"
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap" 
          rel="stylesheet"
        />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />

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
        
        {/* Global DOM Error Handler */}
        <script
          dangerouslySetInnerHTML={{ __html: `
            if (typeof window !== 'undefined') {
              // 捕获DOM操作错误
              window.addEventListener('error', function(event) {
                if (event.message && (event.message.includes('insertBefore') || event.message.includes('removeChild') || event.message.includes('appendChild'))) {
                  console.warn('[DOM] Caught DOM operation error, likely from browser translation or external DOM modification:', event.message);
                  event.preventDefault();
                  event.stopPropagation();
                  return true;
                }
              });
              
              // 防止翻译工具破坏React组件
              const originalInsertBefore = Node.prototype.insertBefore;
              Node.prototype.insertBefore = function(newNode, referenceNode) {
                try {
                  // 检查节点是否仍然在文档中
                  if (this.parentNode === null && document.contains(this)) {
                    console.warn('[DOM] insertBefore called on detached node, skipping');
                    return newNode;
                  }
                  return originalInsertBefore.call(this, newNode, referenceNode);
                } catch (e) {
                  console.warn('[DOM] insertBefore failed:', e.message);
                  return newNode;
                }
              };
              
              // MutationObserver监控DOM变化
              try {
                const domObserver = new MutationObserver(function(mutations) {
                  // 忽略小型变化
                });
                
                // 不要全局监听，性能影响太大
              } catch (e) {
                console.warn('[DOM] MutationObserver not supported');
              }
            }
          `}}
        />
      </head>
      <body className="min-h-screen">
        <ErrorBoundary>
          <ThemeProvider>
            <SessionProvider>
              <Providers>
                <div className="page-transition">
                  {children}
                </div>
              </Providers>
            </SessionProvider>
          </ThemeProvider>
        </ErrorBoundary>
        <ServiceWorkerRegistration />
        <Analytics />
      </body>
    </html>
  );
}
