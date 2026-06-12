import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Try AI Writer",
  description: "Your writing dashboard. Track usage, manage brand voice, view history, and earn referral rewards.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}