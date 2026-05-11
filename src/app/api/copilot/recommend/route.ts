import { NextRequest } from 'next/server';
import { getAgentConfig } from '@/lib/agent/config';
import { createOpenAIProvider } from '@/lib/agent/provider';
import { createSSEResponse } from '@/lib/agent/stream';
import {
  AGENT_INPUT_LIMITS,
  limitRecommendationClusters,
  limitText,
  markTruncated,
} from '@/lib/agent/inputLimits';
import { getBrandProfile } from '@/lib/copilot/profile';
import { buildRecommendPrompt } from '@/lib/copilot/recommend';
import { getMetricsStore } from '@/lib/metrics/store';
import type { AiNewsCluster } from '@/lib/ai-news/types';
import type { ChatMessage } from '@/lib/agent/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const config = getAgentConfig();
  if (!config) {
    return Response.json({ error: 'Agent 未配置' }, { status: 503 });
  }

  const profile = getBrandProfile();
  if (!profile) {
    return Response.json({ error: '请先配置品牌画像' }, { status: 400 });
  }

  let body: { clusters: AiNewsCluster[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '请求体解析失败' }, { status: 400 });
  }

  if (!body.clusters?.length) {
    return Response.json({ error: '没有可用的新闻话题' }, { status: 400 });
  }

  const limitedProfile = {
    ...profile,
    brandName: limitText(profile.brandName, AGENT_INPUT_LIMITS.brandProfileFieldChars).value,
    industry: limitText(profile.industry, AGENT_INPUT_LIMITS.brandProfileFieldChars).value,
    persona: limitText(profile.persona, AGENT_INPUT_LIMITS.brandProfileFieldChars).value,
    targetAudience: limitText(profile.targetAudience, AGENT_INPUT_LIMITS.brandProfileFieldChars)
      .value,
    contentStyle: limitText(profile.contentStyle, AGENT_INPUT_LIMITS.brandProfileFieldChars).value,
  };
  const profileTruncated = Object.entries(profile).some(([key, value]) => {
    const limited = limitText(String(value), AGENT_INPUT_LIMITS.brandProfileFieldChars);
    return limited.truncated && key in limitedProfile;
  });
  const limitedClusters = limitRecommendationClusters(body.clusters);

  const metricsStore = getMetricsStore();
  const summary = metricsStore.getSummary();
  let recentPerformance: string | undefined;
  if (summary.postCount > 0) {
    const byPlatform = metricsStore.aggregateByPlatform();
    const platformSummary = Object.entries(byPlatform)
      .map(([p, agg]) => `${p}: ${agg.views} 阅读/${agg.likes} 赞 (${agg.postCount} 篇)`)
      .join('；');
    recentPerformance = `共 ${summary.postCount} 篇，${summary.totalViews} 阅读、${summary.totalLikes} 赞。渠道分布：${platformSummary}`;
  }

  const prompt = buildRecommendPrompt(limitedProfile, limitedClusters.value, { recentPerformance });
  const messages: ChatMessage[] = [{ role: 'user', content: prompt }];
  const provider = createOpenAIProvider(config);
  const tokens = provider.stream({ messages, temperature: 0.7 });

  return markTruncated(
    createSSEResponse(tokens, request.signal),
    profileTruncated || limitedClusters.truncated,
  );
}
