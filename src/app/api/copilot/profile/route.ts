import { NextRequest } from 'next/server';
import { getBrandProfile, saveBrandProfile } from '@/lib/copilot/profile';
import { apiResponse, apiError } from '@/lib/api/response';

export async function GET() {
  const profile = getBrandProfile();
  return apiResponse({ profile });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { brandName, industry, persona, targetAudience, contentStyle } = body;
    if (!brandName) return apiError('品牌名称不能为空', 400);
    const profile = saveBrandProfile({
      brandName,
      industry: industry ?? '',
      persona: persona ?? '',
      targetAudience: targetAudience ?? '',
      contentStyle: contentStyle ?? '',
    });
    return apiResponse({ profile });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '服务器内部错误', 500);
  }
}
