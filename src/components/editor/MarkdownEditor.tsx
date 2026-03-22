'use client';

import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import { usePublishStore } from '@/stores/publishStore';
import { markdownToStyledHtml } from '@/lib/markdown';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export default function MarkdownEditor() {
  const { title, content, setContent } = usePublishStore();
  const previewHtml = markdownToStyledHtml(
    title || '未命名快讯',
    content || '在这里开始撰写你的 AI 行业快讯内容。',
    'wechat',
  );

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-2">
        <div className="border-b border-slate-200 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                Edit
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                Markdown 编辑器
              </p>
            </div>
            <div className="rounded-full bg-white px-3 py-1 text-xs text-slate-500 shadow-sm">
              实时同步
            </div>
          </div>
          <div data-color-mode="light">
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || '')}
              height={760}
              preview="edit"
              visibleDragbar={false}
            />
          </div>
        </div>

        <div className="min-w-0 bg-[linear-gradient(180deg,#191817_0%,#151413_100%)]">
          <div className="flex items-center justify-between border-b border-[#302b27] px-5 py-3 text-[#f2e6db]">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#d77443]">
                Preview
              </p>
              <p className="mt-1 text-sm font-medium text-[#f7ede5]">
                发布态长文预览
              </p>
            </div>
            <div className="rounded-full border border-[#3a322d] bg-[#201c19] px-3 py-1 text-xs text-[#d8c5b7] shadow-sm">
              微信 / 知乎
            </div>
          </div>

          <div className="h-[760px] overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(201,102,53,0.12),transparent_26%),linear-gradient(180deg,#191817_0%,#141311_100%)] p-5">
            <div className="mx-auto max-w-[680px] rounded-[30px] border border-[#2f2925] bg-[linear-gradient(180deg,#1d1b1a_0%,#171614_100%)] p-4 shadow-[0_28px_70px_rgba(0,0,0,0.35)]">
              <div className="mb-4 flex items-center gap-2 px-2 text-[11px] uppercase tracking-[0.3em] text-[#ff9a67]">
                <span className="inline-block h-2 w-2 rounded-full bg-[#ef6b38]" />
                最终发布预览
              </div>
              <div
                className="rounded-[24px] bg-[linear-gradient(180deg,#1f1d1b_0%,#161514_100%)] px-5 py-6"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
