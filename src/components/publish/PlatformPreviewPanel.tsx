import type { PlatformId } from '@/types';
import type {
  PlatformContentDraft,
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
  onUpdate?: (
    platform: PlatformId,
    input: Partial<Pick<PlatformContentDraft, 'title' | 'body' | 'suggestedTags' | 'threadParts'>>,
  ) => void;
}

function createExcerpt(value: string) {
  const plain = value.replace(/\s+/g, ' ').trim();
  return plain.length > 120 ? `${plain.slice(0, 120)}...` : plain;
}

export default function PlatformPreviewPanel({
  adaptations,
  selectedPlatforms,
  onUpdate,
}: PlatformPreviewPanelProps) {
  if (selectedPlatforms.length === 0) return null;

  return (
    <section className={styles.previewPanel}>
      <div className={styles.previewHeader}>
        <p className={styles.panelKicker}>Platform preview</p>
        <h2 className={styles.previewTitle}>分发前预览</h2>
      </div>

      <div className={styles.previewGrid}>
        {selectedPlatforms.map((platform) => {
          const draft = adaptations[platform];
          return (
            <article key={platform} className={styles.previewCard}>
              <div className={styles.previewMeta}>
                <p className={styles.previewPlatform}>{platformLabels[platform]}</p>
                <span className={`${styles.previewState} ${draft.isReady ? '' : styles.previewStateNotReady}`}>
                  {draft.isReady ? '可发布' : '待补全'} · {formatLabels[draft.format]}
                </span>
              </div>
              <label className={styles.previewField}>
                <span className={styles.previewLabel}>{platformLabels[platform]}标题</span>
                <input
                  className={styles.previewInput}
                  value={draft.title}
                  onChange={(event) => onUpdate?.(platform, { title: event.target.value })}
                />
              </label>
              <label className={styles.previewField}>
                <span className={styles.previewLabel}>{platformLabels[platform]}正文</span>
                <textarea
                  className={styles.previewTextarea}
                  value={draft.body}
                  onChange={(event) => onUpdate?.(platform, { body: event.target.value })}
                />
              </label>
              <p className={styles.previewBody}>{createExcerpt(draft.body)}</p>
              {draft.warnings.length > 0 ? (
                <ul className={styles.previewWarningList}>
                  {draft.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              ) : null}
              {draft.suggestedTags.length > 0 ? (
                <div className={styles.previewTagList}>
                  {draft.suggestedTags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              ) : null}
              {draft.threadParts.length > 0 ? (
                <ol className={styles.previewThreadList}>
                  {draft.threadParts.map((part, index) => (
                    <li key={`${index}-${part}`}>{`${index + 1}. ${part}`}</li>
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
