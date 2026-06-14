"use client";

import { useMemo } from "react";

interface StyleData {
  formality?: number;
  sentenceLength?: number;
  vocabularyDiversity?: number;
  paragraphLength?: number;
  passiveVoiceRate?: number;
}

interface StyleRadarProps {
  initialData?: StyleData;
  currentData?: StyleData;
  className?: string;
}

export function StyleRadar({
  initialData,
  currentData,
  className = "",
}: StyleRadarProps) {
  const dimensions = [
    { key: "formality", label: "正式度", value: 0 },
    { key: "sentenceLength", label: "句长", value: 0 },
    { key: "vocabularyDiversity", label: "词汇多样性", value: 0 },
    { key: "paragraphLength", label: "段落长度", value: 0 },
    { key: "passiveVoiceRate", label: "被动语态", value: 0 },
  ];

  const size = 200;
  const center = size / 2;
  const maxRadius = 80;
  const labelRadius = 95;

  const points = useMemo(() => {
    return dimensions.map((dim, index) => {
      const angle = (index * 2 * Math.PI) / dimensions.length - Math.PI / 2;
      const value = currentData?.[dim.key as keyof StyleData] || 50;
      const radius = (value / 100) * maxRadius;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
        labelX: center + labelRadius * Math.cos(angle),
        labelY: center + labelRadius * Math.sin(angle),
        value,
        label: dim.label,
      };
    });
  }, [currentData]);

  const initialPoints = useMemo(() => {
    if (!initialData) return null;
    return dimensions.map((dim, index) => {
      const angle = (index * 2 * Math.PI) / dimensions.length - Math.PI / 2;
      const value = initialData[dim.key as keyof StyleData] || 50;
      const radius = (value / 100) * maxRadius;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
      };
    });
  }, [initialData, center, maxRadius]);

  const currentPointsPath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const initialPointsPath = initialPoints
    ? initialPoints
        .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
        .join(" ")
    : null;

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];

  return (
    <div className={`relative ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="mx-auto"
      >
        {/* Grid circles */}
        {gridLevels.map((level, index) => (
          <circle
            key={index}
            cx={center}
            cy={center}
            r={maxRadius * level}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        ))}

        {/* Grid lines */}
        {dimensions.map((_, index) => {
          const angle = (index * 2 * Math.PI) / dimensions.length - Math.PI / 2;
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={center + maxRadius * Math.cos(angle)}
              y2={center + maxRadius * Math.sin(angle)}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* Initial data (dashed line) */}
        {initialPointsPath && (
          <path
            d={initialPointsPath + " Z"}
            fill="rgba(100,116,139,0.1)"
            stroke="rgba(100,116,139,0.5)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        )}

        {/* Current data (solid line with fill) */}
        <path
          d={currentPointsPath + " Z"}
          fill="rgba(5,150,105,0.2)"
          stroke="#059669"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#059669"
            stroke="#fff"
            strokeWidth="2"
          />
        ))}

        {/* Labels */}
        {points.map((point, index) => {
          const textAnchor =
            Math.abs(point.labelX - center) < 5
              ? "middle"
              : point.labelX > center
              ? "start"
              : "end";
          const dy = point.labelY > center ? "0.8em" : "-0.2em";

          return (
            <text
              key={index}
              x={point.labelX}
              y={point.labelY}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              className="fill-slate-400 text-xs"
            >
              {point.label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-emerald-500" />
          <span className="text-slate-400">现在</span>
        </div>
        {initialData && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 border-t-2 border-dashed border-slate-500" />
            <span className="text-slate-400">首次</span>
          </div>
        )}
      </div>
    </div>
  );
}
