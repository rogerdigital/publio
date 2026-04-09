'use client';

import { useEffect, useState } from 'react';
import { Eye, SquarePen } from 'lucide-react';
import { usePublishStore } from '@/stores/publishStore';
import AppShellHeader from '@/components/layout/AppShellHeader';
import MarkdownEditor from '@/components/editor/MarkdownEditor';
import PlatformSelector from '@/components/publish/PlatformSelector';
import PublishButton from '@/components/publish/PublishButton';
import PublishStatusPanel from '@/components/publish/PublishStatusPanel';
import {
  NEWS_DRAFT_STORAGE_KEY,
  type NewsDraftPayload,
} from '@/lib/newsDraft';

export default function HomePage() {
  const { setTitle, setContent, reset, overallStatus } = usePublishStore();
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

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
        {/* Writing console kicker + tab 切换 */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-[color:var(--wb-accent)]">
            Writing console
          </p>
          <div className="inline-flex rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`inline-flex items-center gap-2 rounded-[6px] px-3 py-1.5 text-sm transition ${
                activeTab === 'edit'
                  ? 'bg-[color:var(--wb-accent)] text-white'
                  : 'text-[color:var(--wb-text-muted)] hover:text-[color:var(--wb-text)]'
              }`}
            >
              <SquarePen size={15} />
              写作
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`inline-flex items-center gap-2 rounded-[6px] px-3 py-1.5 text-sm transition ${
                activeTab === 'preview'
                  ? 'bg-[color:var(--wb-accent)] text-white'
                  : 'text-[color:var(--wb-text-muted)] hover:text-[color:var(--wb-text)]'
              }`}
            >
              <Eye size={15} />
              预览
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[var(--wb-radius-xl)] bg-[color:var(--wb-surface)]">
          <MarkdownEditor activeTab={activeTab} />
        </div>

        <div className="px-1 py-1">
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
        </div>
      </div>
    </div>
  );
}

