'use client';

import React from 'react';
import { AvatarVariantProvider } from '@/lib/avatar-variant';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AvatarVariantProvider>{children}</AvatarVariantProvider>;
}
