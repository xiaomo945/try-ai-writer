import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Try AI Writer",
  description: "Sign in to your Try AI Writer account. Access your brand voice settings, writing history, and AI-powered writing tools.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}