import type { ContentDraft } from '@/lib/drafts/types';
import type { CreateDraftInput } from '@/lib/drafts/types';

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

export async function createDraft(input: CreateDraftInput) {
  const response = await fetch('/api/drafts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = (await response.json()) as DraftResponse;

  if (!response.ok || !data.draft) {
    throw new Error(data.error || '稿件创建失败，请稍后重试。');
  }

  return data.draft;
}

export async function deleteDraft(id: string) {
  const response = await fetch(`/api/drafts/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    const data = (await response.json()) as { error?: string };
    throw new Error(data.error || '稿件删除失败，请稍后重试。');
  }
}

export async function updateDraft(
  id: string,
  input: { title?: string; content?: string },
): Promise<ContentDraft> {
  const response = await fetch(`/api/drafts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = (await response.json()) as DraftResponse;
  if (!response.ok || !data.draft) {
    throw new Error(data.error || '草稿更新失败，请稍后重试。');
  }
  return data.draft;
}

export async function ensureDraft(
  input: Pick<CreateDraftInput, 'title' | 'content' | 'source'>,
): Promise<ContentDraft> {
  const response = await fetch('/api/drafts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = (await response.json()) as DraftResponse;
  if (!response.ok || !data.draft) {
    throw new Error(data.error || '草稿创建失败，请稍后重试。');
  }
  return data.draft;
}
