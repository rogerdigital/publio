import type { AgentStreamEvent } from './types';

/**
 * 将 async iterable of tokens 封装为 SSE Response。
 * 客户端通过 fetch + ReadableStream 消费。
 *
 * SSE 格式: `data: {"type":"delta","content":"..."}\n\n`
 */
export function createSSEResponse(
  tokens: AsyncIterable<string>,
  signal?: AbortSignal
): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const token of tokens) {
          if (signal?.aborted) break;

          const event: AgentStreamEvent = { type: 'delta', content: token };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        }

        // 发送 done 事件
        const doneEvent: AgentStreamEvent = { type: 'done' };
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(doneEvent)}\n\n`)
        );
      } catch (err) {
        const errorEvent: AgentStreamEvent = {
          type: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        };
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`)
        );
      } finally {
        controller.close();
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
