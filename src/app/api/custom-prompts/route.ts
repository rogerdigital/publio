import { NextRequest } from 'next/server';
import { getAllCustomPrompts, getCustomPrompt, setCustomPrompt } from '@/lib/custom-prompts/store';
import { apiResponse, apiError } from '@/lib/api/response';

export async function GET() {
  return apiResponse({ prompts: getAllCustomPrompts() });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, prefix } = body;

    if (!platform) return apiError('缺少 platform', 400);

    const entry = setCustomPrompt(platform, prefix ?? '');
    return apiResponse({ prompt: entry });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '服务器内部错误', 500);
  }
}
