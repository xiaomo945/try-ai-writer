import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Use AI Writer — Affordable AI Writing Tool | Try Free",
  description: "Write blog posts, emails, and social media content 3x faster. The most affordable AI writer with deep context awareness. Start free — no credit card required.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
