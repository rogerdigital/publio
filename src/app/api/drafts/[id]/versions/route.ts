import { getDraftRegistry } from '@/lib/drafts/registry';
import { apiResponse, apiError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

interface VersionsRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: VersionsRouteContext) {
  const { id } = await params;
  const draft = getDraftRegistry().getDraft(id);
  if (!draft) return apiError('稿件不存在', 404);

  return apiResponse({ versions: draft.versions ?? [] });
}
