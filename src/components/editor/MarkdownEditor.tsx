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

        <div className="min-w-0 bg-[linear-gradient(180deg,#191715_0%,#231f1b_100%)]">
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-3 text-white/90">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#ff9a67]">
                Preview
              </p>
              <p className="mt-1 text-sm font-medium text-[#f5eadf]">
                公众号风格预览
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#cbbfb3]">
              微信 / 知乎
            </div>
          </div>

          <div className="h-[760px] overflow-y-auto p-5">
            <div className="rounded-[32px] border border-white/8 bg-[#100f0e] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
              <div className="mb-4 flex items-center gap-2 px-2 text-[11px] uppercase tracking-[0.3em] text-[#ff9a67]">
                <span className="inline-block h-2 w-2 rounded-full bg-[#ff7a45]" />
                最终排版参考
              </div>
              <div
                className="rounded-[28px] bg-white px-5 py-6"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
