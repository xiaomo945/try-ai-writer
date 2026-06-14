"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  placeholder?: string;
  fallbackSrc?: string;
  sizes?: string;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimized image component with lazy loading, loading states,
 * and error handling built on top of Next.js Image.
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className = "",
  placeholder: blurPlaceholder,
  fallbackSrc = "/placeholder.svg",
  sizes,
  quality = 80,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    setCurrentSrc(fallbackSrc);
    onError?.();
  }, [fallbackSrc, onError]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={
        !fill && width && height
          ? { width: `${width}px`, height: `${height}px` }
          : undefined
      }
    >
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 z-10 animate-skeleton-pulse bg-gradient-to-r from-slate-200/60 via-slate-100 to-slate-200/60 dark:from-slate-800/80 dark:via-slate-700 dark:to-slate-800/80" />
      )}

      {/* Error overlay */}
      {hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800/50">
          <div className="text-center">
            <svg
              className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
              />
            </svg>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Failed to load
            </p>
          </div>
        </div>
      )}

      <Image
        src={currentSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        quality={quality}
        sizes={sizes}
        placeholder={blurPlaceholder ? "blur" : "empty"}
        blurDataURL={blurPlaceholder}
        className={`transition-opacity duration-300 ease-out ${
          isLoading ? "opacity-0" : "opacity-100"
        } ${fill ? "object-cover" : ""}`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
