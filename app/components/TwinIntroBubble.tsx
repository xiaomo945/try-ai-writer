'use client';

import React, { useState, useEffect, useRef } from 'react';

interface TwinIntroBubbleProps {
  onClose?: () => void;
  isVisible: boolean;
}

export function TwinIntroBubble({ onClose, isVisible }: TwinIntroBubbleProps) {
  const [showing, setShowing] = useState(false);
  const [closing, setClosing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible) {
      setShowing(true);
      timerRef.current = setTimeout(() => {
        startClosing();
      }, 3000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible]);

  const startClosing = () => {
    setClosing(true);
    setTimeout(() => {
      setShowing(false);
      onClose?.();
      localStorage.setItem('twin_intro_shown', 'true');
    }, 400);
  };

  const handleClick = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    startClosing();
  };

  if (!showing) return null;

  return (
    <div
      onClick={handleClick}
      className={`absolute z-50 transition-all duration-400 ease-out cursor-pointer ${
        closing 
          ? 'opacity-0 md:translate-x-[-20px] md:translate-y-0 translate-y-[-10px]' 
          : 'opacity-100 md:translate-x-0 md:translate-y-0 translate-y-0'
      }`}
      style={{
        top: '0',
        left: '100px',
        width: '280px',
        maxWidth: '90vw',
      }}
    >
      <div
        className="relative bg-white border-2 border-emerald-600 rounded-2xl p-4 shadow-lg
          md:ml-4 md:mt-0 mt-3"
      >
        {/* Triangle Tail - desktop: left */}
        <div
          className="absolute -left-3 top-4 md:block hidden"
          style={{
            width: 0,
            height: 0,
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderRight: '8px solid #059669',
          }}
        />
        {/* Triangle Tail - mobile: top */}
        <div
          className="md:hidden absolute -top-3 left-6"
          style={{
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: '8px solid #059669',
          }}
        />
        <p className="text-slate-700 text-sm md:text-base leading-relaxed">
          嗨！我是你的数字写作分身。告诉我你的想法，哪怕只有几个词，我会帮你理清思路，变成完整的作品。
        </p>
        <p className="text-xs text-slate-400 mt-2">点击任意位置关闭</p>
      </div>
    </div>
  );
}
