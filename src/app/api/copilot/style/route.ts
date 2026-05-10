import { NextRequest } from 'next/server';
import { getAgentConfig } from '@/lib/agent/config';
import { createOpenAIProvider } from '@/lib/agent/provider';
import {
  getStyleProfile,
  saveStyleProfile,
  buildStyleAnalysisPrompt,
} from '@/lib/copilot/styleProfile';
import { createDraftStore } from '@/lib/drafts/store';
import { createLocalDataPath } from '@/lib/storage/localDataPath';
import { apiResponse, apiError } from '@/lib/api/response';
import type { ChatMessage } from '@/lib/agent/types';

export async function GET() {
  const profile = getStyleProfile();
  return apiResponse({ profile });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { description } = body;
    if (!description) return apiError('风格描述不能为空', 400);
    const profile = saveStyleProfile(description);
    return apiResponse({ profile });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '服务器内部错误', 500);
  }
}

export async function POST() {
  const config = getAgentConfig();
  if (!config) {
    return apiResponse({ error: 'Agent 未配置，请先在设置页配置 LLM 接口' });
  }

  const draftsPath = createLocalDataPath('drafts.json');
  const store = createDraftStore({ storagePath: draftsPath });
  const drafts = store.listDrafts().filter((d) => d.content.length > 200);

  if (drafts.length < 2) {
    return apiResponse({ error: '至少需要 2 篇内容较长的草稿才能分析风格' });
  }

  const prompt = buildStyleAnalysisPrompt(drafts);
  const messages: ChatMessage[] = [{ role: 'user', content: prompt }];
  const provider = createOpenAIProvider(config);

  let result = '';
  for await (const token of provider.stream({ messages, temperature: 0.3 })) {
    result += token;
  }

  const profile = saveStyleProfile(result);
  return apiResponse({ profile });
}
