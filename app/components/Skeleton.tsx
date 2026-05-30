import React from "react";

type SkeletonVariant = "text" | "title" | "card" | "avatar" | "button" | "paragraph" | "circle" | "badge" | "table-row";

interface SkeletonProps {
  variant: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
  gap?: number;
}

export function Skeleton({ variant, width, height, className = "", count = 1, gap = 3 }: SkeletonProps) {
  const baseStyles = "relative overflow-hidden rounded bg-gradient-to-r from-slate-200/60 via-slate-100 to-slate-200/60 dark:from-slate-800/80 dark:via-slate-700 dark:to-slate-800/80 animate-skeleton-pulse";

  const getStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === "number" ? `${width}px` : width;
    if (height) style.height = typeof height === "number" ? `${height}px` : height;
    return style;
  };

  const renderSkeleton = (index: number) => {
    switch (variant) {
      case "text":
        return (
          <div key={index} className={`${baseStyles} h-4 ${className}`} style={getStyle()} />
        );
      case "title":
        return (
          <div key={index} className={`${baseStyles} h-8 w-3/4 ${className}`} style={getStyle()} />
        );
      case "card":
        return (
          <div key={index} className={`${baseStyles} rounded-2xl ${className}`} style={{ width: width || "100%", height: height || "192px", ...getStyle() }} />
        );
      case "avatar":
        return (
          <div key={index} className={`${baseStyles} rounded-full ${className}`} style={{ width: width || "48px", height: height || "48px", ...getStyle() }} />
        );
      case "circle":
        return (
          <div key={index} className={`${baseStyles} rounded-full ${className}`} style={{ width: width || "48px", height: height || "48px", ...getStyle() }} />
        );
      case "button":
        return (
          <div key={index} className={`${baseStyles} rounded-xl ${className}`} style={{ width: width || "128px", height: height || "48px", ...getStyle() }} />
        );
      case "badge":
        return (
          <div key={index} className={`${baseStyles} rounded-full ${className}`} style={{ width: width || "64px", height: height || "24px", ...getStyle() }} />
        );
      case "paragraph":
        return (
          <div key={index} className={`space-y-${gap} ${className}`}>
            <div className={baseStyles} style={{ height: "16px", width: "100%" }} />
            <div className={baseStyles} style={{ height: "16px", width: "95%" }} />
            <div className={baseStyles} style={{ height: "16px", width: "85%" }} />
            <div className={baseStyles} style={{ height: "16px", width: "70%" }} />
          </div>
        );
      case "table-row":
        return (
          <div key={index} className={`flex items-center gap-4 py-3 ${className}`}>
            <div className={baseStyles} style={{ width: "48px", height: "48px", borderRadius: "8px" }} />
            <div className="flex-1 space-y-2">
              <div className={baseStyles} style={{ height: "14px", width: "60%" }} />
              <div className={baseStyles} style={{ height: "14px", width: "40%" }} />
            </div>
            <div className={baseStyles} style={{ width: "80px", height: "32px", borderRadius: "6px" }} />
          </div>
        );
      default:
        return null;
    }
  };

  if (count > 1 && variant !== "paragraph") {
    return <div className={`space-y-${gap}`}>{Array.from({ length: count }, (_, i) => renderSkeleton(i))}</div>;
  }

  return renderSkeleton(0);
}
