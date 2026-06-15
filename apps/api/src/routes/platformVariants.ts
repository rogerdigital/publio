import { Hono } from 'hono';
import type { VariantStatus, UpdatePlatformVariantInput } from '@/lib/platformVariants/types';
import { getPlatformVariantRegistry } from '@/lib/platformVariants/registry';
import { apiResponse, apiError } from '@/lib/response';

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

export const platformVariantsRoutes = new Hono();

platformVariantsRoutes.get('/:id', (c) => {
  const variant = getPlatformVariantRegistry().getVariant(c.req.param('id'));
  if (!variant) return apiError(c, '渠道版本不存在', 404);
  return apiResponse(c, { variant });
});

platformVariantsRoutes.patch('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const input: Record<string, unknown> = {};

    if (typeof body.title === 'string') input.title = body.title;
    if (typeof body.content === 'string') input.content = body.content;
    if (body.status !== undefined) {
      if (!isVariantStatus(body.status)) return apiError(c, '无效的 status 值', 400);
      input.status = body.status;
    }
    if (typeof body.generatedByAgent === 'boolean') input.generatedByAgent = body.generatedByAgent;
    if (typeof body.manuallyEdited === 'boolean') input.manuallyEdited = body.manuallyEdited;
    if (typeof body.changeSummary === 'string') input.changeSummary = body.changeSummary;

    const variant = getPlatformVariantRegistry().updateVariant(
      id,
      input as UpdatePlatformVariantInput,
    );
    if (!variant) return apiError(c, '渠道版本不存在', 404);
    return apiResponse(c, { variant });
  } catch (error) {
    return apiError(c, error instanceof Error ? error.message : '更新渠道版本失败', 500);
  }
});

platformVariantsRoutes.delete('/:id', (c) => {
  const deleted = getPlatformVariantRegistry().deleteVariant(c.req.param('id'));
  if (!deleted) return apiError(c, '渠道版本不存在', 404);
  return apiResponse(c, { deleted: true });
});
