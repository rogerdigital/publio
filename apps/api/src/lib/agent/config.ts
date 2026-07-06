import { getEnvValue } from '@/lib/config';
import type { AgentConfig, LLMProviderType } from './types';

/**
 * 从 .env.local 文件实时读取 Agent 配置（绕过 process.env 缓存）。
 * 所有必填字段（baseUrl / apiKey / model）为空时返回 null。
 */
export function getAgentConfig(): (AgentConfig & { provider: LLMProviderType }) | null {
  const baseUrl = getEnvValue('AGENT_BASE_URL').trim();
  const apiKey = getEnvValue('AGENT_API_KEY').trim();
  const model = getEnvValue('AGENT_MODEL').trim();

  if (!baseUrl || !apiKey || !model) {
    return null;
  }

  const providerRaw = getEnvValue('AGENT_PROVIDER').trim().toLowerCase();
  const provider: LLMProviderType = providerRaw === 'anthropic' ? 'anthropic' : 'openai';

  const maxTokensRaw = getEnvValue('AGENT_MAX_TOKENS');
  const temperatureRaw = getEnvValue('AGENT_TEMPERATURE');

  return {
    baseUrl: baseUrl.replace(/\/$/, ''),
    apiKey,
    model,
    maxTokens: parseInt(maxTokensRaw || '2048', 10),
    temperature: parseFloat(temperatureRaw || '0.7'),
    provider,
  };
}

/**
 * 检查 Agent 功能是否可用（配置完整）
 */
export function isAgentConfigured(): boolean {
  return getAgentConfig() !== null;
}
