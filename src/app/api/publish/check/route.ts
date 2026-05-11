import { NextRequest } from 'next/server';
import type { PlatformId } from '@/types';
import { PLATFORMS } from '@/types';
import { runPublishChecks } from '@/lib/publishChecks/runChecks';
import { getPlatformConnectionProfiles } from '@/lib/platformConnections/profiles';
import { readEnvFile } from '@/lib/storage/envFile';
import { apiResponse, apiError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

const VALID_PLATFORMS = PLATFORMS.map((p) => p.id);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, draftId, variantIds } = body;

    if (typeof title !== 'string' || typeof content !== 'string') {
      return apiError('title 和 content 必须为字符串', 400);
    }

    const platforms: PlatformId[] = Array.isArray(body.platforms)
      ? body.platforms.filter(
          (p: unknown) => typeof p === 'string' && VALID_PLATFORMS.includes(p as PlatformId),
        )
      : [];

    if (platforms.length === 0) {
      return apiError('至少选择一个发布平台', 400);
    }

    let connectionProfiles;
    try {
      const envValues = await readEnvFile();
      connectionProfiles = getPlatformConnectionProfiles(envValues);
    } catch {
      // If env read fails, skip connection checks
    }

    const summary = runPublishChecks({
      title,
      content,
      platforms,
      draftId: typeof draftId === 'string' ? draftId : undefined,
      variantIds: variantIds && typeof variantIds === 'object' ? variantIds : undefined,
      connectionProfiles,
    });

    return apiResponse(summary);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '检查失败', 500);
  }
}
