import type { AgentConfig } from './types';

/**
 * 从环境变量读取 Agent 配置。
 * 所有必填字段（baseUrl / apiKey / model）为空时返回 null。
 */
export function getAgentConfig(): AgentConfig | null {
  const baseUrl = process.env.AGENT_BASE_URL?.trim();
  const apiKey = process.env.AGENT_API_KEY?.trim();
  const model = process.env.AGENT_MODEL?.trim();

  if (!baseUrl || !apiKey || !model) {
    return null;
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ''), // 去掉尾部斜杠
    apiKey,
    model,
    maxTokens: parseInt(process.env.AGENT_MAX_TOKENS || '2048', 10),
    temperature: parseFloat(process.env.AGENT_TEMPERATURE || '0.7'),
  };
}

/**
 * 检查 Agent 功能是否可用（配置完整）
 */
export function isAgentConfigured(): boolean {
  return getAgentConfig() !== null;
}
