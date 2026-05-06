import { readFileSync } from 'fs';
import { join } from 'path';
import { parseEnvFile } from '@/lib/storage/envFile';
import type { AgentConfig } from './types';

/**
 * 从 .env.local 文件实时读取 Agent 配置（绕过 process.env 缓存）。
 * 所有必填字段（baseUrl / apiKey / model）为空时返回 null。
 */
export function getAgentConfig(): AgentConfig | null {
  // 优先从文件实时读取，支持热更新（settings 页面保存后立即生效）
  let envValues: Record<string, string> = {};
  try {
    const content = readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
    envValues = parseEnvFile(content);
  } catch {
    // 文件不存在，fallback 到 process.env
  }

  const baseUrl = (envValues.AGENT_BASE_URL || process.env.AGENT_BASE_URL || '').trim();
  const apiKey = (envValues.AGENT_API_KEY || process.env.AGENT_API_KEY || '').trim();
  const model = (envValues.AGENT_MODEL || process.env.AGENT_MODEL || '').trim();

  if (!baseUrl || !apiKey || !model) {
    return null;
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ''),
    apiKey,
    model,
    maxTokens: parseInt(envValues.AGENT_MAX_TOKENS || process.env.AGENT_MAX_TOKENS || '2048', 10),
    temperature: parseFloat(envValues.AGENT_TEMPERATURE || process.env.AGENT_TEMPERATURE || '0.7'),
  };
}

/**
 * 检查 Agent 功能是否可用（配置完整）
 */
export function isAgentConfigured(): boolean {
  return getAgentConfig() !== null;
}
