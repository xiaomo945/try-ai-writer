"use client";

import { useMemo } from "react";
import Link from "next/link";
import { BarChart3, TrendingUp, PenLine } from "lucide-react";

interface WritingStatsProps {
  records: Array<{
    id: string;
    title: string;
    mode: string;
    result: string;
    createdAt: string;
  }>;
}

interface MonthData {
  label: string;
  count: number;
}

interface ModeData {
  mode: string;
  count: number;
  percentage: number;
}

interface DayData {
  label: string;
  count: number;
}

const MODE_COLORS: Record<string, { bar: string; text: string; bg: string }> = {
  blog: { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  email: { bar: "bg-blue-500", text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
  social: { bar: "bg-purple-500", text: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
  custom: { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
};

const DEFAULT_MODE_COLOR = { bar: "bg-slate-500", text: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800" };

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getMonthlyData(records: WritingStatsProps["records"]): MonthData[] {
  const now = new Date();
  const months: MonthData[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const label = MONTH_LABELS[month] ?? "";
    const count = records.filter((r) => {
      const rd = new Date(r.createdAt);
      return rd.getFullYear() === year && rd.getMonth() === month;
    }).length;
    months.push({ label, count });
  }

  return months;
}

function getModeData(records: WritingStatsProps["records"]): ModeData[] {
  const modeMap = new Map<string, number>();
  for (const r of records) {
    const current = modeMap.get(r.mode) ?? 0;
    modeMap.set(r.mode, current + 1);
  }

  const total = records.length;
  const sorted = Array.from(modeMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return sorted.map(([mode, count]) => ({
    mode,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }));
}

function getWeeklyData(records: WritingStatsProps["records"]): DayData[] {
  const now = new Date();
  const days: DayData[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();
    const dayOfWeek = d.getDay();
    const label = DAY_LABELS[dayOfWeek] ?? "";
    const count = records.filter((r) => {
      const rd = new Date(r.createdAt);
      return rd.getFullYear() === year && rd.getMonth() === month && rd.getDate() === day;
    }).length;
    days.push({ label, count });
  }

  return days;
}

function MonthlyBarChart({ data }: { data: MonthData[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const barHeight = 140;

  return (
    <div className="glass-card-emerald p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
          月度生成趋势
        </h3>
      </div>

      <div className="flex items-end justify-between gap-3 sm:gap-4" style={{ height: `${barHeight + 40}px` }}>
        {data.map((item, index) => {
          const barPixelHeight = Math.max((item.count / maxCount) * barHeight, item.count > 0 ? 8 : 2);
          return (
            <div key={index} className="flex flex-col items-center flex-1 h-full justify-end">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                {item.count > 0 ? item.count : ""}
              </span>
              <div
                className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-500"
                style={{ height: `${barPixelHeight}px` }}
              />
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-2">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ModeBarChart({ data }: { data: ModeData[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="glass-card-emerald p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
          <PenLine className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
          热门写作模式
        </h3>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => {
          const colors = MODE_COLORS[item.mode] ?? DEFAULT_MODE_COLOR;
          const barWidth = Math.max((item.count / maxCount) * 100, 4);
          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-sm font-semibold capitalize ${colors.text}`}>
                  {item.mode}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {item.count}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {item.percentage}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeeklyLineChart({ data }: { data: DayData[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const chartWidth = 280;
  const chartHeight = 120;
  const paddingX = 20;
  const paddingY = 10;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  const points = data.map((item, index) => {
    const x = paddingX + (data.length > 1 ? (index / (data.length - 1)) * innerWidth : innerWidth / 2);
    const y = paddingY + innerHeight - (item.count / maxCount) * innerHeight;
    return { x, y, count: item.count, label: item.label };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="glass-card-emerald p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
          近7天趋势
        </h3>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + 24}`}
          className="w-full max-w-md mx-auto"
          style={{ minWidth: "260px" }}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingY + innerHeight - ratio * innerHeight;
            return (
              <line
                key={ratio}
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                stroke="currentColor"
                className="text-slate-200 dark:text-gray-700"
                strokeWidth="0.5"
                strokeDasharray="4,4"
              />
            );
          })}

          {/* Area fill under the line */}
          {points.length > 1 && (
            <polygon
              points={`${points[0]?.x},${paddingY + innerHeight} ${polylinePoints} ${points[points.length - 1]?.x},${paddingY + innerHeight}`}
              fill="url(#emeraldGradient)"
              opacity="0.15"
            />
          )}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Polyline */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points and labels */}
          {points.map((p, index) => (
            <g key={index}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#10b981"
                stroke="white"
                strokeWidth="2"
                className="dark:stroke-gray-900"
              />
              {/* Count label above point */}
              {p.count > 0 && (
                <text
                  x={p.x}
                  y={p.y - 10}
                  textAnchor="middle"
                  className="fill-emerald-600 dark:fill-emerald-400"
                  fontSize="9"
                  fontWeight="bold"
                >
                  {p.count}
                </text>
              )}
              {/* Day label below */}
              <text
                x={p.x}
                y={chartHeight + 16}
                textAnchor="middle"
                className="fill-slate-500 dark:fill-slate-400"
                fontSize="10"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function GuidanceCard() {
  return (
    <div className="glass-card-emerald p-8 sm:p-10 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
        <BarChart3 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">
        写作统计
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto">
        生成至少3篇文章后，这里将展示你的写作趋势分析
      </p>
      <Link
        href="/write"
        className="btn-primary inline-flex items-center gap-2 text-sm"
      >
        <PenLine className="w-4 h-4" />
        开始写作
      </Link>
    </div>
  );
}

export function WritingStats({ records }: WritingStatsProps) {
  const monthlyData = useMemo(() => getMonthlyData(records), [records]);
  const modeData = useMemo(() => getModeData(records), [records]);
  const weeklyData = useMemo(() => getWeeklyData(records), [records]);

  if (records.length < 3) {
    return <GuidanceCard />;
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <MonthlyBarChart data={monthlyData} />
        <ModeBarChart data={modeData} />
      </div>
      <WeeklyLineChart data={weeklyData} />
    </div>
  );
}
