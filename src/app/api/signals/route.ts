import { NextRequest } from 'next/server';
import { getSignalRegistry } from '@/lib/signals/registry';
import type { SignalSourceType, SignalStatus } from '@/lib/signals/types';
import { apiResponse, apiError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

const VALID_STATUSES: SignalStatus[] = ['new', 'saved', 'dismissed', 'converted'];
const VALID_SOURCE_TYPES: SignalSourceType[] = ['rss', 'url', 'manual', 'import'];

function isSignalStatus(value: unknown): value is SignalStatus {
  return typeof value === 'string' && VALID_STATUSES.includes(value as SignalStatus);
}

function isSourceType(value: unknown): value is SignalSourceType {
  return typeof value === 'string' && VALID_SOURCE_TYPES.includes(value as SignalSourceType);
}

export async function GET(request: NextRequest | Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const tag = url.searchParams.get('tag');
  const sourceId = url.searchParams.get('sourceId');
  const q = url.searchParams.get('q');

  if (status && !isSignalStatus(status)) {
    return apiError('无效的 status 参数', 400);
  }

  const signals = getSignalRegistry().listSignals({
    ...(status ? { status: status as SignalStatus } : {}),
    ...(tag ? { tag } : {}),
    ...(sourceId ? { sourceId } : {}),
    ...(q ? { q } : {}),
  });

  return apiResponse({ signals });
}

export async function POST(request: NextRequest | Request) {
  try {
    const body = await request.json();

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) {
      return apiError('标题不能为空', 400);
    }

    const summary = typeof body.summary === 'string' ? body.summary.trim() : '';
    const sourceId = typeof body.sourceId === 'string' ? body.sourceId.trim() : 'manual';
    const sourceType = isSourceType(body.sourceType) ? body.sourceType : 'manual';
    const url = typeof body.url === 'string' && body.url.trim() ? body.url.trim() : undefined;
    const author =
      typeof body.author === 'string' && body.author.trim() ? body.author.trim() : undefined;
    const publishedAt =
      typeof body.publishedAt === 'string' && body.publishedAt.trim()
        ? body.publishedAt.trim()
        : undefined;
    const tags = Array.isArray(body.tags)
      ? body.tags.filter((t: unknown) => typeof t === 'string').slice(0, 20)
      : undefined;
    const notes =
      typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : undefined;

    const score =
      body.score && typeof body.score === 'object' && !Array.isArray(body.score)
        ? body.score
        : undefined;

    const signal = getSignalRegistry().createSignal({
      sourceId,
      sourceType,
      title,
      summary,
      url,
      author,
      publishedAt,
      tags,
      score,
      notes,
    });

    return apiResponse({ signal }, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '创建资讯信号失败', 500);
  }
}
