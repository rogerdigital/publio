'use client';

import { useEffect } from 'react';
import { usePublishStore } from '@/stores/publishStore';
import MarkdownEditor from '@/components/editor/MarkdownEditor';
import PlatformSelector from '@/components/publish/PlatformSelector';
import PublishButton from '@/components/publish/PublishButton';
import PublishStatusPanel from '@/components/publish/PublishStatusPanel';
import {
  NEWS_DRAFT_STORAGE_KEY,
  type NewsDraftPayload,
} from '@/lib/newsDraft';

export default function HomePage() {
  const {
    title,
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
    <div className="min-h-screen bg-[#151515] px-4 py-6 text-[#ece2d6] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-6 py-6 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[#ff9a67]">
            Editorial Studio
          </p>
          <input
            type="text"
            placeholder="输入文章标题..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-3 w-full border-none bg-transparent text-[42px] font-semibold leading-tight text-[#fff5e8] outline-none placeholder:text-[#73695f]"
          />
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#a89f93]">
            在这里继续打磨你的长文稿、行业快讯或平台分发内容。左侧保持编辑效率，右侧尽量贴近微信与知乎最终排版。
          </p>
        </div>

        <div className="mb-6">
          <MarkdownEditor />
        </div>

        <div className="rounded-[28px] border border-white/8 bg-[#1b1a18] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-[0.24em] text-[#ff9a67]">
            选择发布平台
          </h3>
          <PlatformSelector />

          <div className="mt-6">
            <PublishButton />
            <PublishStatusPanel />
            {overallStatus !== 'idle' && overallStatus !== 'publishing' && (
              <button
                onClick={reset}
                className="mt-4 text-sm text-[#a89f93] underline transition hover:text-[#fff0e2]"
              >
                清除发布结果
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
