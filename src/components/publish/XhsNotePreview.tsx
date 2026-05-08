'use client';

import { markdownToPlainText } from '@/lib/markdown';
import * as styles from './publish.css';

interface XhsNotePreviewProps {
  title: string;
  body: string;
  tags: string[];
}

function extractImages(content: string): string[] {
  const regex = /!\[.*?\]\((https?:\/\/[^)]+)\)/g;
  const images: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    images.push(match[1]);
  }
  return images;
}

function stripImages(content: string): string {
  return content.replace(/!\[.*?\]\(.*?\)/g, '').trim();
}

export default function XhsNotePreview({ title, body, tags }: XhsNotePreviewProps) {
  const images = extractImages(body);
  const plainText = markdownToPlainText(stripImages(body));
  const displayText = plainText.length > 300 ? `${plainText.slice(0, 300)}…` : plainText;

  return (
    <div className={styles.xhsCard}>
      {/* 图片区域 */}
      {images.length > 0 && (
        <div className={styles.xhsImageGrid}>
          {images.slice(0, 3).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={`${i}-${src.slice(0, 30)}`} src={src} alt="" className={styles.xhsImage} />
          ))}
        </div>
      )}

      {/* 内容区 */}
      <div className={styles.xhsContent}>
        <p className={styles.xhsTitle}>{title || '未命名笔记'}</p>
        {displayText && <p className={styles.xhsText}>{displayText}</p>}

        {/* 标签 */}
        {tags.length > 0 && (
          <div className={styles.xhsTags}>
            {tags.map((tag) => (
              <span key={tag} className={styles.xhsTag}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 底部互动栏 */}
        <div className={styles.xhsFooter}>
          <div className={styles.xhsAuthorRow}>
            <div className={styles.xhsAuthorAvatar} />
            <span className={styles.xhsAuthorName}>作者</span>
          </div>
          <div className={styles.xhsActions}>
            <span className={styles.xhsActionIcon}>♡ 128</span>
          </div>
        </div>
      </div>
    </div>
  );
}
