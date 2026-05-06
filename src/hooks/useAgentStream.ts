'use client';

import { useCallback } from 'react';
import { useAgentStore } from '@/stores/agentStore';
import type { AgentAction, AgentStreamEvent } from '@/lib/agent/types';

interface StreamRequestOptions {
  url: string;
  body: Record<string, unknown>;
  action: AgentAction;
}

/**
 * Hook：发起 Agent SSE 请求并消费流式输出。
 * 自动管理 agentStore 的状态更新和 AbortController 生命周期。
 */
export function useAgentStream() {
  const { status, output, error, activeAction, startStream, appendOutput, finishStream, setError, abort, reset } =
    useAgentStore();

  const request = useCallback(
    async ({ url, body, action }: StreamRequestOptions) => {
      const controller = startStream(action);

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          setError(errData.error || `请求失败 (${response.status})`);
          return;
        }

        if (!response.body) {
          setError('响应为空');
          return;
        }

        const reader = response.body
          .pipeThrough(new TextDecoderStream())
          .getReader();

        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += value;

          // 解析 SSE 行
          const lines = buffer.split('\n');
          // 保留最后一个不完整的行
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;

            const data = line.slice(6);
            try {
              const event: AgentStreamEvent = JSON.parse(data);

              switch (event.type) {
                case 'delta':
                  appendOutput(event.content);
                  break;
                case 'done':
                  finishStream();
                  return;
                case 'error':
                  setError(event.error);
                  return;
              }
            } catch {
              // 跳过无法解析的行
            }
          }
        }

        // 如果 stream 结束但没收到 done event
        finishStream();
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          // 用户主动取消，不报错
          return;
        }
        setError(err instanceof Error ? err.message : '未知错误');
      }
    },
    [startStream, appendOutput, finishStream, setError]
  );

  return {
    status,
    output,
    error,
    activeAction,
    request,
    abort,
    reset,
  };
}
