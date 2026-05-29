'use client';

import React from 'react';
import { AvatarVariantProvider } from '@/lib/avatar-variant';
import ErrorBoundary from '@/app/components/ErrorBoundary';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AvatarVariantProvider>{children}</AvatarVariantProvider>
    </ErrorBoundary>
  );
}
