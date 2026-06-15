import { Hono } from 'hono';
import { getAllCustomPrompts, setCustomPrompt } from '@/lib/custom-prompts/store';
import { apiResponse, apiError } from '@/lib/response';

export const customPromptsRoutes = new Hono();

customPromptsRoutes.get('/', (c) => {
  return apiResponse(c, { prompts: getAllCustomPrompts() });
});

customPromptsRoutes.put('/', async (c) => {
  try {
    const body = await c.req.json();
    const { platform, prefix } = body;
    if (!platform) return apiError(c, '缺少 platform', 400);
    const entry = setCustomPrompt(platform, prefix ?? '');
    return apiResponse(c, { prompt: entry });
  } catch (error) {
    return apiError(c, error instanceof Error ? error.message : '服务器内部错误', 500);
  }
});
