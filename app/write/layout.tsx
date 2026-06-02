"use client";

import { Suspense } from "react";

export default function WriteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense>{children}</Suspense>;
}
