'use client';

import React, { useState, useEffect, useRef } from 'react';

export type AvatarState = 'idle' | 'thinking' | 'approving' | 'expecting' | 'listening' | 'nodding' | 'questionAppearing';
export type AvatarVariant = 'default' | 'minimal' | 'cute';

interface DigitalTwinAvatarProps {
  isVisible: boolean;
  state: AvatarState;
  onSound?: (type: 'pop' | 'question' | 'approve' | 'nod') => void;
  onQuestionAppear?: () => void;
  variant?: AvatarVariant;
}

const AvatarDefault = ({ state, isBlinking, eyeHeight, pupilOffset, mouthPath, isNodding, isThinkingAnim, headTilt, showGlow }: {
  state: AvatarState;
  isBlinking: boolean;
  eyeHeight: number;
  pupilOffset: { x: number; y: number };
  mouthPath: string;
  isNodding: boolean;
  isThinkingAnim: boolean;
  headTilt: number;
  showGlow: boolean;
}) => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <defs>
      <linearGradient id="defaultGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#5b9cf5" />
        <stop offset="100%" stopColor="#9b6dff" />
      </linearGradient>
    </defs>
    
    {/* Outer Glow Ring */}
    {showGlow && (
      <circle
        cx="40"
        cy="40"
        r="36"
        fill="none"
        stroke="url(#defaultGlow)"
        strokeWidth="3"
        opacity="0.3"
        className={
          state === 'thinking' || state === 'questionAppearing'
            ? 'animate-[spin_2s_linear_infinite]'
            : state === 'listening'
            ? 'animate-[pulse_1s_ease-in-out_infinite]'
            : ''
        }
      />
    )}

    {/* Body Glow */}
    <ellipse
      cx="40"
      cy="65"
      rx="20"
      ry="8"
      fill="url(#defaultGlow)"
      opacity="0.2"
    />

    {/* Head (Liquid Glass Effect) */}
    <g
      className={`${isNodding ? 'animate-[nod_0.2s_ease-in-out_3]' : ''} ${isThinkingAnim ? 'animate-[thinking_0.8s_ease-in-out_infinite]' : ''}`}
      style={{ transformOrigin: 'center bottom', transform: `rotate(${headTilt}deg)` }}
    >
      <circle
        cx="40"
        cy="40"
        r="28"
        fill="rgba(91, 156, 245, 0.2)"
        stroke="rgba(255, 255, 255, 0.5)"
        strokeWidth="1"
      />
      
      {/* Eyes */}
      <g style={{ transformOrigin: 'center', transform: `scaleY(${isBlinking ? 0.1 : 1})` }}>
        <circle cx="30" cy="38" r="5" fill="url(#defaultGlow)" />
        <circle cx="30" cy="38" r="3" fill="white" />
        <circle
          cx={30 + pupilOffset.x}
          cy={38 + pupilOffset.y}
          r="1.5"
          fill="#1f2937"
        />
        
        <circle cx="50" cy="38" r="5" fill="url(#defaultGlow)" />
        <circle cx="50" cy="38" r="3" fill="white" />
        <circle
          cx={50 + pupilOffset.x}
          cy={38 + pupilOffset.y}
          r="1.5"
          fill="#1f2937"
        />
      </g>

      {/* Mouth */}
      <path
        d={mouthPath}
        stroke="url(#defaultGlow)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Subtle highlight */}
      <ellipse cx="32" cy="30" rx="6" ry="4" fill="white" opacity="0.15" />
    </g>
  </svg>
);

const AvatarMinimal = ({ state, isBlinking, eyeHeight, pupilOffset, mouthPath, isNodding, isThinkingAnim, headTilt, showGlow }: {
  state: AvatarState;
  isBlinking: boolean;
  eyeHeight: number;
  pupilOffset: { x: number; y: number };
  mouthPath: string;
  isNodding: boolean;
  isThinkingAnim: boolean;
  headTilt: number;
  showGlow: boolean;
}) => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <defs>
      <linearGradient id="minimalGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>

    {/* Outer Glow Ring */}
    {showGlow && (
      <circle
        cx="40"
        cy="40"
        r="36"
        fill="none"
        stroke="url(#minimalGlow)"
        strokeWidth="2"
        opacity="0.4"
        className={
          state === 'thinking' || state === 'questionAppearing'
            ? 'animate-[spin_2s_linear_infinite]'
            : state === 'listening'
            ? 'animate-[pulse_1s_ease-in-out_infinite]'
            : ''
        }
      />
    )}

    {/* Head */}
    <g
      className={`${isNodding ? 'animate-[nod_0.2s_ease-in-out_3]' : ''} ${isThinkingAnim ? 'animate-[thinking_0.8s_ease-in-out_infinite]' : ''}`}
      style={{ transformOrigin: 'center bottom', transform: `rotate(${headTilt}deg)` }}
    >
      <circle
        cx="40"
        cy="40"
        r="25"
        fill="white"
        stroke="#e2e8f0"
        strokeWidth="2"
      />

      {/* Eyes */}
      <g style={{ transformOrigin: 'center', transform: `scaleY(${isBlinking ? 0.1 : 1})` }}>
        <circle cx="32" cy="38" r="4" fill="#1e293b" />
        <circle cx="48" cy="38" r="4" fill="#1e293b" />
      </g>

      {/* Mouth */}
      <path
        d={mouthPath}
        stroke="#334155"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  </svg>
);

const AvatarCute = ({ state, isBlinking, eyeHeight, pupilOffset, mouthPath, isNodding, isThinkingAnim, headTilt, showGlow }: {
  state: AvatarState;
  isBlinking: boolean;
  eyeHeight: number;
  pupilOffset: { x: number; y: number };
  mouthPath: string;
  isNodding: boolean;
  isThinkingAnim: boolean;
  headTilt: number;
  showGlow: boolean;
}) => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <defs>
      <linearGradient id="cuteGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="100%" stopColor="#c084fc" />
      </linearGradient>
    </defs>

    {/* Outer Glow Ring */}
    {showGlow && (
      <circle
        cx="40"
        cy="40"
        r="36"
        fill="none"
        stroke="url(#cuteGlow)"
        strokeWidth="3"
        opacity="0.3"
        className={
          state === 'thinking' || state === 'questionAppearing'
            ? 'animate-[spin_2s_linear_infinite]'
            : state === 'listening'
            ? 'animate-[pulse_1s_ease-in-out_infinite]'
            : ''
        }
      />
    )}

    {/* Head */}
    <g
      className={`${isNodding ? 'animate-[nod_0.2s_ease-in-out_3]' : ''} ${isThinkingAnim ? 'animate-[thinking_0.8s_ease-in-out_infinite]' : ''}`}
      style={{ transformOrigin: 'center bottom', transform: `rotate(${headTilt}deg)` }}
    >
      <circle
        cx="40"
        cy="40"
        r="28"
        fill="#fffaf5"
        stroke="url(#cuteGlow)"
        strokeWidth="2"
      />

      {/* Cheeks */}
      <circle cx="22" cy="48" r="4" fill="#fda4af" opacity="0.5" />
      <circle cx="58" cy="48" r="4" fill="#fda4af" opacity="0.5" />

      {/* Eyes */}
      <g style={{ transformOrigin: 'center', transform: `scaleY(${isBlinking ? 0.1 : 1})` }}>
        <circle cx="30" cy="38" r="6" fill="#431407" />
        <circle cx="29" cy="37" r="2" fill="white" />
        <circle cx="50" cy="38" r="6" fill="#431407" />
        <circle cx="49" cy="37" r="2" fill="white" />
      </g>

      {/* Mouth */}
      <path
        d={state === 'thinking' || state === 'questionAppearing' ? "M 32 48 Q 40 44 48 48" : state === 'approving' || state === 'nodding' ? "M 30 46 Q 40 56 50 46" : "M 32 48 Q 40 54 48 48"}
        stroke="url(#cuteGlow)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Sparkles when thinking */}
      {(state === 'thinking' || state === 'questionAppearing') && (
        <>
          <circle cx="24" cy="25" r="2" fill="#fbbf24" opacity="0.8" className="animate-[pulse_0.5s_ease-in-out_infinite]" />
          <circle cx="56" cy="23" r="1.5" fill="#fbbf24" opacity="0.8" className="animate-[pulse_0.5s_ease-in-out_infinite]" style={{ animationDelay: '0.25s' }} />
        </>
      )}
    </g>
  </svg>
);

export function DigitalTwinAvatar({ isVisible, state, onSound, onQuestionAppear, variant = 'default' }: DigitalTwinAvatarProps) {
  const [isWaving, setIsWaving] = useState(false);
  const [isNodding, setIsNodding] = useState(false);
  const [isThinkingAnim, setIsThinkingAnim] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [headTilt, setHeadTilt] = useState(0);
  const [browRaise, setBrowRaise] = useState(false);
  const prevStateRef = useRef<AvatarState>(state);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (state === 'listening') {
      interval = setInterval(() => {
        setHeadTilt((Math.random() - 0.5) * 4);
      }, 800);
    } else {
      setHeadTilt(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (prevStateRef.current !== state) {
      if (state === 'thinking' || state === 'idle') {
        setIsWaving(true);
        setTimeout(() => setIsWaving(false), 1000);
        if (onSound) onSound('question');
      } else if (state === 'approving' || state === 'nodding') {
        setIsNodding(true);
        setTimeout(() => setIsNodding(false), 600);
        if (onSound) onSound('nod');
      } else if (state === 'questionAppearing') {
        setBrowRaise(true);
        setIsThinkingAnim(true);
        setTimeout(() => {
          setBrowRaise(false);
          setIsThinkingAnim(false);
        }, 800);
        if (onSound) onSound('question');
      } else if (state === 'expecting') {
        setIsThinkingAnim(true);
        setTimeout(() => setIsThinkingAnim(false), 1200);
      }
    }
    prevStateRef.current = state;
  }, [state, onSound, onQuestionAppear]);

  useEffect(() => {
    if (isVisible && onSound) {
      onSound('pop');
    }
  }, [isVisible, onSound]);

  const getEyeHeight = () => {
    switch (state) {
      case 'expecting':
        return 6;
      case 'listening':
        return 5;
      case 'thinking':
      case 'questionAppearing':
        return 4;
      default:
        return 5;
    }
  };

  const getMouthPath = () => {
    switch (state) {
      case 'thinking':
      case 'questionAppearing':
        return "M 30 50 Q 40 46 50 50";
      case 'approving':
      case 'nodding':
        return "M 30 48 Q 40 56 50 48";
      case 'expecting':
        return "M 32 50 Q 40 56 48 50";
      default:
        return "M 32 50 Q 40 54 48 50";
    }
  };

  const getPupilOffset = () => {
    if (state === 'listening') {
      return { x: 1, y: 0 };
    }
    if (state === 'thinking' || state === 'questionAppearing') {
      return { x: -0.5, y: 0.5 };
    }
    return { x: 0, y: 0 };
  };

  const showGlow = state !== 'idle' || isVisible;

  const renderAvatar = () => {
    const props = {
      state,
      isBlinking,
      eyeHeight: getEyeHeight(),
      pupilOffset: getPupilOffset(),
      mouthPath: getMouthPath(),
      isNodding,
      isThinkingAnim,
      headTilt,
      showGlow
    };

    switch (variant) {
      case 'minimal':
        return <AvatarMinimal {...props} />;
      case 'cute':
        return <AvatarCute {...props} />;
      default:
        return <AvatarDefault {...props} />;
    }
  };

  return (
    <div className="relative">
      <style jsx global>{`
        @keyframes popIn {
          0% { transform: translateX(-50px) scale(0.5); opacity: 0; }
          70% { transform: translateX(5px) scale(1.1); opacity: 1; }
          100% { transform: translateX(0) scale(1); }
        }
        @keyframes fadeOut {
          0% { transform: translateX(0) scale(1); opacity: 1; }
          100% { transform: translateX(-20px) scale(0.8); opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.5; }
        }
        @keyframes nod {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(3px) rotate(-3deg); }
          75% { transform: translateY(3px) rotate(3deg); }
        }
        @keyframes thinking {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
      `}</style>

      <div className={`avatar-container ${isVisible ? 'pop-in' : 'fade-out'}`} style={{ width: '80px', height: '80px' }}>
        {renderAvatar()}
      </div>
    </div>
  );
}
