'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AvatarVariant } from '@/app/components/DigitalTwinAvatar';

interface AvatarVariantContextType {
  variant: AvatarVariant;
  setVariant: (variant: AvatarVariant) => void;
}

const AvatarVariantContext = createContext<AvatarVariantContextType | undefined>(undefined);

export function AvatarVariantProvider({ children }: { children: React.ReactNode }) {
  const [variant, setVariant] = useState<AvatarVariant>('default');

  useEffect(() => {
    const saved = localStorage.getItem('avatarVariant');
    if (saved && ['default', 'minimal', 'cute'].includes(saved)) {
      setVariant(saved as AvatarVariant);
    }
  }, []);

  const updateVariant = (newVariant: AvatarVariant) => {
    setVariant(newVariant);
    localStorage.setItem('avatarVariant', newVariant);
  };

  return (
    <AvatarVariantContext.Provider value={{ variant, setVariant: updateVariant }}>
      {children}
    </AvatarVariantContext.Provider>
  );
}

export function useAvatarVariant() {
  const context = useContext(AvatarVariantContext);
  if (!context) {
    throw new Error('useAvatarVariant must be used within an AvatarVariantProvider');
  }
  return context;
}

// Placeholder for AI image generation (future)
export async function generateAvatarFromDescription(description: string) {
  console.log('AI avatar generation would be called with:', description);
  // Future API call here
  throw new Error('AI avatar generation is coming soon!');
}
