import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SessionProvider } from "@/components/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tryaiwriter.com"),
  title: "Use AI Writer — Affordable AI Writing Tool | Try Free",
  description: "Write blog posts, emails, and social media content 3x faster. The most affordable AI writer with deep context awareness. Start free — no credit card required.",
  openGraph: {
    title: "Use AI Writer — Affordable AI Writing Tool",
    description: "Write blog posts, emails, and social media content 3x faster.",
    url: "https://tryaiwriter.com",
    siteName: "Use AI Writer",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Use AI Writer",
    description: "Write blog posts, emails, and social media content 3x faster.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
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
