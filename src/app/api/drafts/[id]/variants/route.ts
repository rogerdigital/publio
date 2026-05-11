import { NextRequest } from 'next/server';
import { getDraftRegistry } from '@/lib/drafts/registry';
import { getPlatformVariantRegistry } from '@/lib/platformVariants/registry';
import type { PlatformId } from '@/types';
import { PLATFORMS } from '@/types';
import { apiResponse, apiError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

interface VariantsRouteContext {
  params: Promise<{ id: string }>;
}

const VALID_PLATFORMS = PLATFORMS.map((p) => p.id);

function isPlatformId(value: unknown): value is PlatformId {
  return typeof value === 'string' && VALID_PLATFORMS.includes(value as PlatformId);
}

export async function GET(_request: NextRequest | Request, { params }: VariantsRouteContext) {
  const { id } = await params;
  const draft = getDraftRegistry().getDraft(id);
  if (!draft) return apiError('稿件不存在', 404);

  const variants = getPlatformVariantRegistry().listVariantsByDraft(id);
  return apiResponse({ variants });
}

export async function POST(request: NextRequest | Request, { params }: VariantsRouteContext) {
  try {
    const { id } = await params;
    const draft = getDraftRegistry().getDraft(id);
    if (!draft) return apiError('稿件不存在', 404);

    const body = await request.json();
    const platforms: PlatformId[] = Array.isArray(body.platforms)
      ? body.platforms.filter((p: unknown) => isPlatformId(p))
      : VALID_PLATFORMS;

    const variants = getPlatformVariantRegistry().syncVariantsFromDraft(
      id,
      draft.title,
      draft.content,
      platforms,
    );

    return apiResponse({ variants }, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '同步版本失败', 500);
  }
}
