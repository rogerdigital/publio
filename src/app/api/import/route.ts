import { NextRequest } from 'next/server';
import { apiResponse, apiError } from '@/lib/api/response';
import { validateImportBundle, importDryRun, importWorkspace } from '@/lib/export/workspaceExport';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('无效的 JSON', 400);
  }

  const { bundle, errors } = validateImportBundle(body);
  if (!bundle) {
    return apiError('导入数据校验失败', 400, { details: errors });
  }

  const dryRun = req.nextUrl.searchParams.get('dryRun') === 'true';

  if (dryRun) {
    const result = importDryRun(bundle);
    return apiResponse({ dryRun: true, ...result });
  }

  const result = importWorkspace(bundle);
  return apiResponse({ imported: true, ...result });
}
