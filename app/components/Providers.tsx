'use client';

import React from 'react';
import { AvatarVariantProvider } from '@/lib/avatar-variant';
import { DataMigration } from '@/app/components/DataMigration';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AvatarVariantProvider>
      <DataMigration />
      {children}
    </AvatarVariantProvider>
  );
}
