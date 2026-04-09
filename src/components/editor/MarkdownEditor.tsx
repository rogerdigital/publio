'use client';

import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import { useEffect, useState } from 'react';
import { Eye, SquarePen } from 'lucide-react';
import { usePublishStore } from '@/stores/publishStore';
import { markdownToHtml } from '@/lib/markdown';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

function countCharacters(content: string) {
  return content.replace(/\s/g, '').length;
}

function countParagraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean).length;
}

function countHeadings(content: string) {
  return (content.match(/^#{1,6}\s+/gm) || []).length;
}

function countCjkCharacters(content: string) {
  return (
    content.match(
      /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3040-\u30ff\u31f0-\u31ff\uac00-\ud7af]/g,
    ) || []
  ).length;
}

function countLatinWords(content: string) {
  return content
    .replace(
      /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3040-\u30ff\u31f0-\u31ff\uac00-\ud7af]/g,
      ' ',
    )
    .split(/\s+/)
    .filter(Boolean).length;
}

function estimateReadTime(content: string) {
  const cjk = countCjkCharacters(content);
  const latin = countLatinWords(content);
  const minutes = Math.max(1, Math.ceil(cjk / 380 + latin / 220));
  return `${minutes} 分钟`;
}

export default function MarkdownEditor() {
  const { title, setTitle, content, setContent } = usePublishStore();
  const [editorHeight, setEditorHeight] = useState<number | undefined>(undefined);
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    function syncHeight() {
      const width = window.innerWidth;
      if (width >= 1024) {
        setIsDesktop(true);
        setEditorHeight(420);
        return;
      }
      setIsDesktop(false);
      setEditorHeight(undefined);
    }

    syncHeight();
    window.addEventListener('resize', syncHeight);
    return () => window.removeEventListener('resize', syncHeight);
  }, []);

  const cleanContent = content.trim();
  const previewHtml = markdownToHtml(
    cleanContent || '在这里开始撰写你的稿件内容，通过上方标签切换查看纸张预览。',
  );

  return (
    <div className="overflow-hidden rounded-[var(--wb-radius-xl)] border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)]">
      {/* 顶栏：tab 切换 */}
      <div className="border-b border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-4 py-2.5 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--wb-accent)]">
            Writing console
          </p>
          <div className="inline-flex rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg)] p-0.5">
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
      </div>

      {activeTab === 'edit' ? (
        <>
          {/* 标题输入区 */}
          <div className="border-b border-[color:var(--wb-border)] px-4 py-4 sm:px-5">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入文章标题..."
              className="w-full border-0 bg-transparent text-[24px] leading-tight text-[color:var(--wb-text)] outline-none placeholder:text-[color:var(--wb-text-muted)] sm:text-[28px]"
              style={{ fontFamily: 'var(--wb-font-serif)' }}
            />
          </div>

          {/* 正文编辑区 */}
          <div className="[&_.w-md-editor]:bg-transparent [&_.w-md-editor]:text-[color:var(--wb-text)] [&_.w-md-editor-toolbar]:border-[color:var(--wb-border)] [&_.w-md-editor-toolbar]:bg-[color:var(--wb-bg-elevated)] [&_.w-md-editor-toolbar]:px-3 [&_.w-md-editor-toolbar]:py-2 [&_.w-md-editor-toolbar-divider]:bg-[color:var(--wb-border)] [&_.w-md-editor-bar]:hidden [&_.w-md-editor-text-input]:font-[family-name:var(--wb-font-sans)] [&_.w-md-editor-text-input]:bg-transparent [&_.w-md-editor-text-input]:text-[color:var(--wb-text)] [&_.w-md-editor-text-input]:placeholder:text-[color:var(--wb-text-muted)] [&_.wmde-markdown]:bg-transparent [&_.wmde-markdown]:text-[color:var(--wb-text)] [&_.w-md-editor-area]:bg-transparent"
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
                onChange={(e) => setContent(e.target.value)}
                placeholder="输入文章内容..."
                className="min-h-[18rem] w-full resize-y border-0 bg-transparent px-4 py-4 text-[15px] leading-7 text-[color:var(--wb-text)] outline-none placeholder:text-[color:var(--wb-text-muted)] sm:min-h-[22rem] sm:px-5 sm:py-5"
              />
            )}
          </div>

          {/* 底部数据栏 */}
          <div className="border-t border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-4 py-2.5 sm:px-5">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[color:var(--wb-text-muted)]">
              <span>{countCharacters(cleanContent)} 字符</span>
              <span className="h-3 w-px bg-[color:var(--wb-border)]" />
              <span>{countParagraphs(cleanContent)} 段落</span>
              <span className="h-3 w-px bg-[color:var(--wb-border)]" />
              <span>{countHeadings(cleanContent)} 标题</span>
              <span className="h-3 w-px bg-[color:var(--wb-border)]" />
              <span>约 {cleanContent ? estimateReadTime(cleanContent) : '1 分钟'} 阅读</span>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-[color:var(--wb-bg)] p-4 sm:p-5 lg:min-h-[760px]">
          <div className="mx-auto max-w-[860px] rounded-[var(--wb-radius-xl)] border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-5 py-6">
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
              <div className="rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-3 py-1 text-xs text-[color:var(--wb-text-muted)]">
                发布前排版
              </div>
            </div>
            <div
              className="space-y-5 text-[color:var(--wb-text)] [&_blockquote]:my-5 [&_blockquote]:rounded-[18px] [&_blockquote]:border [&_blockquote]:border-[color:var(--wb-border)] [&_blockquote]:bg-[rgba(250,244,237,0.9)] [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:text-[color:var(--wb-text-muted)] [&_code]:rounded-[8px] [&_code]:bg-[rgba(238,223,208,0.55)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.94em] [&_h1]:mb-3 [&_h1]:text-[30px] [&_h1]:leading-tight [&_h1]:font-semibold [&_h1]:text-[color:var(--wb-text)] [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-[22px] [&_h2]:leading-tight [&_h2]:font-semibold [&_h2]:text-[color:var(--wb-text)] [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:pl-3 [&_h3]:border-l-4 [&_h3]:border-[color:var(--wb-accent)] [&_h3]:text-[19px] [&_h3]:leading-snug [&_h3]:font-semibold [&_h3]:text-[color:var(--wb-text)] [&_hr]:my-8 [&_hr]:border-[color:var(--wb-border)] [&_img]:my-6 [&_img]:max-w-full [&_img]:rounded-[18px] [&_img]:border [&_img]:border-[color:var(--wb-border)] [&_li]:my-2 [&_ol]:my-4 [&_ol]:pl-6 [&_p]:my-4 [&_p]:text-[16px] [&_p]:leading-8 [&_p]:text-[color:var(--wb-text)] [&_ul]:my-4 [&_ul]:pl-6 [&_a]:text-[color:var(--wb-accent)] [&_a]:underline [&_a]:decoration-[color:var(--wb-accent-soft)] [&_a]:underline-offset-4"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
            <div className="mt-6 border-t border-[color:var(--wb-border)] pt-4 text-xs leading-6 text-[color:var(--wb-text-muted)]">
              纸张预览单独占据完整工作区，更适合检查长文节奏、段落密度和发布前阅读感。
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
