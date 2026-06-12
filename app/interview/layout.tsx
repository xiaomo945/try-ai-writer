import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creative Interview — Train Your Digital Twin | Try AI Writer",
  description: "Tell your digital twin what you want to write. Our AI asks the right questions, learns your preferences, and assembles the perfect prompt.",
  openGraph: {
    title: "Creative Interview — Train Your Digital Twin | Try AI Writer",
    description: "Tell your digital twin what you want to write. Our AI asks the right questions and learns your preferences.",
  },
};

export default function InterviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}