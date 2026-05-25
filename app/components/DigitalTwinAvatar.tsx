'use client';

import React, { useState, useEffect, useRef } from 'react';

type AvatarState = 'idle' | 'thinking' | 'approving' | 'expecting' | 'listening';

interface DigitalTwinAvatarProps {
  isVisible: boolean;
  state: AvatarState;
  onSound?: (type: 'pop' | 'question' | 'approve') => void;
}

export function DigitalTwinAvatar({ isVisible, state, onSound }: DigitalTwinAvatarProps) {
  const [isWaving, setIsWaving] = useState(false);
  const [isNodding, setIsNodding] = useState(false);
  const [blinkType, setBlinkType] = useState<'single' | 'double'>('single');
  const [headTilt, setHeadTilt] = useState(0);
  const prevStateRef = useRef<AvatarState>(state);

  // Random tiny head tilt for listening
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

  // Random double blinks
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setBlinkType('double');
        setTimeout(() => setBlinkType('single'), 1000);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle state changes and trigger animations/sounds
  useEffect(() => {
    if (prevStateRef.current !== state) {
      if (state === 'thinking' || state === 'idle') {
        // Trigger wave when new question appears
        setIsWaving(true);
        setTimeout(() => setIsWaving(false), 1000);
        if (onSound) onSound('question');
      } else if (state === 'approving') {
        // Trigger nodding when user answers
        setIsNodding(true);
        setTimeout(() => setIsNodding(false), 1500);
        if (onSound) onSound('approve');
      }
    }
    prevStateRef.current = state;
  }, [state, onSound]);

  // Trigger pop sound when avatar becomes visible
  useEffect(() => {
    if (isVisible && onSound) {
      onSound('pop');
    }
  }, [isVisible, onSound]);

  // Get SVG elements based on state
  const getEyeHeight = () => {
    switch (state) {
      case 'expecting':
        return '10'; // Larger eyes for excited look
      case 'listening':
        return '7'; // Slightly squinted for listening
      default:
        return '8';
    }
  };

  const getMouthPath = () => {
    switch (state) {
      case 'thinking':
        return 'M 30 60 Q 40 55 50 60'; // Slight frown for thinking
      case 'approving':
      case 'expecting':
        return 'M 30 58 Q 40 68 50 58'; // Bigger smile for approval/excitement
      default:
        return 'M 30 60 Q 40 66 50 60'; // Normal smile
    }
  };

  const getPupilOffset = () => {
    if (state === 'listening') {
      return { x: '2', y: '0' }; // Eyes slightly to side when listening
    }
    return { x: '0', y: '0' };
  };

  return (
    <div className="relative">
      <style jsx>{`
        @keyframes popIn {
          0% {
            transform: translateX(-50px) scale(0.5);
            opacity: 0;
          }
          70% {
            transform: translateX(5px) scale(1.1);
            opacity: 1;
          }
          100% {
            transform: translateX(0) scale(1);
          }
        }

        @keyframes fadeOut {
          0% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateX(-20px) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes blinkSingle {
          0%, 95%, 100% {
            transform: scaleY(1);
          }
          97% {
            transform: scaleY(0.1);
          }
        }

        @keyframes blinkDouble {
          0%, 90%, 100% {
            transform: scaleY(1);
          }
          92%, 96% {
            transform: scaleY(0.1);
          }
          94% {
            transform: scaleY(1);
          }
        }

        @keyframes wave {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(15deg);
          }
          75% {
            transform: rotate(-15deg);
          }
        }

        @keyframes nod {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(5px);
          }
        }

        .avatar-container {
          width: 80px;
          height: 100px;
          position: relative;
        }

        .pop-in {
          animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }

        .fade-out {
          animation: fadeOut 0.3s ease-out forwards;
        }

        .eye {
          transform-origin: center;
        }

        .eye-blink-single {
          animation: blinkSingle 4s infinite;
        }

        .eye-blink-double {
          animation: blinkDouble 4.2s infinite;
        }

        .wave {
          transform-origin: bottom left;
          animation: wave 1s ease-in-out;
        }

        .nod {
          animation: nod 0.3s ease-in-out 3;
        }
      `}</style>

      <div
        className={`avatar-container ${
          isVisible ? 'pop-in' : 'fade-out'
        }`}
      >
        <svg
          viewBox="0 0 80 100"
          className="w-full h-full md:w-[80px] md:h-[100px] w-[60px] h-[75px] ${isNodding ? 'nod' : ''}"
          style={{ 
            transformOrigin: 'center bottom',
            transform: `rotate(${headTilt}deg)`
          }}
        >
          {/* Body - simple rounded rectangle */}
          <rect
            x="20"
            y="65"
            width="40"
            height="30"
            rx="15"
            fill="#059669"
            opacity="0.9"
          />

          {/* Left arm/hand */}
          <g>
            <rect
              x="8"
              y="70"
              width="12"
              height="8"
              rx="4"
              fill="#059669"
              opacity="0.9"
            />
          </g>

          {/* Right arm/hand with wave animation */}
          <g className={isWaving ? 'wave' : ''}>
            <rect
              x="60"
              y="70"
              width="12"
              height="8"
              rx="4"
              fill="#059669"
              opacity="0.9"
            />
          </g>

          {/* Head - circle */}
          <circle
            cx="40"
            cy="35"
            r="25"
            fill="#059669"
          />

          {/* Left eye */}
          <g className={`eye ${blinkType === 'double' ? 'eye-blink-double' : 'eye-blink-single'}`}>
            <ellipse
              cx="32"
              cy="32"
              rx="6"
              ry={getEyeHeight()}
              fill="white"
            />
            <circle
              cx={32 + Number(getPupilOffset().x)}
              cy={32 + Number(getPupilOffset().y)}
              r="3"
              fill="black"
            />
          </g>

          {/* Right eye */}
          <g className={`eye ${blinkType === 'double' ? 'eye-blink-double' : 'eye-blink-single'}`} style={{ animationDelay: '0.1s' }}>
            <ellipse
              cx="48"
              cy="32"
              rx="6"
              ry={getEyeHeight()}
              fill="white"
            />
            <circle
              cx={48 + Number(getPupilOffset().x)}
              cy={32 + Number(getPupilOffset().y)}
              r="3"
              fill="black"
            />
          </g>

          {/* Mouth */}
          <path
            d={getMouthPath()}
            stroke="white"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />

          {/* Thinking hand (chin rest) */}
          {state === 'thinking' && (
            <g>
              <rect
                x="32"
                y="55"
                width="16"
                height="10"
                rx="5"
                fill="white"
                opacity="0.2"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
