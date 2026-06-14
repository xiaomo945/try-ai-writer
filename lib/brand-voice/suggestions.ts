import { StyleSuggestion, StyleAnalysis, StyleDimensions } from "./analysis-types";
import { randomUUID } from "crypto";

// Generate style suggestions based on analysis
export function generateStyleSuggestions(analysis: StyleAnalysis): StyleSuggestion[] {
  const suggestions: StyleSuggestion[] = [];

  // Tone suggestions
  if (analysis.tone.toneScore < 50) {
    suggestions.push({
      id: randomUUID(),
      analysisId: analysis.id,
      dimension: StyleDimensions.TONE,
      priority: "high",
      title: "增强语气表达",
      description: "当前文本的语气表达较弱，建议增加更多情感词汇和语气词。",
      suggestion:
        '尝试使用更强烈的语气词，如"强烈推荐"、"绝对值得"、"令人惊叹"等，以增强文本的感染力。',
      impact: "预计可提升语气评分15-25分",
    });
  } else if (analysis.tone.toneScore < 70) {
    suggestions.push({
      id: randomUUID(),
      analysisId: analysis.id,
      dimension: StyleDimensions.TONE,
      priority: "medium",
      title: "优化语气一致性",
      description: "文本语气基本到位，但可以更加一致和鲜明。",
      suggestion: "确保全文保持统一的语气风格，避免在不同段落间出现语气跳跃。",
      impact: "预计可提升语气评分5-15分",
    });
  }

  // Vocabulary suggestions
  if (analysis.vocabulary.lexicalDiversity < 0.5) {
    suggestions.push({
      id: randomUUID(),
      analysisId: analysis.id,
      dimension: StyleDimensions.VOCABULARY,
      priority: "high",
      title: "丰富词汇多样性",
      description: "词汇重复率较高，建议增加同义词替换和多样化表达。",
      suggestion:
        '使用同义词词典替换重复词汇，增加专业术语和行业用语，提升文本的专业度。',
      impact: "预计可提升词汇多样性20-30%",
    });
  }

  if (analysis.vocabulary.powerWords.length < 3) {
    suggestions.push({
      id: randomUUID(),
      analysisId: analysis.id,
      dimension: StyleDimensions.VOCABULARY,
      priority: "medium",
      title: "增加力量词汇",
      description: "文本中缺少有力的关键词和表达。",
      suggestion:
        '在关键位置添加力量词汇，如"创新"、"突破"、"领先"、"卓越"等，增强说服力。',
      impact: "预计可提升文本影响力10-20%",
    });
  }

  // Sentence structure suggestions
  if (analysis.sentenceStructure.avgSentenceLength > 25) {
    suggestions.push({
      id: randomUUID(),
      analysisId: analysis.id,
      dimension: StyleDimensions.SENTENCE_STRUCTURE,
      priority: "high",
      title: "简化句子结构",
      description: "平均句子长度过长，可能影响可读性。",
      suggestion:
        "将长句拆分为2-3个短句，每句控制在15-20字以内。使用简单句、并列句和复合句的混合结构。",
      impact: "预计可提升可读性15-25分",
    });
  }

  if (analysis.sentenceStructure.sentenceLengthVariance > 30) {
    suggestions.push({
      id: randomUUID(),
      analysisId: analysis.id,
      dimension: StyleDimensions.SENTENCE_STRUCTURE,
      priority: "medium",
      title: "平衡句子长度",
      description: "句子长度差异过大，影响阅读节奏。",
      suggestion:
        "保持句子长度的适度变化，避免过短和过长的句子交替出现。建议句子长度控制在10-25字之间。",
      impact: "预计可改善阅读流畅度10-15%",
    });
  }

  if (analysis.sentenceStructure.activeVoiceRatio < 0.7) {
    suggestions.push({
      id: randomUUID(),
      analysisId: analysis.id,
      dimension: StyleDimensions.SENTENCE_STRUCTURE,
      priority: "medium",
      title: "增加主动语态",
      description: "被动语态使用过多，影响文本的直接性和力量感。",
      suggestion:
        "将被动语态转换为主动语态。例如，将'产品被用户喜爱'改为'用户喜爱产品'。",
      impact: "预计可提升文本力量感15-20%",
    });
  }

  // Readability suggestions
  if (analysis.readability.fleschReadingEase < 50) {
    suggestions.push({
      id: randomUUID(),
      analysisId: analysis.id,
      dimension: StyleDimensions.READABILITY,
      priority: "high",
      title: "提升可读性",
      description: "文本可读性较低，可能难以理解。",
      suggestion:
        "简化复杂词汇，缩短句子长度，增加段落间隔。使用更通俗易懂的表达方式。",
      impact: "预计可提升可读性评分20-30分",
    });
  } else if (analysis.readability.fleschReadingEase < 65) {
    suggestions.push({
      id: randomUUID(),
      analysisId: analysis.id,
      dimension: StyleDimensions.READABILITY,
      priority: "medium",
      title: "优化阅读体验",
      description: "文本可读性中等，仍有提升空间。",
      suggestion:
        "适当简化部分复杂表达，增加过渡词和连接词，使文章更加流畅。",
      impact: "预计可提升可读性评分10-15分",
    });
  }

  // Engagement suggestions
  if (analysis.engagement.hookStrength < 60) {
    suggestions.push({
      id: randomUUID(),
      analysisId: analysis.id,
      dimension: StyleDimensions.ENGAGEMENT,
      priority: "high",
      title: "强化开头吸引力",
      description: "文章开头缺乏吸引力，难以抓住读者注意力。",
      suggestion:
        "使用引人入胜的开头，如提问、惊人数据、有趣故事或直接指出读者痛点。前3句话至关重要。",
      impact: "预计可提升开头吸引力20-30%",
    });
  }

  if (analysis.engagement.callToActionCount === 0) {
    suggestions.push({
      id: randomUUID(),
      analysisId: analysis.id,
      dimension: StyleDimensions.ENGAGEMENT,
      priority: "high",
      title: "添加行动号召",
      description: "文本缺少明确的行动号召（CTA）。",
      suggestion:
        '在文章结尾添加清晰的CTA，如"立即开始"、"了解更多"、"免费试用"等，引导读者采取行动。',
      impact: "预计可提升转化率15-25%",
    });
  }

  if (analysis.engagement.questionCount === 0) {
    suggestions.push({
      id: randomUUID(),
      analysisId: analysis.id,
      dimension: StyleDimensions.ENGAGEMENT,
      priority: "low",
      title: "增加互动性问题",
      description: "文本中缺少与读者互动的问题。",
      suggestion: "在适当位置添加修辞性问题或直接提问，引发读者思考，增强参与感。",
      impact: "预计可提升读者参与度10-15%",
    });
  }

  if (analysis.engagement.emotionalWords < 3) {
    suggestions.push({
      id: randomUUID(),
      analysisId: analysis.id,
      dimension: StyleDimensions.ENGAGEMENT,
      priority: "medium",
      title: "增加情感词汇",
      description: "文本情感表达不足，难以引起读者共鸣。",
      suggestion:
        '添加情感词汇，如"令人兴奋"、"值得关注"、"不容错过"等，增强文本的感染力。',
      impact: "预计可提升情感共鸣15-20%",
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return suggestions.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}

// Get top suggestions
export function getTopSuggestions(
  analysis: StyleAnalysis,
  limit: number = 5
): StyleSuggestion[] {
  return generateStyleSuggestions(analysis).slice(0, limit);
}

// Get suggestions by dimension
export function getSuggestionsByDimension(
  analysis: StyleAnalysis,
  dimension: keyof typeof StyleDimensions
): StyleSuggestion[] {
  const dimensionValue = StyleDimensions[dimension];
  return generateStyleSuggestions(analysis).filter(
    (s) => s.dimension === dimensionValue
  );
}
