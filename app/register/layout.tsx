import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Free Account — Try AI Writer",
  description: "Create your free Try AI Writer account. Get 10 free AI generations per day, brand voice learning, and writing history. No credit card required.",
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}