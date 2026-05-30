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
  const observerRef = useRef<IntersectionObserver | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const isUnmountedRef = useRef(false);

  useEffect(() => {
    isUnmountedRef.current = false;
    const element = ref.current;
    
    // 安全检查：如果元素不存在，直接返回
    if (!element) return;

    try {
      // 创建 IntersectionObserver
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (isUnmountedRef.current) return;
            if (entry.isIntersecting) {
              setTimeout(() => {
                if (isUnmountedRef.current || !entry.target || !entry.target.isConnected) return;
                try {
                  entry.target.classList.add('revealed');
                } catch (e) {
                  console.warn('[ScrollReveal] Failed to add class:', e);
                }
              }, delay);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );

      observerRef.current = observer;
      observer.observe(element);

      // 添加 MutationObserver 来监控 DOM 变更（浏览器翻译等）
      const mutationObserver = new MutationObserver(() => {
        // 优雅降级，不执行可能导致崩溃的操作
      });

      try {
        mutationObserver.observe(element, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true
        });
        mutationObserverRef.current = mutationObserver;
      } catch (e) {
        console.warn('[ScrollReveal] MutationObserver not available:', e);
      }

      if (parallax) {
        const handleScroll = () => {
          if (isUnmountedRef.current) return;
          if (rafId.current) {
            cancelAnimationFrame(rafId.current);
          }

          rafId.current = requestAnimationFrame(() => {
            if (isUnmountedRef.current || !element || !element.isConnected) return;
            
            try {
              const rect = element.getBoundingClientRect();
              const viewportHeight = window.innerHeight;
              const elementCenter = rect.top + rect.height / 2;
              const viewportCenter = viewportHeight / 2;
              const offset = (elementCenter - viewportCenter) * parallaxSpeed;
              
              const baseTransform = getBaseTransform(element);
              element.style.transform = `translateY(${offset}px) ${baseTransform}`;
            } catch (e) {
              console.warn('[ScrollReveal] Parallax calculation failed:', e);
            }
          });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => {
          isUnmountedRef.current = true;
          if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
          }
          if (mutationObserverRef.current) {
            mutationObserverRef.current.disconnect();
            mutationObserverRef.current = null;
          }
          window.removeEventListener('scroll', handleScroll);
          if (rafId.current) {
            cancelAnimationFrame(rafId.current);
            rafId.current = undefined;
          }
        };
      }

      return () => {
        isUnmountedRef.current = true;
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
        if (mutationObserverRef.current) {
          mutationObserverRef.current.disconnect();
          mutationObserverRef.current = null;
        }
      };
    } catch (e) {
      console.error('[ScrollReveal] Initialization error:', e);
      // 即使出错也渲染内容
      return () => {
        isUnmountedRef.current = true;
      };
    }
  }, [delay, parallax, parallaxSpeed]);

  const getBaseTransform = (element: HTMLElement): string => {
    try {
      if (!element || !element.classList) return '';
      const classList = element.classList;
      if (classList.contains('scroll-reveal-left')) return 'translateX(-30px)';
      if (classList.contains('scroll-reveal-right')) return 'translateX(30px)';
      if (classList.contains('scroll-reveal-scale')) return 'scale(0.95)';
      return 'translateY(20px)';
    } catch (e) {
      return '';
    }
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
