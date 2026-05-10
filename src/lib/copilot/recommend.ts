import type { BrandProfile, TopicRecommendation } from './types';
import type { AiNewsCluster } from '@/lib/ai-news/types';

export function buildRecommendPrompt(
  profile: BrandProfile,
  clusters: AiNewsCluster[],
): string {
  const clusterSummary = clusters
    .slice(0, 10)
    .map(
      (c, i) =>
        `${i + 1}. "${c.title}" — ${c.primarySignal.title} (来源: ${c.signals.map((s) => s.sourceName).join(', ')}, 覆盖: ${c.coverageCount})`,
    )
    .join('\n');

  return `你是一位资深内容运营顾问。请根据以下品牌画像和当前热点新闻，推荐 3-5 个适合该品牌的内容选题。

## 品牌画像
- 品牌名：${profile.brandName}
- 行业：${profile.industry}
- 人设/语调：${profile.persona}
- 目标受众：${profile.targetAudience}
- 内容风格：${profile.contentStyle}

## 当前热点新闻
${clusterSummary}

## 输出格式
请严格按以下 JSON 数组格式输出，不要输出其他内容：
[
  {
    "title": "选题标题",
    "reason": "为什么推荐这个选题（与品牌画像的匹配点）",
    "angle": "建议的写作角度",
    "estimatedEngagement": "high/medium/low",
    "relatedSignals": ["相关新闻标题1", "相关新闻标题2"]
  }
]`;
}

export function parseRecommendations(raw: string): TopicRecommendation[] {
  // Extract JSON array from response
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]) as TopicRecommendation[];
    return parsed.filter(
      (r) =>
        typeof r.title === 'string' &&
        typeof r.reason === 'string' &&
        typeof r.angle === 'string',
    );
  } catch {
    return [];
  }
}
