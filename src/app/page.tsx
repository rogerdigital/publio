'use client';

import { useEffect } from 'react';
import { usePublishStore } from '@/stores/publishStore';
import AppShellHeader from '@/components/layout/AppShellHeader';
import MarkdownEditor from '@/components/editor/MarkdownEditor';
import SurfaceCard from '@/components/layout/SurfaceCard';
import PlatformSelector from '@/components/publish/PlatformSelector';
import PublishButton from '@/components/publish/PublishButton';
import PublishStatusPanel from '@/components/publish/PublishStatusPanel';
import {
  NEWS_DRAFT_STORAGE_KEY,
  type NewsDraftPayload,
} from '@/lib/newsDraft';

export default function HomePage() {
  const { setTitle, setContent, reset, overallStatus } = usePublishStore();

  useEffect(() => {
    const rawDraft = window.localStorage.getItem(NEWS_DRAFT_STORAGE_KEY);
    if (!rawDraft) return;

    try {
      const draft = JSON.parse(rawDraft) as NewsDraftPayload;
      setTitle(draft.title || '');
      setContent(draft.content || '');
      reset();
      window.localStorage.removeItem(NEWS_DRAFT_STORAGE_KEY);
    } catch {
      window.localStorage.removeItem(NEWS_DRAFT_STORAGE_KEY);
    }
  }, [reset, setContent, setTitle]);

  return (
    <div className="space-y-6">
      <AppShellHeader
        kicker="Writing desk"
        title="写作台"
        description="先定标题，再写正文，再检查排版和分发。"
      />

      <div className="space-y-4">
        <MarkdownEditor />

        <SurfaceCard className="px-5 py-5 sm:px-6">
          <div className="space-y-4">
            <PlatformSelector />

            <div className="flex flex-wrap items-start justify-end gap-3">
              <div className="flex-1">
                <PublishStatusPanel />
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {overallStatus !== 'idle' && overallStatus !== 'publishing' && (
                  <button
                    onClick={reset}
                    className="text-sm text-[color:var(--wb-text-muted)] underline transition hover:text-[color:var(--wb-text)]"
                  >
                    清除结果
                  </button>
                )}
                <PublishButton />
              </div>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
