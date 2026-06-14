import { IndustryBenchmark, StyleAnalysis } from "./analysis-types";

// Industry benchmark data (pre-defined)
const INDUSTRY_BENCHMARKS: Record<string, IndustryBenchmark> = {
  technology: {
    industry: "technology",
    avgToneScore: 72,
    avgReadability: 65,
    avgEngagement: 68,
    avgVocabularyDiversity: 0.75,
    topKeywords: ["创新", "技术", "解决方案", "平台", "数据", "AI", "云计算"],
  },
  marketing: {
    industry: "marketing",
    avgToneScore: 78,
    avgReadability: 72,
    avgEngagement: 82,
    avgVocabularyDiversity: 0.68,
    topKeywords: ["品牌", "营销", "增长", "转化", "用户", "内容", "策略"],
  },
  education: {
    industry: "education",
    avgToneScore: 65,
    avgReadability: 78,
    avgEngagement: 60,
    avgVocabularyDiversity: 0.7,
    topKeywords: ["学习", "教育", "课程", "知识", "培训", "技能", "教学"],
  },
  ecommerce: {
    industry: "ecommerce",
    avgToneScore: 75,
    avgReadability: 80,
    avgEngagement: 85,
    avgVocabularyDiversity: 0.62,
    topKeywords: ["产品", "购买", "优惠", "品质", "服务", "配送", "评价"],
  },
  finance: {
    industry: "finance",
    avgToneScore: 68,
    avgReadability: 55,
    avgEngagement: 55,
    avgVocabularyDiversity: 0.72,
    topKeywords: ["投资", "收益", "风险", "理财", "资产", "回报", "分析"],
  },
  healthcare: {
    industry: "healthcare",
    avgToneScore: 62,
    avgReadability: 60,
    avgEngagement: 58,
    avgVocabularyDiversity: 0.68,
    topKeywords: ["健康", "医疗", "治疗", "护理", "患者", "医生", "康复"],
  },
  lifestyle: {
    industry: "lifestyle",
    avgToneScore: 82,
    avgReadability: 85,
    avgEngagement: 88,
    avgVocabularyDiversity: 0.65,
    topKeywords: ["生活", "时尚", "美食", "旅行", "家居", "健康", "美容"],
  },
};

// Get benchmark for an industry
export function getIndustryBenchmark(industry: string): IndustryBenchmark | null {
  return INDUSTRY_BENCHMARKS[industry.toLowerCase()] || null;
}

// Compare analysis with industry benchmark
export function compareWithBenchmark(
  analysis: StyleAnalysis,
  industry: string
): {
  benchmark: IndustryBenchmark | null;
  comparisons: {
    tone: { score: number; benchmark: number; diff: number };
    readability: { score: number; benchmark: number; diff: number };
    engagement: { score: number; benchmark: number; diff: number };
    vocabulary: { score: number; benchmark: number; diff: number };
  };
  overallDiff: number;
} {
  const benchmark = getIndustryBenchmark(industry);

  if (!benchmark) {
    return {
      benchmark: null,
      comparisons: {
        tone: { score: analysis.tone.toneScore, benchmark: 0, diff: 0 },
        readability: { score: analysis.readability.fleschReadingEase, benchmark: 0, diff: 0 },
        engagement: { score: analysis.engagement.engagementScore, benchmark: 0, diff: 0 },
        vocabulary: { score: analysis.vocabulary.lexicalDiversity * 100, benchmark: 0, diff: 0 },
      },
      overallDiff: 0,
    };
  }

  const toneScore = analysis.tone.toneScore;
  const readabilityScore = analysis.readability.fleschReadingEase;
  const engagementScore = analysis.engagement.engagementScore;
  const vocabularyScore = analysis.vocabulary.lexicalDiversity * 100;

  const avgBenchmarkScore =
    (benchmark.avgToneScore + benchmark.avgReadability + benchmark.avgEngagement) / 3;

  return {
    benchmark,
    comparisons: {
      tone: {
        score: toneScore,
        benchmark: benchmark.avgToneScore,
        diff: toneScore - benchmark.avgToneScore,
      },
      readability: {
        score: readabilityScore,
        benchmark: benchmark.avgReadability,
        diff: readabilityScore - benchmark.avgReadability,
      },
      engagement: {
        score: engagementScore,
        benchmark: benchmark.avgEngagement,
        diff: engagementScore - benchmark.avgEngagement,
      },
      vocabulary: {
        score: vocabularyScore,
        benchmark: benchmark.avgVocabularyDiversity * 100,
        diff: vocabularyScore - benchmark.avgVocabularyDiversity * 100,
      },
    },
    overallDiff: analysis.overallScore - avgBenchmarkScore,
  };
}

// Get all available industries
export function getAvailableIndustries(): string[] {
  return Object.keys(INDUSTRY_BENCHMARKS);
}
