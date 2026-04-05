'use client';

import { useEffect } from 'react';
import { usePublishStore } from '@/stores/publishStore';
import WritingDeskHeader from '@/components/editor/WritingDeskHeader';
import EditorialContextCard from '@/components/editor/EditorialContextCard';
import MarkdownEditor from '@/components/editor/MarkdownEditor';
import PageSection from '@/components/layout/PageSection';
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
    if (!rawDraft) {
      return;
    }

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
      <WritingDeskHeader />

      <PageSection
        eyebrow="Editorial workbench"
        title="写作、研究与分发的并行桌面"
        description="先把主写作区做宽，再把预览和分发放回合理层级。页面结构更像连续工作的编辑桌，而不是被切碎的控制台。"
        className="space-y-0"
      >
        <div className="space-y-4">
          <EditorialContextCard />
          <MarkdownEditor />

          <SurfaceCard className="px-5 py-5 sm:px-6">
            <div className="space-y-5">
              <div className="max-w-3xl">
                <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-[color:var(--wb-accent)]">
                  Distribution deck
                </p>
                <h2
                  className="mt-2 text-[22px] leading-tight text-[color:var(--wb-text)]"
                  style={{ fontFamily: 'var(--wb-font-serif)' }}
                >
                  发布分发区
                </h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--wb-text-muted)]">
                  平台选择放回写作流的下半区，先写、再看、再发，不再和主工作区横向抢宽度。
                </p>
              </div>

              <PlatformSelector />

              <div className="space-y-4">
                <PublishButton />
                <PublishStatusPanel />
                {overallStatus !== 'idle' && overallStatus !== 'publishing' && (
                  <button
                    onClick={reset}
                    className="text-sm text-[color:var(--wb-text-muted)] underline transition hover:text-[color:var(--wb-text)]"
                  >
                    清除发布结果
                  </button>
                )}
              </div>
            </div>
          </SurfaceCard>
        </div>
      </PageSection>
    </div>
  );
}
