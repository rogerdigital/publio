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
  const {
    setTitle,
    setContent,
    reset,
    overallStatus,
  } = usePublishStore();

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
        description="左侧保持连续写作和稿件判断，右侧保留发布分发和状态回收。页面结构更像一个活跃的编辑台，而不是单一编辑器。"
        className="space-y-0"
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(24rem,0.9fr)]">
          <div className="space-y-4">
            <EditorialContextCard />
            <MarkdownEditor />
          </div>

          <SurfaceCard className="px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-[color:var(--wb-accent)]">
                  Distribution deck
                </p>
                <h2
                  className="mt-2 text-[22px] leading-tight text-[color:var(--wb-text)]"
                  style={{ fontFamily: 'var(--wb-font-serif)' }}
                >
                  发布分发台
                </h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--wb-text-muted)]">
                  这里保留平台勾选、发布按钮和结果面板，方便在稿件定稿后直接进入分发。
                </p>
              </div>

              <div className="rounded-[24px] border border-[color:var(--wb-border)] bg-[rgba(255,252,247,0.86)] px-4 py-4 shadow-[var(--wb-shadow-tight)]">
                <PlatformSelector />
              </div>

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
