"use client";

import { useState, useEffect, useRef } from "react";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  end,
  duration = 2000,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const isUnmountedRef = useRef(false);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    isUnmountedRef.current = false;
    const element = ref.current;
    
    if (!element) return;

    try {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (isUnmountedRef.current) return;
          if (entry?.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        },
        { threshold: 0.1 }
      );

      observerRef.current = observer;
      observer.observe(element);

      return () => {
        isUnmountedRef.current = true;
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
      };
    } catch (e) {
      console.error('[AnimatedCounter] Observer error:', e);
      setIsVisible(true); // 降级处理，直接显示
      return () => {
        isUnmountedRef.current = true;
      };
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    isUnmountedRef.current = false;
    let startTime: number;

    const animate = (timestamp: number) => {
      if (isUnmountedRef.current) return;
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      try {
        setCount(Math.floor(easeOutQuart * end));
      } catch (e) {
        console.warn('[AnimatedCounter] State update failed:', e);
      }

      if (progress < 1 && !isUnmountedRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      isUnmountedRef.current = true;
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [isVisible, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count}{suffix}
    </span>
  );
}

interface AnimatedProgressBarProps {
  duration?: number;
  className?: string;
}

export function AnimatedProgressBar({ duration = 3000, className = "" }: AnimatedProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isUnmountedRef = useRef(false);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    isUnmountedRef.current = false;
    const element = ref.current;
    
    if (!element) return;

    try {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (isUnmountedRef.current) return;
          if (entry?.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        },
        { threshold: 0.1 }
      );

      observerRef.current = observer;
      observer.observe(element);

      return () => {
        isUnmountedRef.current = true;
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
      };
    } catch (e) {
      console.error('[AnimatedProgressBar] Observer error:', e);
      setIsVisible(true); // 降级处理
      return () => {
        isUnmountedRef.current = true;
      };
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    isUnmountedRef.current = false;
    let startTime: number;

    const animate = (timestamp: number) => {
      if (isUnmountedRef.current) return;
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progressValue = Math.min((elapsed / duration) * 100, 100);
      
      try {
        setProgress(progressValue);
      } catch (e) {
        console.warn('[AnimatedProgressBar] State update failed:', e);
      }

      if (progressValue < 100 && !isUnmountedRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      isUnmountedRef.current = true;
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [isVisible, duration]);

  return (
    <div ref={ref} className={`w-full bg-slate-200 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className="h-full bg-emerald-500 rounded-full transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
