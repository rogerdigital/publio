'use client';

import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import { useEffect, useRef, useState } from 'react';
import { usePublishStore } from '@/stores/publishStore';
import { markdownToHtml } from '@/lib/markdown';
import {
  countCharacters,
  countParagraphs,
  countHeadings,
  estimateReadTime,
} from '@/lib/contentStats';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface MarkdownEditorProps {
  activeTab: 'edit' | 'preview';
}

export default function MarkdownEditor({ activeTab }: MarkdownEditorProps) {
  const { title, setTitle, content, setContent } = usePublishStore();
  const [editorHeight, setEditorHeight] = useState<number | undefined>(undefined);
  const [isDesktop, setIsDesktop] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorWrapRef = useRef<HTMLDivElement>(null);

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
    <div data-color-mode="light" className="overflow-hidden bg-[color:var(--wb-surface)]">
      {/* 编辑区：始终保持挂载，通过 CSS 显隐，避免 MDEditor 重复初始化导致闪烁 */}
      <div style={{ display: activeTab === 'edit' ? undefined : 'none' }}>
        {/* 标题输入区 */}
        <div className="border-b border-[color:var(--wb-border-faint)] px-4 py-4 transition-colors focus-within:border-[color:var(--wb-accent)] sm:px-5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="给文章起个标题"
            className="font-serif-brand w-full border-0 bg-transparent text-[24px] leading-tight text-[color:var(--wb-text)] outline-none placeholder:text-[color:var(--wb-text-muted)] sm:text-[28px]"
          />
        </div>

        {/* 正文编辑区 */}
        <div
          ref={editorWrapRef}
          className="bg-[color:var(--wb-surface)] [&_.w-md-editor]:border-0 [&_.w-md-editor]:rounded-none [&_.w-md-editor]:bg-transparent [&_.w-md-editor]:text-[color:var(--wb-text)] [&_.w-md-editor-toolbar]:border-b [&_.w-md-editor-toolbar]:border-[color:var(--wb-border-faint)] [&_.w-md-editor-toolbar]:border-t-0 [&_.w-md-editor-toolbar]:bg-[color:var(--wb-surface)] [&_.w-md-editor-toolbar]:px-3 [&_.w-md-editor-toolbar]:py-1.5 [&_.w-md-editor-toolbar-divider]:bg-[color:var(--wb-border-faint)] [&_.w-md-editor-bar]:hidden [&_.w-md-editor-text-input]:font-[family-name:var(--wb-font-sans)] [&_.w-md-editor-text-input]:bg-transparent [&_.w-md-editor-text-input]:text-[color:var(--wb-text)] [&_.w-md-editor-text-input]:placeholder:text-[color:var(--wb-text-muted)] [&_.wmde-markdown]:bg-transparent [&_.wmde-markdown]:text-[color:var(--wb-text)] [&_.w-md-editor-area]:bg-transparent"
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('.w-md-editor-toolbar')) return;
            if (isDesktop) {
              const textarea = editorWrapRef.current?.querySelector<HTMLTextAreaElement>('textarea.w-md-editor-text-input');
              textarea?.focus();
            } else {
              textareaRef.current?.focus();
            }
          }}
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
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="开始写作，支持 Markdown 语法..."
              className="min-h-[18rem] w-full resize-y border-0 bg-transparent px-4 py-4 text-[15px] leading-7 text-[color:var(--wb-text)] outline-none placeholder:text-[color:var(--wb-text-muted)] sm:min-h-[22rem] sm:px-5 sm:py-5"
            />
          )}
        </div>

        {/* 底部数据栏 */}
        <div className="px-4 pb-3 pt-2 sm:px-5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[color:var(--wb-text-muted)]">
            <span>{countCharacters(cleanContent)} 字符</span>
            <span className="text-[color:var(--wb-border-strong)]">·</span>
            <span>{countParagraphs(cleanContent)} 段落</span>
            <span className="text-[color:var(--wb-border-strong)]">·</span>
            <span>{countHeadings(cleanContent)} 标题</span>
            <span className="text-[color:var(--wb-border-strong)]">·</span>
            <span>约 {cleanContent ? estimateReadTime(cleanContent) : '1 分钟'} 阅读</span>
          </div>
        </div>
      </div>

      {/* 预览区 */}
      {activeTab === 'preview' && (
        <div className="px-6 py-6 lg:min-h-[760px] sm:px-8">
          <div>
            <div className="mb-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[color:var(--wb-accent)]">
                成稿预览
              </p>
              <h3
                className="font-serif-brand mt-2 text-[28px] leading-tight text-[color:var(--wb-text)]"
              >
                {title || '未命名稿件'}
              </h3>
            </div>
            <div
              className="space-y-5 text-[color:var(--wb-text)] [&_blockquote]:my-5 [&_blockquote]:rounded-[18px] [&_blockquote]:border [&_blockquote]:border-[color:var(--wb-border)] [&_blockquote]:bg-[rgba(250,244,237,0.9)] [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:text-[color:var(--wb-text-muted)] [&_code]:rounded-[8px] [&_code]:bg-[rgba(238,223,208,0.55)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.94em] [&_h1]:mb-3 [&_h1]:text-[30px] [&_h1]:leading-tight [&_h1]:font-semibold [&_h1]:text-[color:var(--wb-text)] [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-[22px] [&_h2]:leading-tight [&_h2]:font-semibold [&_h2]:text-[color:var(--wb-text)] [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:pl-3 [&_h3]:border-l-4 [&_h3]:border-[color:var(--wb-accent)] [&_h3]:text-[19px] [&_h3]:leading-snug [&_h3]:font-semibold [&_h3]:text-[color:var(--wb-text)] [&_hr]:my-8 [&_hr]:border-[color:var(--wb-border)] [&_img]:my-6 [&_img]:max-w-full [&_img]:rounded-[18px] [&_img]:border [&_img]:border-[color:var(--wb-border)] [&_li]:my-2 [&_ol]:my-4 [&_ol]:pl-6 [&_p]:my-4 [&_p]:text-[16px] [&_p]:leading-8 [&_p]:text-[color:var(--wb-text)] [&_ul]:my-4 [&_ul]:pl-6 [&_a]:text-[color:var(--wb-accent)] [&_a]:underline [&_a]:decoration-[color:var(--wb-accent-soft)] [&_a]:underline-offset-4"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
