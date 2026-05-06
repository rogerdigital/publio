import type { PlatformId } from '@/types';

// --- LLM Provider ---

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMStreamParams {
  messages: ChatMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMProvider {
  /** 返回 async iterable，逐 token yield 文本 */
  stream(params: LLMStreamParams): AsyncIterable<string>;
}

// --- Agent Config ---

export interface AgentConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

// --- Agent Actions ---

export type WritingAction =
  | 'expand'    // 扩写
  | 'condense'  // 缩写
  | 'rewrite'   // 改写
  | 'polish'    // 润色
  | 'continue'; // 续写

export type AgentAction = WritingAction | 'adapt' | 'research' | 'diagnose';

// --- Agent Request/Response ---

export interface WritingAgentRequest {
  action: WritingAction;
  content: string;
  title?: string;
  selection?: string; // 选中的文本片段（如有）
}

export interface AdaptAgentRequest {
  title: string;
  content: string;
  platform: PlatformId;
}

export interface ResearchAgentRequest {
  clusterTitle: string;
  signals: Array<{
    title: string;
    summary: string;
    source: string;
    publishedAt?: string;
  }>;
}

export interface DiagnoseAgentRequest {
  platform: PlatformId;
  errorMessage: string;
  statusCode?: number;
  context?: string;
}

// --- SSE Events ---

export interface AgentStreamDelta {
  type: 'delta';
  content: string;
}

export interface AgentStreamDone {
  type: 'done';
}

export interface AgentStreamError {
  type: 'error';
  error: string;
}

export type AgentStreamEvent = AgentStreamDelta | AgentStreamDone | AgentStreamError;

// --- Agent Store ---

export type AgentStreamStatus = 'idle' | 'streaming' | 'done' | 'error';
