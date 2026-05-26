'use client';

export default function Logo({ size = 128 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5b9cf5" />
          <stop offset="100%" stopColor="#9b6dff" />
        </linearGradient>
        <filter id="logo-glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer circle */}
      <circle
        cx="64"
        cy="64"
        r="48"
        fill="none"
        stroke="url(#logo-gradient)"
        strokeWidth="2"
        opacity="0.3"
      />

      {/* Inner liquid glass circle */}
      <circle
        cx="64"
        cy="64"
        r="44"
        fill="rgba(255,255,255,0.04)"
      />

      {/* Feather pen - pen body */}
      <line
        x1="64"
        y1="64"
        x2="78"
        y2="40"
        stroke="#e2e8f0"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Pen nib */}
      <path
        d="M78 40 L81 36 L83 43 Z"
        fill="url(#logo-gradient)"
        filter="url(#logo-glow)"
      />

      {/* Feathers */}
      <path
        d="M78 40 Q85 35 89 45 Q82 42 78 40 Z"
        fill="#5b9cf5"
        opacity="0.6"
      />
      <path
        d="M78 40 Q83 32 86 25 Q83 34 78 40 Z"
        fill="#9b6dff"
        opacity="0.5"
      />
      <path
        d="M78 40 Q76 35 73 28 Q76 36 78 40 Z"
        fill="#5b9cf5"
        opacity="0.4"
      />

      {/* Glowing tip */}
      <circle
        cx="80"
        cy="45"
        r="2"
        fill="#9b6dff"
        filter="url(#logo-glow)"
      >
        <animate
          attributeName="opacity"
          values="0.5;1;0.5"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
