import type { ChatMessage } from '@/lib/agent/types';
import type { AiNewsCluster } from '@/lib/ai-news/types';

export const AGENT_INPUT_LIMITS = {
  titleChars: 200,
  contentChars: 12_000,
  selectionChars: 4_000,
  customPromptChars: 2_000,
  diagnoseContextChars: 4_000,
  chatMessages: 20,
  chatMessageChars: 4_000,
  researchSignals: 12,
  signalTitleChars: 240,
  signalSummaryChars: 1_200,
  signalSourceChars: 120,
  recommendationClusters: 10,
  clusterSignals: 5,
  brandProfileFieldChars: 600,
} as const;

export interface LimitedValue<T> {
  value: T;
  truncated: boolean;
}

export function limitText(value: string | undefined, maxChars: number): LimitedValue<string> {
  if (!value) return { value: '', truncated: false };
  if (value.length <= maxChars) return { value, truncated: false };
  return { value: value.slice(0, maxChars), truncated: true };
}

export function limitChatMessages(messages: ChatMessage[]): LimitedValue<ChatMessage[]> {
  const recentMessages = messages.slice(-AGENT_INPUT_LIMITS.chatMessages);
  let truncated = recentMessages.length !== messages.length;

  const value = recentMessages.map((message) => {
    const limitedContent = limitText(message.content, AGENT_INPUT_LIMITS.chatMessageChars);
    if (limitedContent.truncated) truncated = true;
    return {
      ...message,
      content: limitedContent.value,
    };
  });

  return { value, truncated };
}

export function limitResearchSignals<
  T extends { title: string; summary: string; source: string; publishedAt?: string },
>(signals: T[]): LimitedValue<T[]> {
  const limitedSignals = signals.slice(0, AGENT_INPUT_LIMITS.researchSignals);
  let truncated = limitedSignals.length !== signals.length;

  const value = limitedSignals.map((signal) => {
    const title = limitText(signal.title, AGENT_INPUT_LIMITS.signalTitleChars);
    const summary = limitText(signal.summary, AGENT_INPUT_LIMITS.signalSummaryChars);
    const source = limitText(signal.source, AGENT_INPUT_LIMITS.signalSourceChars);
    if (title.truncated || summary.truncated || source.truncated) truncated = true;
    return {
      ...signal,
      title: title.value,
      summary: summary.value,
      source: source.value,
    };
  });

  return { value, truncated };
}

export function limitRecommendationClusters(
  clusters: AiNewsCluster[],
): LimitedValue<AiNewsCluster[]> {
  const limitedClusters = clusters.slice(0, AGENT_INPUT_LIMITS.recommendationClusters);
  let truncated = limitedClusters.length !== clusters.length;

  const value = limitedClusters.map((cluster) => {
    const title = limitText(cluster.title, AGENT_INPUT_LIMITS.signalTitleChars);
    const primaryTitle = limitText(
      cluster.primarySignal.title,
      AGENT_INPUT_LIMITS.signalTitleChars,
    );
    const signals = cluster.signals.slice(0, AGENT_INPUT_LIMITS.clusterSignals).map((signal) => {
      const sourceName = limitText(signal.sourceName, AGENT_INPUT_LIMITS.signalSourceChars);
      if (sourceName.truncated) truncated = true;
      return { ...signal, sourceName: sourceName.value };
    });

    if (title.truncated || primaryTitle.truncated || signals.length !== cluster.signals.length) {
      truncated = true;
    }

    return {
      ...cluster,
      title: title.value,
      primarySignal: {
        ...cluster.primarySignal,
        title: primaryTitle.value,
      },
      signals,
    };
  });

  return { value, truncated };
}

export function markTruncated(response: Response, truncated: boolean): Response {
  if (truncated) {
    response.headers.set('X-Agent-Input-Truncated', 'true');
  }
  return response;
}
