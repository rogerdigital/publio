import { Hono } from 'hono';
import { getDraftRegistry } from '@/lib/drafts/registry';
import type { DraftSource, DraftStatus, UpdateDraftInput } from '@/lib/drafts/types';
import { getPlatformVariantRegistry } from '@/lib/platformVariants/registry';
import type { PlatformId } from '@/types';
import { PLATFORMS } from '@/types';
import { validateTitle, validateContent } from '@/lib/validation';
import { apiResponse, apiError } from '@/lib/response';

const VALID_SOURCES: DraftSource[] = ['manual', 'import'];
const VALID_STATUSES: DraftStatus[] = ['draft', 'ready', 'syncing', 'synced', 'failed', 'archived'];
const VALID_PLATFORMS = PLATFORMS.map((p) => p.id);

function isDraftSource(value: unknown): value is DraftSource {
  return typeof value === 'string' && VALID_SOURCES.includes(value as DraftSource);
}

function isDraftStatus(value: unknown): value is DraftStatus {
  return typeof value === 'string' && VALID_STATUSES.includes(value as DraftStatus);
}

function isPlatformId(value: unknown): value is PlatformId {
  return typeof value === 'string' && VALID_PLATFORMS.includes(value as PlatformId);
}

export const draftsRoutes = new Hono();

draftsRoutes.get('/', (c) => {
  const drafts = getDraftRegistry().listDrafts();
  return apiResponse(c, { drafts });
});

draftsRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    const source = isDraftSource(body.source) ? body.source : 'manual';
    const platforms = Array.isArray(body.platforms) ? body.platforms : undefined;
    const tags = Array.isArray(body.tags) ? body.tags : undefined;

    if (!title || !content) return apiError(c, '标题和内容不能为空');

    const titleErr = validateTitle(title);
    if (titleErr) return apiError(c, titleErr);
    const contentErr = validateContent(content);
    if (contentErr) return apiError(c, contentErr);

    const draft = getDraftRegistry().createDraft({ title, content, source, platforms, tags });
    return apiResponse(c, { draft }, 201);
  } catch (error) {
    return apiError(c, error instanceof Error ? error.message : '创建稿件失败', 500);
  }
});

draftsRoutes.get('/:id', (c) => {
  const draft = getDraftRegistry().getDraft(c.req.param('id'));
  if (!draft) return apiError(c, '稿件不存在', 404);
  return apiResponse(c, { draft });
});

draftsRoutes.patch('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const input: Record<string, unknown> = {};
    if (typeof body.title === 'string') {
      const err = validateTitle(body.title);
      if (err) return apiError(c, err);
      input.title = body.title.trim();
    }
    if (typeof body.content === 'string') {
      const err = validateContent(body.content);
      if (err) return apiError(c, err);
      input.content = body.content.trim();
    }
    if (isDraftStatus(body.status)) input.status = body.status;
    if (Array.isArray(body.tags)) {
      input.tags = body.tags.filter((t: unknown) => typeof t === 'string').slice(0, 20);
    }

    const draft = getDraftRegistry().updateDraft(id, input as UpdateDraftInput);
    if (!draft) return apiError(c, '稿件不存在', 404);
    return apiResponse(c, { draft });
  } catch (error) {
    return apiError(c, error instanceof Error ? error.message : '更新稿件失败', 500);
  }
});

draftsRoutes.delete('/:id', (c) => {
  const draft = getDraftRegistry().archiveDraft(c.req.param('id'));
  if (!draft) return apiError(c, '稿件不存在', 404);
  return apiResponse(c, { draft });
});

draftsRoutes.get('/:id/versions', (c) => {
  const draft = getDraftRegistry().getDraft(c.req.param('id'));
  if (!draft) return apiError(c, '稿件不存在', 404);
  return apiResponse(c, { versions: draft.versions ?? [] });
});

draftsRoutes.get('/:id/variants', (c) => {
  const id = c.req.param('id');
  const draft = getDraftRegistry().getDraft(id);
  if (!draft) return apiError(c, '稿件不存在', 404);
  const variants = getPlatformVariantRegistry().listVariantsByDraft(id);
  return apiResponse(c, { variants });
});

draftsRoutes.post('/:id/variants', async (c) => {
  try {
    const id = c.req.param('id');
    const draft = getDraftRegistry().getDraft(id);
    if (!draft) return apiError(c, '稿件不存在', 404);

    const body = await c.req.json();
    const platforms: PlatformId[] = Array.isArray(body.platforms)
      ? body.platforms.filter((p: unknown) => isPlatformId(p))
      : VALID_PLATFORMS;

    const variants = getPlatformVariantRegistry().syncVariantsFromDraft(
      id,
      draft.title,
      draft.content,
      platforms,
    );
    return apiResponse(c, { variants }, 201);
  } catch (error) {
    return apiError(c, error instanceof Error ? error.message : '同步版本失败', 500);
  }
});
