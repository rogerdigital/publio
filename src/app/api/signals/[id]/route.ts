import { NextRequest } from 'next/server';
import { getSignalRegistry } from '@/lib/signals/registry';
import type { SignalStatus, UpdateSignalInput } from '@/lib/signals/types';
import { apiResponse, apiError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

interface SignalRouteContext {
  params: Promise<{ id: string }>;
}

const VALID_STATUSES: SignalStatus[] = ['new', 'saved', 'dismissed', 'converted'];

function isSignalStatus(value: unknown): value is SignalStatus {
  return typeof value === 'string' && VALID_STATUSES.includes(value as SignalStatus);
}

export async function GET(_request: NextRequest | Request, { params }: SignalRouteContext) {
  const { id } = await params;
  const signal = getSignalRegistry().getSignal(id);
  if (!signal) return apiError('信号不存在', 404);
  return apiResponse({ signal });
}

export async function PATCH(request: NextRequest | Request, { params }: SignalRouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input: Record<string, unknown> = {};

    if (body.status !== undefined) {
      if (!isSignalStatus(body.status)) {
        return apiError('无效的 status 值', 400);
      }
      input.status = body.status;
    }

    if (Array.isArray(body.tags)) {
      input.tags = body.tags.filter((t: unknown) => typeof t === 'string').slice(0, 20);
    }

    if (typeof body.notes === 'string') {
      input.notes = body.notes.trim();
    }

    if (body.score && typeof body.score === 'object' && !Array.isArray(body.score)) {
      input.score = body.score;
    }

    if (Array.isArray(body.recommendedPlatforms)) {
      input.recommendedPlatforms = body.recommendedPlatforms.filter(
        (p: unknown) => typeof p === 'string',
      );
    }

    const signal = getSignalRegistry().updateSignal(id, input as UpdateSignalInput);
    if (!signal) return apiError('信号不存在', 404);

    return apiResponse({ signal });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '更新信号失败', 500);
  }
}

export async function DELETE(_request: NextRequest | Request, { params }: SignalRouteContext) {
  const { id } = await params;
  const deleted = getSignalRegistry().deleteSignal(id);
  if (!deleted) return apiError('信号不存在', 404);
  return apiResponse({ deleted: true });
}
