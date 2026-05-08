import { EventSourceParserStream } from 'eventsource-parser/stream';
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
 * OpenAI-compatible LLM provider。
 * 支持任何兼容 /v1/chat/completions 的 API（OpenAI、DeepSeek、Ollama 等）。
 */
export function createOpenAIProvider(config: AgentConfig): LLMProvider {
  return {
    async *stream(params: LLMStreamParams): AsyncIterable<string> {
      const url = `${config.baseUrl}/chat/completions`;
      const model = params.model || config.model;

      const body = {
        model,
        messages: params.messages.map((m: ChatMessage) => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: params.maxTokens ?? config.maxTokens,
        temperature: params.temperature ?? config.temperature,
        stream: true,
      };

      let lastError: Error | undefined;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0) {
          const backoff = Math.min(1000 * 2 ** (attempt - 1), 4000);
          logger.warn(`LLM request retry ${attempt}/${MAX_RETRIES}`, { model, backoffMs: backoff });
          await delay(backoff);
        }

        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

          let response: Response;
          try {
            response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${config.apiKey}`,
              },
              body: JSON.stringify(body),
              signal: controller.signal,
            });
          } finally {
            clearTimeout(timeout);
          }

          if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            const err = new Error(
              `LLM API error ${response.status}: ${errorText || response.statusText}`,
            );

            if (isRetryable(response.status) && attempt < MAX_RETRIES) {
              lastError = err;
              continue;
            }
            throw err;
          }

          if (!response.body) {
            throw new Error('LLM API returned empty body');
          }

          const eventStream = response.body
            .pipeThrough(new TextDecoderStream())
            .pipeThrough(new EventSourceParserStream());

          const reader = eventStream.getReader();

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const data = value.data;
              if (data === '[DONE]') break;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  yield content;
                }
              } catch {
                // 跳过无法解析的 event（如心跳）
              }
            }
          } finally {
            reader.releaseLock();
          }

          return;
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') {
            lastError = new Error('LLM request timeout');
          } else if (err instanceof Error) {
            lastError = err;
          } else {
            lastError = new Error(String(err));
          }

          if (attempt < MAX_RETRIES) continue;
        }
      }

      throw lastError ?? new Error('LLM request failed after retries');
    },
  };
}
