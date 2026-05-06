'use client';

import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import { useEffect, useRef, useState, useCallback } from 'react';
import { usePublishStore } from '@/stores/publishStore';
import { markdownToHtml } from '@/lib/markdown';
import {
  countCharacters,
  countParagraphs,
  countHeadings,
  estimateReadTime,
} from '@/lib/contentStats';
import { useSlashCommands } from '@/hooks/useSlashCommands';
import { useAgentStream } from '@/hooks/useAgentStream';
import SlashCommandMenu from './SlashCommandMenu';
import * as styles from './editor.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface MarkdownEditorProps {
  activeTab: 'edit' | 'preview';
  onSave?: () => Promise<void>;
  agentEnabled?: boolean;
}

export default function MarkdownEditor({ activeTab, onSave, agentEnabled = false }: MarkdownEditorProps) {
  const { title, setTitle, content, setContent, setActiveTab } = usePublishStore();
  const [editorHeight, setEditorHeight] = useState<number | undefined>(undefined);
  const [isDesktop, setIsDesktop] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorWrapRef = useRef<HTMLDivElement>(null);
  const slash = useSlashCommands(content, setContent, { agentEnabled });
  const agent = useAgentStream();

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

  // 全局快捷键
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 's') {
        e.preventDefault();
        onSave?.();
      }
      if (mod && e.key === 'Enter') {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('publio:publish'));
      }
      if (mod && e.key === 'p') {
        e.preventDefault();
        setActiveTab(activeTab === 'edit' ? 'preview' : 'edit');
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, onSave, setActiveTab]);

  // 监听编辑器 keydown 以处理 slash commands 导航
  useEffect(() => {
    const wrap = editorWrapRef.current;
    if (!wrap) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (slash.onKeyDown(e)) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    wrap.addEventListener('keydown', handleKeyDown, true);
    return () => {
      wrap.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [slash]);

  const lastContentForSlashRef = useRef(content);
  const handleContentChange = (val?: string) => {
    const newValue = val || '';
    setContent(newValue);
    // 仅当内容确实由用户输入变化时检测 slash command
    if (newValue !== lastContentForSlashRef.current) {
      lastContentForSlashRef.current = newValue;
      // 简单检测：如果新内容比旧内容多且包含 /，触发 slash 检测
      slash.onTextChange(newValue, newValue.length);
    }
  };

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) return;
      const { url } = await res.json();
      const insertion = `\n![${file.name}](${url})\n`;
      setContent(content + insertion);
    } catch {
      // 上传失败静默处理
    }
  }, [content, setContent]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const files = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith('image/'));
    if (files.length > 0) {
      e.preventDefault();
      for (const file of files) {
        void handleImageUpload(file);
      }
    }
  }, [handleImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length > 0) {
      e.preventDefault();
      for (const file of files) {
        void handleImageUpload(file);
      }
    }
  }, [handleImageUpload]);

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
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('.w-md-editor-toolbar')) return;
            if (target.closest('[data-slash-menu]')) return;
            if (isDesktop) {
              const textarea = editorWrapRef.current?.querySelector<HTMLTextAreaElement>('textarea.w-md-editor-text-input');
              textarea?.focus();
            } else {
              textareaRef.current?.focus();
            }
          }}
        >
          {slash.visible && (
            <div data-slash-menu>
              <SlashCommandMenu
                commands={slash.filteredCommands}
                selectedIndex={slash.selectedIndex}
                onSelect={(cmd) => {
                  const result = slash.selectCommand(cmd);
                  if (result?.type === 'ai') {
                    agent.request({
                      url: '/api/agent/write',
                      body: { action: result.action, content, title },
                      action: result.action,
                    });
                  }
                }}
              />
            </div>
          )}
          {isDesktop ? (
            <MDEditor
              value={content}
              onChange={handleContentChange}
              height={editorHeight}
              preview="edit"
              visibleDragbar={false}
            />
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
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
          <div className={styles.previewPhoneFrame}>
            {/* 模拟公众号/手机阅读顶栏 */}
            <div className={styles.previewPhoneBar}>
              <div className={styles.previewPhoneBarDots}>
                <span className={styles.previewPhoneBarDot} />
                <span className={styles.previewPhoneBarDot} />
                <span className={styles.previewPhoneBarDot} />
              </div>
              <span className={styles.previewPhoneBarLabel}>成稿预览</span>
              <div style={{ width: '36px' }} />
            </div>
            <div className={styles.previewInner}>
              <div className={styles.previewTitleBlock}>
                <p className={styles.previewKicker}>
                  文章
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
        </div>
      )}
    </div>
  );
}
