import '@uiw/react-md-editor/markdown-editor.css';
import type { ICommand } from '@uiw/react-md-editor';
import {
  lazy,
  memo,
  Suspense,
  useEffect,
  useDeferredValue,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { usePublishStore } from '@/stores/publishStore';
import {
  countCharacters,
  countParagraphs,
  countHeadings,
  estimateReadTime,
  TITLE_LIMIT,
  CONTENT_LIMIT,
} from '@/lib/contentStats';
import { useSlashCommands } from '@/hooks/useSlashCommands';
import { useAgentStream } from '@/hooks/useAgentStream';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useImmersiveMode } from '@/hooks/useImmersiveMode';
import { useClickOutside } from '@/hooks/useClickOutside';
import SlashCommandMenu from './SlashCommandMenu';
import EditorModeToggle from './EditorModeToggle';
import SaveButton from './SaveButton';
import ArticlePreview from './ArticlePreview';
import * as styles from './editor.css';

const MDEditor = lazy(() => import('@uiw/react-md-editor'));

// 隐藏 md-editor 自带的视图模式按钮（编辑/实时/预览），视图切换统一走「源码/实时」toggle
const stripEditorModeCommands = (_cmd: ICommand, isExtra: boolean): false | ICommand =>
  isExtra ? false : _cmd;

interface MarkdownEditorProps {
  activeTab: 'edit' | 'preview';
  onSave?: () => Promise<void>;
  agentEnabled?: boolean;
}

function MarkdownEditor({ activeTab, onSave, agentEnabled = false }: MarkdownEditorProps) {
  // 用 selector 订阅，避免 currentDraftId 等无关字段变化触发重渲染。
  const title = usePublishStore((s) => s.title);
  const setTitle = usePublishStore((s) => s.setTitle);
  const content = usePublishStore((s) => s.content);
  const setContent = usePublishStore((s) => s.setContent);
  const setActiveTab = usePublishStore((s) => s.setActiveTab);
  const editorMode = usePublishStore((s) => s.editorMode);
  // 统计用的"已确认"值：IME 合成中不更新，避免拼音临时字符计入字符统计
  const isComposingRef = useRef(false);
  const [confirmedContent, setConfirmedContent] = useState(content);
  const isComposingTitleRef = useRef(false);
  const [confirmedTitle, setConfirmedTitle] = useState(title);
  const [editorHeight, setEditorHeight] = useState<number | undefined>(undefined);
  const [isDesktop, setIsDesktop] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorWrapRef = useRef<HTMLDivElement>(null);
  const slash = useSlashCommands(content, setContent, { agentEnabled });
  const agent = useAgentStream();
  const immersive = useImmersiveMode();

  useClickOutside(editorWrapRef, slash.visible, slash.hide);

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
  useKeyboardShortcuts({
    shortcuts: [
      { key: 's', mod: true, description: '保存草稿', handler: () => onSave?.() },
      {
        key: 'Enter',
        mod: true,
        description: '发布',
        handler: () => document.dispatchEvent(new CustomEvent('publio:publish')),
      },
      {
        key: 'p',
        mod: true,
        description: '切换预览',
        handler: () => setActiveTab(activeTab === 'edit' ? 'preview' : 'edit'),
      },
    ],
  });

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
  const handleContentChange = useCallback(
    (val?: string) => {
      const newValue = val || '';
      setContent(newValue);
      // 仅当内容确实由用户输入变化时检测 slash command
      if (newValue !== lastContentForSlashRef.current) {
        lastContentForSlashRef.current = newValue;
        // 简单检测：如果新内容比旧内容多且包含 /，触发 slash 检测
        slash.onTextChange(newValue, newValue.length);
      }
    },
    [setContent, slash],
  );

  // content 变化时同步统计用的 confirmedContent，但跳过 IME 合成中
  useEffect(() => {
    if (!isComposingRef.current) setConfirmedContent(content);
  }, [content]);

  // title 变化时同步统计用的 confirmedTitle，但跳过 IME 合成中
  useEffect(() => {
    if (!isComposingTitleRef.current) setConfirmedTitle(title);
  }, [title]);

  const handleImageUpload = useCallback(
    async (file: File) => {
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
    },
    [content, setContent],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const files = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith('image/'));
      if (files.length > 0) {
        e.preventDefault();
        for (const file of files) {
          void handleImageUpload(file);
        }
      }
    },
    [handleImageUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
      if (files.length > 0) {
        e.preventDefault();
        for (const file of files) {
          void handleImageUpload(file);
        }
      }
    },
    [handleImageUpload],
  );

  // 统计用 deferred 值：大文本下输入时不阻塞（低优先级重算）
  const deferredConfirmedContent = useDeferredValue(confirmedContent);
  const deferredConfirmedTitle = useDeferredValue(confirmedTitle);
  const cleanConfirmed = deferredConfirmedContent.trim();
  const titleCount = countCharacters(deferredConfirmedTitle);
  const titleOver = titleCount > TITLE_LIMIT;
  // 正文统计合并一次算完，避免底部栏和沉浸态 footer 各扫一遍。
  const stats = useMemo(
    () => ({
      chars: countCharacters(cleanConfirmed),
      paragraphs: countParagraphs(cleanConfirmed),
      headings: countHeadings(cleanConfirmed),
      readTime: cleanConfirmed ? estimateReadTime(cleanConfirmed) : '1 分钟',
    }),
    [cleanConfirmed],
  );
  const contentOver = stats.chars > CONTENT_LIMIT;

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
            onCompositionStart={() => {
              isComposingTitleRef.current = true;
            }}
            onCompositionEnd={(e) => {
              isComposingTitleRef.current = false;
              setConfirmedTitle(e.currentTarget.value);
            }}
            placeholder="给文章起个标题"
            className={styles.titleInput}
          />
          <span className={styles.limitCount({ over: titleOver })}>
            {titleCount}/{TITLE_LIMIT}
          </span>
          <SaveButton onSave={onSave} />
        </div>

        {/* 正文编辑区 */}
        <div
          ref={editorWrapRef}
          className={styles.editorWrap}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onCompositionStart={() => {
            isComposingRef.current = true;
          }}
          onCompositionEnd={() => {
            isComposingRef.current = false;
            // 合成结束直接读 textarea 最终文本同步统计，避免依赖后续 onChange
            const ta = editorWrapRef.current?.querySelector<HTMLTextAreaElement>('textarea');
            if (ta) setConfirmedContent(ta.value);
          }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('.w-md-editor-toolbar')) return;
            if (target.closest('[data-slash-menu]')) return;
            if (isDesktop) {
              const textarea = editorWrapRef.current?.querySelector<HTMLTextAreaElement>(
                'textarea.w-md-editor-text-input',
              );
              textarea?.focus();
            } else {
              textareaRef.current?.focus();
            }
          }}
        >
          {isDesktop && (
            <div className={styles.toolbarSlot}>
              <EditorModeToggle />
            </div>
          )}
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
            <Suspense fallback={<div style={{ height: editorHeight }} />}>
              <MDEditor
                value={content}
                onChange={handleContentChange}
                height={editorHeight}
                preview={editorMode === 'live' ? 'live' : 'edit'}
                visibleDragbar={false}
                commandsFilter={stripEditorModeCommands}
                // 源码模式下关闭语法高亮 overlay：库会为 textarea 挂一个每次按键
                // 对全文同步跑 rehype-prism 的 overlay（processSync），大文本下
                // 阻塞主线程造成卡顿。live 模式保留高亮，实时预览仍需着色。
                highlightEnable={editorMode === 'live'}
                textareaProps={{ spellCheck: false, autoCapitalize: 'off', autoCorrect: 'off' }}
              />
            </Suspense>
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
            <span>
              <span className={styles.statsValue({ over: contentOver })}>{stats.chars}</span>{' '}
              <span className={styles.statsUnit}>/ {CONTENT_LIMIT} 字符</span>
            </span>
            <span className={styles.statsDot}>·</span>
            <span>
              <span className={styles.statsValue()}>{stats.paragraphs}</span>{' '}
              <span className={styles.statsUnit}>段落</span>
            </span>
            <span className={styles.statsDot}>·</span>
            <span>
              <span className={styles.statsValue()}>{stats.headings}</span>{' '}
              <span className={styles.statsUnit}>标题</span>
            </span>
            <span className={styles.statsDot}>·</span>
            <span>
              <span className={styles.statsUnit}>约</span>{' '}
              <span className={styles.statsValue()}>{stats.readTime}</span>{' '}
              <span className={styles.statsUnit}>阅读</span>
            </span>
            <button
              type="button"
              onClick={immersive.enter}
              className={styles.immersiveEntryBtn}
              aria-label="进入沉浸模式"
              title="沉浸写作 (Fullscreen)"
            >
              <Maximize2 size={13} />
              沉浸
            </button>
          </div>
        </div>
      </div>

      {/* 预览区：仅在预览态挂载，markdown 解析隔离在子组件内，编辑态零开销 */}
      {activeTab === 'preview' && <ArticlePreview title={title} content={content} />}

      {/* 沉浸式写作模式 */}
      {immersive.active && (
        <div className={styles.immersiveOverlay} data-color-mode="light">
          <div className={styles.immersiveToolbar}>
            <span className={styles.immersiveToolbarLabel}>沉浸写作</span>
            <button
              type="button"
              onClick={immersive.exit}
              className={styles.immersiveToolbarBtn}
              aria-label="退出沉浸模式"
            >
              <Minimize2 size={14} />
              退出
            </button>
          </div>
          <div className={styles.immersiveBody}>
            <div className={styles.immersiveInner}>
              <div className={styles.immersiveTitleRow}>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onCompositionStart={() => {
                    isComposingTitleRef.current = true;
                  }}
                  onCompositionEnd={(e) => {
                    isComposingTitleRef.current = false;
                    setConfirmedTitle(e.currentTarget.value);
                  }}
                  placeholder="给文章起个标题"
                  className={styles.immersiveTitleInput}
                />
                <span className={styles.limitCount({ over: titleOver })}>
                  {titleCount}/{TITLE_LIMIT}
                </span>
              </div>
              <div className={styles.immersiveEditorWrap}>
                <Suspense fallback={<div style={{ height: 500 }} />}>
                  <MDEditor
                    value={content}
                    onChange={handleContentChange}
                    height={500}
                    preview="edit"
                    visibleDragbar={false}
                    commandsFilter={stripEditorModeCommands}
                    // 沉浸模式固定源码态，关闭语法高亮 overlay 避免大文本卡顿。
                    highlightEnable={false}
                  />
                </Suspense>
              </div>
            </div>
          </div>
          <div className={styles.immersiveFooter}>
            <span className={styles.immersiveFooterText}>
              <span className={styles.statsValue({ over: contentOver })}>{stats.chars}</span>{' '}
              <span className={styles.statsUnit}>/ {CONTENT_LIMIT} 字符</span>
              <span className={styles.statsDot}> · </span>
              <span className={styles.statsValue()}>{stats.paragraphs}</span>{' '}
              <span className={styles.statsUnit}>段落</span>
              <span className={styles.statsDot}> · </span>
              <span className={styles.statsValue()}>{stats.headings}</span>{' '}
              <span className={styles.statsUnit}>标题</span>
              <span className={styles.statsDot}> · </span>
              <span className={styles.statsUnit}>约</span>{' '}
              <span className={styles.statsValue()}>{stats.readTime}</span>{' '}
              <span className={styles.statsUnit}>阅读</span>
              <span className={styles.statsDot}> · ESC 退出</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(MarkdownEditor);
