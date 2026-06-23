import { memo, useDeferredValue, useMemo } from 'react';
import { markdownToHtml } from '@/lib/markdown';
import * as styles from './editor.css';

interface ArticlePreviewProps {
  title: string;
  content: string;
}

/**
 * 成稿预览：把 markdownToHtml 的重计算（marked.lexer + sanitize-html）
 * 隔离在独立子组件里，并只在「预览」态挂载，编辑态零开销。
 *
 * - 仅在 activeTab === 'preview' 时由父组件渲染，编辑态完全不挂载。
 * - memo 包裹，title/content 引用不变则跳过重渲。
 * - 内部用 useDeferredValue + useMemo 把 markdown 解析推到低优先级，
 *   避免切换到预览态或大文本更新时阻塞输入。
 */
function ArticlePreview({ title, content }: ArticlePreviewProps) {
  // 大文本下把解析推到低优先级，避免与输入/切换竞争主线程。
  const deferredContent = useDeferredValue(content);
  const previewHtml = useMemo(
    () => markdownToHtml(deferredContent.trim() || '开始写作后，这里会显示文章预览。'),
    [deferredContent],
  );

  return (
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
            <p className={styles.previewKicker}>文章</p>
            <h3 className={styles.previewTitle}>{title || '未命名稿件'}</h3>
          </div>
          <div
            className={styles.previewContent}
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(ArticlePreview);
