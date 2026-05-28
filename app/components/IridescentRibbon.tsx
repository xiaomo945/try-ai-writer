"use client";

interface IridescentRibbonProps {
  className?: string;
}

export function IridescentRibbon({ className = "" }: IridescentRibbonProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg
        className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A90E2" stopOpacity="0.6">
              <animate
                attributeName="stop-color"
                values="#4A90E2;#A855F7;#4A90E2"
                dur="8s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor="#A855F7" stopOpacity="0.4">
              <animate
                attributeName="stop-color"
                values="#A855F7;#4A90E2;#A855F7"
                dur="8s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#4A90E2" stopOpacity="0.6">
              <animate
                attributeName="stop-color"
                values="#4A90E2;#A855F7;#4A90E2"
                dur="8s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>

          <linearGradient id="secondaryGradient" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.3">
              <animate
                attributeName="stop-color"
                values="#60A5FA;#818CF8;#60A5FA"
                dur="12s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0.15">
              <animate
                attributeName="stop-color"
                values="#818CF8;#60A5FA;#818CF8"
                dur="12s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="blur">
            <feGaussianBlur stdDeviation="1" />
          </filter>
        </defs>

        <path
          className="main-ribbon"
          d="M-20 40 Q 10 20 30 50 T 70 30 T 120 60"
          fill="none"
          stroke="url(#mainGradient)"
          strokeWidth="0.3"
          filter="url(#glow)"
          strokeLinecap="round"
        />

        <path
          className="secondary-ribbon"
          d="M-20 60 Q 15 40 40 70 T 90 50 T 120 80"
          fill="none"
          stroke="url(#secondaryGradient)"
          strokeWidth="0.2"
          strokeLinecap="round"
        />

        <path
          className="tertiary-ribbon"
          d="M-10 50 Q 20 30 50 60 T 100 40"
          fill="none"
          stroke="#60A5FA"
          strokeWidth="0.1"
          strokeOpacity="0.2"
          strokeLinecap="round"
          strokeDasharray="5,3"
        />

        <g className="light-orbs">
          <circle
            className="orb orb-1"
            r="0.3"
            fill="#4A90E2"
            opacity="0.8"
          />
          <circle
            className="orb orb-2"
            r="0.2"
            fill="#A855F7"
            opacity="0.7"
          />
          <circle
            className="orb orb-3"
            r="0.25"
            fill="#818CF8"
            opacity="0.6"
          />
          <circle
            className="orb orb-4"
            r="0.15"
            fill="#60A5FA"
            opacity="0.5"
          />
          <circle
            className="orb orb-5"
            r="0.2"
            fill="#4A90E2"
            opacity="0.7"
          />
        </g>

        <style jsx>{`
          .main-ribbon {
            animation: moveRibbon 10s ease-in-out infinite;
          }

          .secondary-ribbon {
            animation: moveRibbon 15s ease-in-out infinite;
            animation-delay: -5s;
          }

          .tertiary-ribbon {
            animation: moveRibbonDash 20s linear infinite;
            animation-delay: -10s;
          }

          @keyframes moveRibbon {
            0% {
              d: path("M-20 40 Q 10 20 30 50 T 70 30 T 120 60");
            }
            25% {
              d: path("M-20 50 Q 20 30 50 60 T 90 40 T 120 70");
            }
            50% {
              d: path("M-20 45 Q 15 25 45 55 T 85 35 T 120 65");
            }
            75% {
              d: path("M-20 55 Q 25 35 55 65 T 95 45 T 120 75");
            }
            100% {
              d: path("M-20 40 Q 10 20 30 50 T 70 30 T 120 60");
            }
          }

          @keyframes moveRibbonDash {
            0% {
              stroke-dashoffset: 0;
              d: path("M-10 50 Q 20 30 50 60 T 100 40");
            }
            100% {
              stroke-dashoffset: 200;
              d: path("M-10 50 Q 20 30 50 60 T 100 40");
            }
          }

          .orb {
            filter: url(#glow);
          }

          .orb-1 {
            animation: moveOrb1 5s ease-in-out infinite;
          }

          .orb-2 {
            animation: moveOrb2 4s ease-in-out infinite;
            animation-delay: -1s;
          }

          .orb-3 {
            animation: moveOrb3 3.5s ease-in-out infinite;
            animation-delay: -2s;
          }

          .orb-4 {
            animation: moveOrb4 4.5s ease-in-out infinite;
            animation-delay: -3s;
          }

          .orb-5 {
            animation: moveOrb5 5.5s ease-in-out infinite;
            animation-delay: -4s;
          }

          @keyframes moveOrb1 {
            0% {
              cx: 10;
              cy: 40;
            }
            25% {
              cx: 30;
              cy: 50;
            }
            50% {
              cx: 50;
              cy: 30;
            }
            75% {
              cx: 70;
              cy: 60;
            }
            100% {
              cx: 90;
              cy: 40;
            }
          }

          @keyframes moveOrb2 {
            0% {
              cx: 15;
              cy: 60;
            }
            25% {
              cx: 35;
              cy: 40;
            }
            50% {
              cx: 55;
              cy: 70;
            }
            75% {
              cx: 75;
              cy: 50;
            }
            100% {
              cx: 95;
              cy: 60;
            }
          }

          @keyframes moveOrb3 {
            0% {
              cx: 20;
              cy: 30;
            }
            33% {
              cx: 45;
              cy: 60;
            }
            66% {
              cx: 70;
              cy: 40;
            }
            100% {
              cx: 95;
              cy: 30;
            }
          }

          @keyframes moveOrb4 {
            0% {
              cx: 25;
              cy: 70;
            }
            50% {
              cx: 60;
              cy: 35;
            }
            100% {
              cx: 95;
              cy: 70;
            }
          }

          @keyframes moveOrb5 {
            0% {
              cx: 30;
              cy: 50;
            }
            33% {
              cx: 50;
              cy: 30;
            }
            66% {
              cx: 70;
              cy: 55;
            }
            100% {
              cx: 90;
              cy: 50;
            }
          }

          .orb-1, .orb-2, .orb-3, .orb-4, .orb-5 {
            animation: moveOrb1 5s ease-in-out infinite, pulseOrb 2s ease-in-out infinite;
          }

          @keyframes pulseOrb {
            0%, 100% {
              opacity: 0.6;
              r: 0.2;
            }
            50% {
              opacity: 0.9;
              r: 0.3;
            }
          }

          @media (max-width: 768px) {
            .main-ribbon,
            .secondary-ribbon,
            .tertiary-ribbon {
              transform: scale(0.5);
            }
          }
        `}</style>
      </svg>

      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-900/5 to-purple-900/10" />
    </div>
  );
}
