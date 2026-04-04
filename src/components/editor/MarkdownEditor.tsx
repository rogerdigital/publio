'use client';

import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import { useEffect, useState } from 'react';
import { usePublishStore } from '@/stores/publishStore';
import { markdownToHtml } from '@/lib/markdown';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export default function MarkdownEditor() {
  const { title, content, setContent } = usePublishStore();
  const [editorHeight, setEditorHeight] = useState<number | undefined>(undefined);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    function syncHeight() {
      const width = window.innerWidth;

      if (width >= 1024) {
        setIsDesktop(true);
        setEditorHeight(760);
        return;
      }

      setIsDesktop(false);
      setEditorHeight(undefined);
    }

    syncHeight();
    window.addEventListener('resize', syncHeight);

    return () => window.removeEventListener('resize', syncHeight);
  }, []);

  const previewHtml = markdownToHtml(
    content || '在这里开始撰写你的稿件内容，右侧会同步呈现接近成稿的纸张版式。',
  );

  return (
    <div className="overflow-hidden rounded-[var(--wb-radius-xl)] border border-[color:var(--wb-border)] bg-[linear-gradient(180deg,rgba(255,251,246,0.98)_0%,rgba(249,242,234,0.96)_100%)] shadow-[var(--wb-shadow-lg)]">
      <div className="grid lg:grid-cols-2">
        <div className="border-b border-[color:var(--wb-border)] lg:border-b-0 lg:border-r lg:border-[color:var(--wb-border)]">
          <div className="flex items-center justify-between border-b border-[color:var(--wb-border)] bg-[rgba(255,250,244,0.94)] px-4 py-3 sm:px-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--wb-accent)]">
                Edit
              </p>
              <p className="mt-1 text-sm font-medium text-[color:var(--wb-text)]">
                主写作面
              </p>
            </div>
            <div className="rounded-full border border-[color:var(--wb-border)] bg-white/80 px-3 py-1 text-xs text-[color:var(--wb-text-muted)] shadow-[var(--wb-shadow-tight)]">
              标题同步
            </div>
          </div>
          <div
            data-color-mode="light"
            className="[&_.w-md-editor]:bg-transparent [&_.w-md-editor]:text-[color:var(--wb-text)] [&_.w-md-editor-toolbar]:border-[color:var(--wb-border)] [&_.w-md-editor-toolbar]:bg-[rgba(255,252,247,0.96)] [&_.w-md-editor-toolbar]:px-3 [&_.w-md-editor-toolbar]:py-2 [&_.w-md-editor-toolbar-divider]:bg-[color:var(--wb-border)] [&_.w-md-editor-bar]:hidden [&_.w-md-editor-text-input]:font-[family-name:var(--wb-font-sans)] [&_.w-md-editor-text-input]:bg-transparent [&_.w-md-editor-text-input]:text-[color:var(--wb-text)] [&_.w-md-editor-text-input]:placeholder:text-[color:var(--wb-text-muted)] [&_.wmde-markdown]:bg-transparent [&_.wmde-markdown]:text-[color:var(--wb-text)] [&_.w-md-editor-area]:bg-transparent"
          >
            {isDesktop ? (
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || '')}
                height={editorHeight}
                preview="edit"
                visibleDragbar={false}
              />
            ) : (
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="在这里开始撰写你的稿件内容，预览区会在下方同步呈现纸张版式。"
                className="min-h-[18rem] w-full resize-y border-0 bg-transparent px-4 py-4 text-[15px] leading-7 text-[color:var(--wb-text)] outline-none placeholder:text-[color:var(--wb-text-muted)] sm:min-h-[22rem] sm:px-5 sm:py-5"
              />
            )}
          </div>
        </div>

        <div className="min-w-0 bg-[linear-gradient(180deg,rgba(248,242,234,0.98)_0%,rgba(243,234,223,0.96)_100%)]">
          <div className="flex items-center justify-between border-b border-[color:var(--wb-border)] px-4 py-3 sm:px-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--wb-accent)]">
                Preview
              </p>
              <p className="mt-1 text-sm font-medium text-[color:var(--wb-text)]">
                纸张预览
              </p>
            </div>
            <div className="rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,252,247,0.88)] px-3 py-1 text-xs text-[color:var(--wb-text-muted)] shadow-[var(--wb-shadow-tight)]">
              Long-form readout
            </div>
          </div>

          <div className="bg-[linear-gradient(180deg,rgba(255,252,247,0.94)_0%,rgba(247,239,230,0.92)_100%)] p-4 sm:p-5 lg:h-[760px] lg:overflow-y-auto">
            <div className="mx-auto max-w-[760px] rounded-[28px] border border-[color:var(--wb-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(251,247,242,0.96)_100%)] px-5 py-6 shadow-[var(--wb-shadow-lg)]">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[color:var(--wb-accent)]">
                    成稿预览
                  </p>
                  <h3
                    className="mt-2 text-[28px] leading-tight text-[color:var(--wb-text)]"
                    style={{ fontFamily: 'var(--wb-font-serif)' }}
                  >
                    {title || '未命名稿件'}
                  </h3>
                </div>
                <div className="rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,250,244,0.92)] px-3 py-1 text-xs text-[color:var(--wb-text-muted)] shadow-[var(--wb-shadow-tight)]">
                  发布前排版
                </div>
              </div>
              <div
                className="space-y-5 text-[color:var(--wb-text)] [&_blockquote]:my-5 [&_blockquote]:rounded-[18px] [&_blockquote]:border [&_blockquote]:border-[color:var(--wb-border)] [&_blockquote]:bg-[rgba(250,244,237,0.9)] [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:text-[color:var(--wb-text-muted)] [&_code]:rounded-[8px] [&_code]:bg-[rgba(238,223,208,0.55)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.94em] [&_h1]:mb-3 [&_h1]:text-[30px] [&_h1]:leading-tight [&_h1]:font-semibold [&_h1]:text-[color:var(--wb-text)] [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-[22px] [&_h2]:leading-tight [&_h2]:font-semibold [&_h2]:text-[color:var(--wb-text)] [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:pl-3 [&_h3]:border-l-4 [&_h3]:border-[color:var(--wb-accent)] [&_h3]:text-[19px] [&_h3]:leading-snug [&_h3]:font-semibold [&_h3]:text-[color:var(--wb-text)] [&_hr]:my-8 [&_hr]:border-[color:var(--wb-border)] [&_img]:my-6 [&_img]:max-w-full [&_img]:rounded-[18px] [&_img]:border [&_img]:border-[color:var(--wb-border)] [&_li]:my-2 [&_ol]:my-4 [&_ol]:pl-6 [&_p]:my-4 [&_p]:text-[16px] [&_p]:leading-8 [&_p]:text-[color:var(--wb-text)] [&_ul]:my-4 [&_ul]:pl-6 [&_a]:text-[color:var(--wb-accent)] [&_a]:underline [&_a]:decoration-[color:var(--wb-accent-soft)] [&_a]:underline-offset-4"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
              <div className="mt-6 border-t border-[color:var(--wb-border)] pt-4 text-xs leading-6 text-[color:var(--wb-text-muted)]">
                这张纸面会随着标题和正文实时更新，适合检查长文节奏、段落密度和最终分发前的阅读感。
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
