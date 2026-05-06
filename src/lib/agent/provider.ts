import { EventSourceParserStream } from 'eventsource-parser/stream';
import type { AgentConfig, ChatMessage, LLMProvider, LLMStreamParams } from './types';

/**
 * OpenAI-compatible LLM provider。
 * 支持任何兼容 /v1/chat/completions 的 API（OpenAI、DeepSeek、Ollama 等）。
 */
export function createOpenAIProvider(config: AgentConfig): LLMProvider {
  return {
    async *stream(params: LLMStreamParams): AsyncIterable<string> {
      const url = `${config.baseUrl}/chat/completions`;

      const body = {
        model: params.model || config.model,
        messages: params.messages.map((m: ChatMessage) => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: params.maxTokens ?? config.maxTokens,
        temperature: params.temperature ?? config.temperature,
        stream: true,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(
          `LLM API error ${response.status}: ${errorText || response.statusText}`
        );
      }

      if (!response.body) {
        throw new Error('LLM API returned empty body');
      }

      // 解析 SSE 流
      const eventStream = response.body
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new EventSourceParserStream());

      const reader = eventStream.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // OpenAI SSE 格式：data 字段为 JSON 或 [DONE]
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
    },
  };
}
