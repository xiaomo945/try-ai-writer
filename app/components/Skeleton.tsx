import React from 'react';

interface SkeletonProps {
  variant: 'text' | 'title' | 'card' | 'avatar' | 'paragraph';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({ variant, width, height, className = '' }: SkeletonProps) {
  const baseStyles = "animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded";
  
  const getStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;
    return style;
  };
  
  switch (variant) {
    case 'text':
      return (
        <div 
          className={`${baseStyles} h-4 ${className}`} 
          style={getStyle()}
        />
      );
    case 'title':
      return (
        <div 
          className={`${baseStyles} h-8 ${className}`} 
          style={getStyle()}
        />
      );
    case 'card':
      return (
        <div 
          className={`${baseStyles} rounded-xl ${className}`} 
          style={{ width: width || '100%', height: height || '200px', ...getStyle() }}
        />
      );
    case 'avatar':
      return (
        <div 
          className={`${baseStyles} rounded-full ${className}`} 
          style={{ width: width || '40px', height: height || '40px', ...getStyle() }}
        />
      );
    case 'paragraph':
      return (
        <div className={`space-y-3 ${className}`}>
          <div className={baseStyles} style={{ height: '16px', width: '100%' }} />
          <div className={baseStyles} style={{ height: '16px', width: '90%' }} />
          <div className={baseStyles} style={{ height: '16px', width: '80%' }} />
        </div>
      );
    default:
      return null;
  }
}
