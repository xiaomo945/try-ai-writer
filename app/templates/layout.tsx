import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writing Templates | Try AI Writer",
  description: "16+ professional writing templates for every use case. Amazon listings, Google Ads, blog posts, social media, and more.",
};

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
