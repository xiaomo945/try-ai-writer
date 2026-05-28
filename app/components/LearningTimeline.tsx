"use client";

import { useHistory } from "@/lib/history";

type MilestoneStage = "initial" | "forming" | "mastered";

interface Milestone {
  stage: MilestoneStage;
  emoji: string;
  title: string;
  description: string;
  threshold: number;
}

const MILESTONES: Milestone[] = [
  {
    stage: "initial",
    emoji: "🌱",
    title: "初次学习",
    description: "首次上传范文或完成采访",
    threshold: 1,
  },
  {
    stage: "forming",
    emoji: "🌿",
    title: "风格形成",
    description: "累计10个样本，AI开始稳定输出风格一致的内容",
    threshold: 10,
  },
  {
    stage: "mastered",
    emoji: "🌳",
    title: "深度理解",
    description: "累计20个样本，AI能引用用户历史观点",
    threshold: 20,
  },
];

function getCurrentStage(sampleCount: number): MilestoneStage {
  if (sampleCount >= 20) return "mastered";
  if (sampleCount >= 10) return "forming";
  return "initial";
}

function getStageStatus(
  milestone: Milestone,
  currentStage: MilestoneStage
): "completed" | "current" | "pending" {
  const stageOrder: MilestoneStage[] = ["initial", "forming", "mastered"];
  const currentIndex = stageOrder.indexOf(currentStage);
  const milestoneIndex = stageOrder.indexOf(milestone.stage);

  if (milestoneIndex < currentIndex) return "completed";
  if (milestoneIndex === currentIndex) return "current";
  return "pending";
}

export function LearningTimeline() {
  const { records } = useHistory();
  const sampleCount = records.length;
  const currentStage = getCurrentStage(sampleCount);

  return (
    <div className="glass-card p-5">
      <h3 className="font-display font-bold text-white text-sm mb-4 flex items-center gap-2">
        <span>📈</span> 分身成长历程
      </h3>
      
      <div className="space-y-4">
        {MILESTONES.map((milestone, index) => {
          const status = getStageStatus(milestone, currentStage);
          const isLast = index === MILESTONES.length - 1;

          return (
            <div key={milestone.stage} className="relative">
              {!isLast && (
                <div 
                  className={`absolute left-4 top-10 w-0.5 h-6 ${
                    status === "completed" 
                      ? "bg-emerald-500" 
                      : "bg-slate-600"
                  }`}
                />
              )}
              
              <div className="flex items-start gap-3">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-all ${
                    status === "completed"
                      ? "bg-emerald-500/30 border-2 border-emerald-500"
                      : status === "current"
                      ? "bg-emerald-600/30 border-2 border-emerald-500 animate-pulse"
                      : "bg-slate-700 border-2 border-slate-600"
                  }`}
                >
                  {status === "completed" ? "✓" : milestone.emoji}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span 
                      className={`text-sm font-medium ${
                        status === "pending" ? "text-slate-500" : "text-white"
                      }`}
                    >
                      {milestone.title}
                    </span>
                    {status === "current" && (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                        进行中
                      </span>
                    )}
                  </div>
                  <p 
                    className={`text-xs mt-0.5 ${
                      status === "pending" ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    {milestone.description}
                  </p>
                  {status === "current" && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min((sampleCount / milestone.threshold) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-xs text-emerald-400 font-mono">
                        {sampleCount}/{milestone.threshold}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
