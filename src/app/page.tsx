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
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Title */}
      <input
        type="text"
        placeholder="输入文章标题..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-2xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none mb-6 bg-transparent"
      />

      {/* Editor */}
      <div className="mb-6">
        <MarkdownEditor />
      </div>

      {/* Platform Selector */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          选择发布平台
        </h3>
        <PlatformSelector />
      </div>

      {/* Publish */}
      <div className="mt-6">
        <PublishButton />
        <PublishStatusPanel />
        {overallStatus !== 'idle' && overallStatus !== 'publishing' && (
          <button
            onClick={reset}
            className="mt-3 text-sm text-gray-500 hover:text-gray-700 underline"
          >
            清除发布结果
          </button>
        )}
      </div>
    </div>
  );
}
