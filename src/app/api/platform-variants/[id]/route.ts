import { NextRequest } from 'next/server';
import { getPlatformVariantRegistry } from '@/lib/platformVariants/registry';
import type { VariantStatus } from '@/lib/platformVariants/types';
import { apiResponse, apiError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

interface VariantRouteContext {
  params: Promise<{ id: string }>;
}

const VALID_STATUSES: VariantStatus[] = [
  'synced',
  'adapted',
  'edited',
  'checked',
  'scheduled',
  'published',
];

function isVariantStatus(value: unknown): value is VariantStatus {
  return typeof value === 'string' && VALID_STATUSES.includes(value as VariantStatus);
}

export async function GET(_request: NextRequest | Request, { params }: VariantRouteContext) {
  const { id } = await params;
  const variant = getPlatformVariantRegistry().getVariant(id);
  if (!variant) return apiError('渠道版本不存在', 404);
  return apiResponse({ variant });
}

export async function PATCH(request: NextRequest | Request, { params }: VariantRouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input: Record<string, unknown> = {};

    if (typeof body.title === 'string') {
      input.title = body.title;
    }
    if (typeof body.content === 'string') {
      input.content = body.content;
    }
    if (body.status !== undefined) {
      if (!isVariantStatus(body.status)) {
        return apiError('无效的 status 值', 400);
      }
      input.status = body.status;
    }
    if (typeof body.generatedByAgent === 'boolean') {
      input.generatedByAgent = body.generatedByAgent;
    }
    if (typeof body.manuallyEdited === 'boolean') {
      input.manuallyEdited = body.manuallyEdited;
    }
    if (typeof body.changeSummary === 'string') {
      input.changeSummary = body.changeSummary;
    }

    const variant = getPlatformVariantRegistry().updateVariant(id, input as any);
    if (!variant) return apiError('渠道版本不存在', 404);

    return apiResponse({ variant });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '更新渠道版本失败', 500);
  }
}

export async function DELETE(_request: NextRequest | Request, { params }: VariantRouteContext) {
  const { id } = await params;
  const deleted = getPlatformVariantRegistry().deleteVariant(id);
  if (!deleted) return apiError('渠道版本不存在', 404);
  return apiResponse({ deleted: true });
}
