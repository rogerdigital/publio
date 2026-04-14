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

function createExcerpt(value: string) {
  const plain = value.replace(/\s+/g, ' ').trim();
  return plain.length > 80 ? `${plain.slice(0, 80)}…` : plain;
}

export default function PlatformPreviewPanel({
  adaptations,
  selectedPlatforms,
}: PlatformPreviewPanelProps) {
  if (selectedPlatforms.length === 0) return null;

  return (
    <section className={styles.previewPanel}>
      <div className={styles.previewHeader}>
        <p className={styles.panelKicker}>Platform config</p>
        <h2 className={styles.previewTitle}>发布配置</h2>
      </div>

      <div className={styles.previewGrid}>
        {selectedPlatforms.map((platform) => {
          const draft = adaptations[platform];
          return (
            <article key={platform} className={styles.previewCard}>
              {/* 平台名 + 状态 */}
              <div className={styles.previewMeta}>
                <p className={styles.previewPlatform}>{platformLabels[platform]}</p>
                <span className={`${styles.previewState} ${draft.isReady ? '' : styles.previewStateNotReady}`}>
                  {draft.isReady ? '可发布' : '待补全'} · {formatLabels[draft.format]}
                </span>
              </div>

              {/* 内容摘要（只读，帮助用户确认内容） */}
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
    </section>
  );
}
