/**
 * Image optimization utilities
 * Provides WebP detection, image compression, and CDN URL generation
 */

/**
 * Detect if browser supports WebP format
 */
export async function supportsWebP(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  } catch {
    return false;
  }
}

/**
 * Generate optimized image URL with CDN parameters
 * Supports width, height, quality, and format parameters
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png' | 'auto';
  } = {}
): string {
  // Skip optimization for external URLs that don't support our CDN
  if (!originalUrl.startsWith('/')) {
    return originalUrl;
  }

  const { width, height, quality = 80, format = 'auto' } = options;
  
  // Build query parameters
  const params = new URLSearchParams();
  
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  if (quality) params.set('q', quality.toString());
  if (format !== 'auto') params.set('fm', format);
  
  // Add cache-busting parameter for versioning
  params.set('v', '1');
  
  const queryString = params.toString();
  return queryString ? `${originalUrl}?${queryString}` : originalUrl;
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(
  baseUrl: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  options: {
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png' | 'auto';
  } = {}
): string {
  return widths
    .map((width) => {
      const url = getOptimizedImageUrl(baseUrl, { ...options, width });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Get optimal image dimensions while maintaining aspect ratio
 */
export function getOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight?: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = Math.min(originalWidth, maxWidth);
  let height = width / aspectRatio;
  
  if (maxHeight && height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Generate placeholder blur data URL for image loading states
 */
export function generateBlurPlaceholder(
  width: number = 20,
  height: number = 20
): string {
  // Generate a simple gradient placeholder
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:#14b8a6;stop-opacity:0.1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#g)" />
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Preload critical images for better performance
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Preload multiple images in parallel
 */
export async function preloadImages(urls: string[]): Promise<void> {
  await Promise.allSettled(urls.map(preloadImage));
}
