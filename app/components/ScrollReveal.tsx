'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'scale';
  parallax?: boolean;
  parallaxSpeed?: number;
}

export function ScrollReveal({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up',
  parallax = false,
  parallaxSpeed = 0.4
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | undefined>(undefined);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('revealed');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(element);

    if (parallax) {
      const handleScroll = () => {
        if (rafId.current) {
          cancelAnimationFrame(rafId.current);
        }

        rafId.current = requestAnimationFrame(() => {
          if (!element) return;
          
          const rect = element.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const elementCenter = rect.top + rect.height / 2;
          const viewportCenter = viewportHeight / 2;
          const offset = (elementCenter - viewportCenter) * parallaxSpeed;
          
          const baseTransform = getBaseTransform(element);
          element.style.transform = `translateY(${offset}px) ${baseTransform}`;
        });
      }

      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();

      return () => {
        observer.disconnect();
        window.removeEventListener('scroll', handleScroll);
        if (rafId.current) {
          cancelAnimationFrame(rafId.current);
        }
      };
    }

    return () => observer.disconnect();
  }, [delay, parallax, parallaxSpeed]);

  const getBaseTransform = (element: HTMLElement): string => {
    const classList = element.classList;
    if (classList.contains('scroll-reveal-left')) return 'translateX(-30px)';
    if (classList.contains('scroll-reveal-right')) return 'translateX(30px)';
    if (classList.contains('scroll-reveal-scale')) return 'scale(0.95)';
    return 'translateY(20px)';
  };

  const baseClass = (() => {
    switch (direction) {
      case 'left':
        return 'scroll-reveal-left';
      case 'right':
        return 'scroll-reveal-right';
      case 'scale':
        return 'scroll-reveal-scale';
      case 'up':
      default:
        return 'scroll-reveal';
    }
  })();

  return (
    <div
      ref={ref}
      className={`${baseClass} ${className}`}
    >
      {children}
    </div>
  );
}
