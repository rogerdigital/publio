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
import * as styles from './editor.css';

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
    <div data-color-mode="light" className={styles.editorRoot}>
      {/* 编辑区：始终保持挂载，通过 CSS 显隐，避免 MDEditor 重复初始化导致闪烁 */}
      <div style={{ display: activeTab === 'edit' ? undefined : 'none' }}>
        {/* 标题输入区 */}
        <div className={styles.titleRow}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="给文章起个标题"
            className={styles.titleInput}
          />
        </div>

        {/* 正文编辑区 */}
        <div
          ref={editorWrapRef}
          className={styles.editorWrap}
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
              className={styles.mobileTextarea}
            />
          )}
        </div>

        {/* 底部数据栏 */}
        <div className={styles.statsBar}>
          <div className={styles.statsRow}>
            <span>{countCharacters(cleanContent)} 字符</span>
            <span className={styles.statsDot}>·</span>
            <span>{countParagraphs(cleanContent)} 段落</span>
            <span className={styles.statsDot}>·</span>
            <span>{countHeadings(cleanContent)} 标题</span>
            <span className={styles.statsDot}>·</span>
            <span>约 {cleanContent ? estimateReadTime(cleanContent) : '1 分钟'} 阅读</span>
          </div>
        </div>
      </div>

      {/* 预览区 */}
      {activeTab === 'preview' && (
        <div className={styles.previewWrap}>
          <div>
            <div className={styles.previewTitleBlock}>
              <p className={styles.previewKicker}>
                成稿预览
              </p>
              <h3 className={styles.previewTitle}>
                {title || '未命名稿件'}
              </h3>
            </div>
            <div
              className={styles.previewContent}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
