import type { AgentStreamEvent } from './types';

/**
 * 将 async iterable of tokens 封装为 SSE Response。
 * 客户端通过 fetch + ReadableStream 消费。
 *
 * SSE 格式: `data: {"type":"delta","content":"..."}\n\n`
 */
export function createSSEResponse(tokens: AsyncIterable<string>, signal?: AbortSignal): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // 客户端断开后 enqueue/close 会抛错，统一容错：已断开则静默结束。
      const send = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          // controller 已关闭（客户端断开），忽略
        }
      };
      const close = () => {
        try {
          controller.close();
        } catch {
          // controller 已关闭，忽略
        }
      };

      try {
        for await (const token of tokens) {
          if (signal?.aborted) break;

          const event: AgentStreamEvent = { type: 'delta', content: token };
          send(`data: ${JSON.stringify(event)}\n\n`);
        }

        // 客户端主动取消时不再发送尾部事件
        if (signal?.aborted) return;

        // 发送 done 事件
        const doneEvent: AgentStreamEvent = { type: 'done' };
        send(`data: ${JSON.stringify(doneEvent)}\n\n`);
      } catch (err) {
        // 客户端断开导致的中断不算错误，不发送 error 事件
        if (signal?.aborted) return;

        const errorEvent: AgentStreamEvent = {
          type: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        };
        send(`data: ${JSON.stringify(errorEvent)}\n\n`);
      } finally {
        close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
