import { NextRequest } from 'next/server';
import { getTopicRegistry } from '@/lib/topics/registry';
import { getSignalRegistry } from '@/lib/signals/registry';
import type { Signal } from '@/lib/signals/types';
import { apiResponse, apiError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest | Request) {
  try {
    const body = await request.json();

    const signalIds: string[] = Array.isArray(body.signalIds)
      ? body.signalIds.filter((id: unknown) => typeof id === 'string')
      : [];

    if (signalIds.length === 0) {
      return apiError('至少需要提供一个信号 ID', 400);
    }

    const signalRegistry = getSignalRegistry();
    const signals: Signal[] = [];
    for (const id of signalIds) {
      const s = signalRegistry.getSignal(id);
      if (s) signals.push(s);
    }

    if (signals.length === 0) {
      return apiError('未找到有效的信号', 404);
    }

    const topic = getTopicRegistry().createTopicFromSignals(signals);

    for (const signal of signals) {
      signalRegistry.updateSignal(signal.id, { status: 'converted' });
    }

    return apiResponse({ topic, convertedSignalIds: signals.map((s) => s.id) }, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '从信号创建选题失败', 500);
  }
}
