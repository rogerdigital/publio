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
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf9_0%,#f8f1ea_100%)] px-4 py-6 text-[#3a3029] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-[28px] border border-[#eadfd3] bg-[linear-gradient(180deg,#fff8f3_0%,#ffffff_100%)] px-6 py-6 shadow-[0_18px_50px_rgba(214,181,154,0.22)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d77443]">
            Editorial Studio
          </p>
          <input
            type="text"
            placeholder="输入文章标题..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-3 w-full border-none bg-transparent text-[42px] font-semibold leading-tight text-[#241b16] outline-none placeholder:text-[#a29082]"
          />
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#7d7065]">
            在这里继续打磨你的长文稿、行业快讯或平台分发内容。左侧保持编辑效率，右侧尽量贴近微信与知乎最终排版。
          </p>
        </div>

        <div className="mb-6">
          <MarkdownEditor />
        </div>

        <div className="rounded-[28px] border border-[#eadfd3] bg-white p-6 shadow-[0_18px_50px_rgba(214,181,154,0.18)]">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-[0.24em] text-[#d77443]">
            选择发布平台
          </h3>
          <PlatformSelector />

          <div className="mt-6">
            <PublishButton />
            <PublishStatusPanel />
            {overallStatus !== 'idle' && overallStatus !== 'publishing' && (
              <button
                onClick={reset}
                className="mt-4 text-sm text-[#7d7065] underline transition hover:text-[#2b221d]"
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
