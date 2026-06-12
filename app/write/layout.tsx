import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Writing Studio — Write 3x Faster | Try AI Writer",
  description: "Free AI writing tool that learns your brand voice. Generate blog posts, emails, social media content, and more in seconds. No sign-up required to start.",
  openGraph: {
    title: "AI Writing Studio — Write 3x Faster | Try AI Writer",
    description: "Free AI writing tool that learns your brand voice. Generate blog posts, emails, social media content, and more in seconds.",
  },
};

export default function WriteLayout({ children }: { children: React.ReactNode }) {
  return children;
}