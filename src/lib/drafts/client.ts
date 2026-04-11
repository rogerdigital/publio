import type { ContentDraft } from '@/lib/drafts/types';

interface DraftResponse {
  draft?: ContentDraft;
  error?: string;
}

export async function fetchDraftById(id: string) {
  const response = await fetch(`/api/drafts/${id}`, { cache: 'no-store' });
  const data = (await response.json()) as DraftResponse;

  if (!response.ok || !data.draft) {
    throw new Error(data.error || '稿件读取失败，请稍后重试。');
  }

  return data.draft;
}
