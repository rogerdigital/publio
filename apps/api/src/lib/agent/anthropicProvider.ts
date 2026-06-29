import type { AgentConfig, ChatMessage, LLMProvider, LLMStreamParams } from './types';
import { logger } from '@/lib/logger';

const MAX_RETRIES = 3;
const TIMEOUT_MS = 30_000;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(status: number) {
  return status >= 500 || status === 429;
}

/**
 * Anthropic Claude LLM provider.
 * Uses the Messages API (/v1/messages) with streaming.
 */
export function createAnthropicProvider(config: AgentConfig): LLMProvider {
  return {
    async *stream(params: LLMStreamParams): AsyncIterable<string> {
      const url = `${config.baseUrl}/messages`;
      const model = params.model || config.model;

      // Anthropic requires separating system from conversation messages
      const systemMessages: string[] = [];
      const conversationMessages: ChatMessage[] = [];

      for (const m of params.messages) {
        if (m.role === 'system') {
          systemMessages.push(m.content);
        } else {
          conversationMessages.push(m);
        }
      }

      const body: Record<string, unknown> = {
        model,
        max_tokens: params.maxTokens ?? config.maxTokens,
        temperature: params.temperature ?? config.temperature,
        stream: true,
        messages: conversationMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      };

      if (systemMessages.length > 0) {
        body.system = systemMessages.join('\n\n');
      }

      // 阶段一：建立连接（建连失败可重试）。一旦拿到 response 就 break，
      // 避免流消费中途失败后重试导致已 yield 的内容被重复输出。
      let response: Response | undefined;
      let lastError: Error | undefined;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0) {
          const backoff = Math.min(1000 * 2 ** (attempt - 1), 4000);
          logger.warn(`Anthropic request retry ${attempt}/${MAX_RETRIES}`, {
            model,
            backoffMs: backoff,
          });
          await delay(backoff);
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': config.apiKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify(body),
            signal: controller.signal,
          });

          if (!res.ok) {
            const errorText = await res.text().catch(() => '');
            const err = new Error(
              `Anthropic API error ${res.status}: ${errorText || res.statusText}`,
            );
            if (isRetryable(res.status) && attempt < MAX_RETRIES) {
              lastError = err;
              continue;
            }
            throw err;
          }

          if (!res.body) {
            throw new Error('Anthropic API returned empty body');
          }

          response = res;
          break;
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') {
            lastError = new Error('Anthropic request timeout');
          } else if (err instanceof Error) {
            lastError = err;
          } else {
            lastError = new Error(String(err));
          }

          if (attempt < MAX_RETRIES) continue;
          throw lastError;
        } finally {
          clearTimeout(timeout);
        }
      }

      if (!response || !response.body) {
        throw lastError ?? new Error('Anthropic request failed after retries');
      }

      // 阶段二：消费流（一旦开始 yield 就不再重试，直接抛错）。
      // Parse SSE stream manually (Anthropic uses a different event format)
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6);
            if (!data || data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);

              // Anthropic streaming events:
              // content_block_delta: { type: 'content_block_delta', delta: { type: 'text_delta', text: '...' } }
              // message_stop: end of stream
              if (
                parsed.type === 'content_block_delta' &&
                parsed.delta?.type === 'text_delta' &&
                parsed.delta?.text
              ) {
                yield parsed.delta.text;
              }

              if (parsed.type === 'message_stop') {
                return;
              }
            } catch {
              // Skip unparseable events
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    },
  };
}
