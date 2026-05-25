import { getAgentConfig, isAgentConfigured } from '@/lib/agent/config';
import { createLLMProvider } from '@/lib/agent/provider';
import type { ChatMessage } from '@/lib/agent/types';
import type { ScoredAiNewsCluster } from '@/lib/ai-news/types';
import { logger } from '@/lib/logger';

const LLM_TIMEOUT_MS = 15_000;

async function callLLM(systemPrompt: string, userPrompt: string): Promise<string | null> {
  if (!isAgentConfigured()) return null;

  const config = getAgentConfig();
  if (!config) return null;

  const provider = createLLMProvider(config, config.provider);
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const chunks: string[] = [];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

  try {
    for await (const token of provider.stream({
      messages,
      temperature: 0.3,
      maxTokens: 512,
    })) {
      chunks.push(token);
    }
    return chunks.join('').trim();
  } catch (err) {
    logger.warn('LLM call failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

const SCORING_SYSTEM_PROMPT = `你是一个 AI 新闻编辑，负责为中文 AI 从业者评估新闻价值。
你需要对一条新闻聚合（可能包含多条来源报道）打分，并给出简短理由。

评分标准（0-100）：
- 热度：事件在社区/社交媒体的讨论量和传播速度
- 信息密度：这条新闻包含多少"可行动的"信息，而非泛泛的公关稿
- 实用价值：对中文 AI 从业者（开发者、产品经理、内容创作者）有多大参考意义

输出格式（严格遵守）：
分数|理由
例如：82|这是首个将AI助手作为攻击面的供应链攻击案例，对使用Claude Code和Cursor的开发者有直接安全影响。

只输出一行，不要其他内容。`;

export async function llmScoreCluster(
  cluster: ScoredAiNewsCluster,
): Promise<{ score: number; reason: string } | null> {
  const signals = cluster.signals.slice(0, 3);
  const signalInfo = signals
    .map((s, i) => `${i + 1}. [${s.sourceName}] ${s.title}\n   ${s.summary?.slice(0, 150) ?? ''}`)
    .join('\n');

  const userPrompt = `新闻标题：${cluster.title}
来源数量：${cluster.coverageCount} 条（官方 ${cluster.officialSourceCount}，媒体 ${cluster.mediaSourceCount}）
规则引擎评分：${cluster.totalScore}

信号列表：
${signalInfo}

请打分并给出理由。`;

  const result = await callLLM(SCORING_SYSTEM_PROMPT, userPrompt);
  if (!result) return null;

  const pipeIndex = result.indexOf('|');
  if (pipeIndex === -1) return null;

  const scoreStr = result.slice(0, pipeIndex).trim();
  const reason = result.slice(pipeIndex + 1).trim();

  const score = parseInt(scoreStr, 10);
  if (!Number.isFinite(score) || score < 0 || score > 100) return null;

  return { score, reason };
}

const RECOMMENDATION_SYSTEM_PROMPT = `你是一个面向中文 AI 从业者的新闻编辑。
为一条新闻写 1-2 句推荐理由，帮助读者快速判断"这条新闻跟我有什么关系"。

要求：
- 提供判断视角，不复述内容
- 直接说价值：对谁有用、能用来做什么、为什么现在值得关注
- 风格简洁有力，不要"值得注意的是"这类套话
- 中文输出，不超过 80 字`;

export async function llmGenerateRecommendation(
  cluster: ScoredAiNewsCluster,
): Promise<string | null> {
  const signals = cluster.signals.slice(0, 2);
  const signalInfo = signals.map((s) => `[${s.sourceName}] ${s.title}`).join('、');

  const userPrompt = `标题：${cluster.title}
来源：${signalInfo}
聚合数：${cluster.coverageCount} 条报道

写推荐理由。`;

  return callLLM(RECOMMENDATION_SYSTEM_PROMPT, userPrompt);
}

export interface LlmEnhancement {
  score: number | null;
  scoreReason: string | null;
  recommendation: string | null;
}

export async function enhanceClusterWithLLM(cluster: ScoredAiNewsCluster): Promise<LlmEnhancement> {
  const [scoringResult, recommendation] = await Promise.all([
    llmScoreCluster(cluster),
    llmGenerateRecommendation(cluster),
  ]);

  return {
    score: scoringResult?.score ?? null,
    scoreReason: scoringResult?.reason ?? null,
    recommendation,
  };
}

export function isLlmAvailable(): boolean {
  return isAgentConfigured();
}
