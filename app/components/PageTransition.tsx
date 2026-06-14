"use client";

import { ReactNode, useEffect, useState } from "react";

interface PageTransitionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function PageTransition({ children, delay = 0, className = "" }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-all duration-300 ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(12px)",
      }}
    >
      {children}
    </div>
  );
}

export function FadeIn({ 
  children, 
  duration = 200,
  className = "" 
}: { 
  children: ReactNode; 
  duration?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`transition-all duration-200 ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
}

export function SlideUp({ 
  children, 
  delay = 0,
  duration = 300,
  className = "" 
}: { 
  children: ReactNode; 
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-all duration-300 ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
      }}
    >
      {children}
    </div>
  );
}
