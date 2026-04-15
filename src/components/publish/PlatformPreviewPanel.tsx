'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { PlatformId } from '@/types';
import type {
  PlatformContentDrafts,
} from '@/lib/platformAdapters/types';
import * as styles from './publish.css';

const platformLabels: Record<PlatformId, string> = {
  wechat: '微信公众号',
  xiaohongshu: '小红书',
  zhihu: '知乎',
  x: 'X (Twitter)',
};

const formatLabels = {
  article: '长文',
  note: '笔记',
  thread: 'Thread',
};

interface PlatformPreviewPanelProps {
  adaptations: PlatformContentDrafts;
  selectedPlatforms: PlatformId[];
}

// 去除常见 Markdown 语法，返回纯文本
function stripMarkdown(content: string) {
  return content
    .replace(/!\[.*?\]\(.*?\)/g, '')          // 图片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')  // 链接 → 保留文字
    .replace(/#{1,6}\s*/g, '')                 // 标题
    .replace(/\*{1,2}([^*]*)\*{1,2}/g, '$1')  // 粗体 / 斜体
    .replace(/_{1,2}([^_]*)_{1,2}/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')        // 代码
    .replace(/^[-*+]\s+/gm, '')               // 无序列表
    .replace(/^\d+\.\s+/gm, '')               // 有序列表
    .replace(/^>\s*/gm, '')                   // 引用
    .replace(/---+/g, '')                     // 分割线
    .replace(/\s+/g, ' ')
    .trim();
}

function createExcerpt(value: string) {
  const plain = stripMarkdown(value);
  return plain.length > 220 ? `${plain.slice(0, 220)}…` : plain;
}

// 提取 Markdown 中第一张图片的 URL
function extractFirstImage(content: string): string | null {
  const match = /!\[.*?\]\((https?:\/\/[^)]+)\)/.exec(content);
  return match ? match[1] : null;
}

export default function PlatformPreviewPanel({
  adaptations,
  selectedPlatforms,
}: PlatformPreviewPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (selectedPlatforms.length === 0) return null;

  return (
    <div className={styles.rightPanelSection}>
      <button
        type="button"
        className={styles.collapseToggle}
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
      >
        <span className={styles.rightPanelSectionTitle}>内容配置</span>
        <ChevronDown
          size={14}
          className={`${styles.collapseChevron}${isOpen ? ` ${styles.collapseChevronOpen}` : ''}`}
        />
      </button>

      <div
        className={styles.collapseContent}
        style={{ maxHeight: isOpen ? '600px' : 0 }}
      >
        <div className={styles.previewGrid} style={{ marginTop: '8px' }}>
          {selectedPlatforms.map((platform) => {
            const draft = adaptations[platform];
            const firstImage = extractFirstImage(draft.body);

            return (
              <article key={platform} className={styles.previewCard}>
                {/* 平台名 + 状态 */}
                <div className={styles.previewMeta}>
                  <p className={styles.previewPlatform}>{platformLabels[platform]}</p>
                  <span className={`${styles.previewState} ${draft.isReady ? '' : styles.previewStateNotReady}`}>
                    {draft.isReady ? '可发布' : '待补全'} · {formatLabels[draft.format]}
                  </span>
                </div>

                {/* 首图预览（外部 URL，无法提前配置 next/image 域名白名单） */}
                {firstImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={firstImage}
                    alt=""
                    className={styles.previewImage}
                  />
                ) : null}

                {/* 内容摘要 */}
                {draft.body ? (
                  <p className={styles.previewBody}>{createExcerpt(draft.body)}</p>
                ) : null}

                {/* Warnings */}
                {draft.warnings.length > 0 ? (
                  <ul className={styles.previewWarningList}>
                    {draft.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                ) : null}

                {/* 小红书：话题标签 */}
                {draft.suggestedTags.length > 0 ? (
                  <div className={styles.previewTagList}>
                    {draft.suggestedTags.map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>
                ) : null}

                {/* X：Thread 分段预览 */}
                {draft.threadParts.length > 1 ? (
                  <ol className={styles.previewThreadList}>
                    {draft.threadParts.map((part, index) => (
                      <li key={`${index}-${part.slice(0, 20)}`}>{`${index + 1}. ${part}`}</li>
                    ))}
                  </ol>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
