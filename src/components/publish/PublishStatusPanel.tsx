'use client';

import { usePublishStore } from '@/stores/publishStore';
import { PLATFORMS } from '@/types';
import { toPublishResultDisplayState } from '@/lib/publishStatus';
import {
  MessageSquare,
  BookOpen,
  GraduationCap,
  Twitter,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import * as styles from './publish.css';

const iconMap = {
  MessageSquare,
  BookOpen,
  GraduationCap,
  Twitter,
};

export default function PublishStatusPanel() {
  const { results, overallStatus } = usePublishStore();
  const successCount = results.filter(
    (r) => toPublishResultDisplayState(r.status) === 'success',
  ).length;
  const errorCount = results.filter(
    (r) => toPublishResultDisplayState(r.status) === 'error',
  ).length;
  const inFlightCount = results.filter(
    (r) => toPublishResultDisplayState(r.status) === 'publishing',
  ).length;
  const totalCount = results.length;

  if (overallStatus === 'idle') return null;

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.panelKicker}>Dispatch board</p>
          <h3 className={styles.panelTitle}>发布回执跟踪板</h3>
        </div>

        <div className={styles.panelStats}>
          <span className={styles.statBadge}>
            <CheckCircle2 size={12} color="var(--color-successText)" />
            {successCount} 已完成
          </span>
          <span className={styles.statBadge}>
            <XCircle size={12} color="var(--color-errorText)" />
            {errorCount} 异常
          </span>
          <span className={styles.statBadge}>
            <Loader2
              size={12}
              className={inFlightCount > 0 ? 'animate-spin' : undefined}
              color={inFlightCount > 0 ? 'var(--color-accent)' : 'var(--color-textMuted)'}
            />
            {totalCount > 0 ? `${totalCount} 张回执` : '等待回执'}
          </span>
        </div>
      </div>

      <div className={styles.resultList}>
        {results.length > 0
          ? results.map((result) => {
              const platform = PLATFORMS.find((p) => p.id === result.platform);
              if (!platform) return null;
              const Icon = iconMap[platform.icon as keyof typeof iconMap];
              const s = toPublishResultDisplayState(result.status);

              return (
                <div key={result.platform} className={styles.resultCardVariants[s]}>
                  <div className={styles.resultPlatformRow}>
                    <div className={styles.platformIconWrap}>
                      <Icon size={18} color="var(--color-textMuted)" />
                    </div>
                    <div>
                      <span className={styles.platformName}>{platform.name}</span>
                      <div className={styles.platformSubLabel}>
                        {s === 'success' ? 'Completed' : s === 'error' ? 'Needs attention' : 'In flight'}
                      </div>
                    </div>
                  </div>

                  <div className={styles.resultMessage}>
                    <span className={styles.resultMessageTextVariants[s]}>
                      {result.message}
                    </span>
                  </div>

                  <div className={styles.resultActions}>
                    <span className={styles.statusBadgeVariants[s]}>
                      {s === 'success' && <CheckCircle2 size={12} />}
                      {s === 'error' && <XCircle size={12} />}
                      {s === 'publishing' && <Loader2 size={12} className="animate-spin" />}
                      {result.status === 'draft-created'
                        ? '已建草稿'
                        : result.status === 'needs-action'
                        ? '待处理'
                        : s === 'success'
                        ? '已发布'
                        : s === 'error'
                        ? '发布失败'
                        : '发布中'}
                    </span>

                    {result.url ? (
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`打开 ${platform.name} 发布结果`}
                        className={styles.externalLink}
                      >
                        <ExternalLink size={15} />
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            })
          : overallStatus === 'publishing' && (
              <div className={styles.loadingWrap}>
                <div className={styles.loadingCard}>
                  <Loader2 size={18} className="animate-spin" color="var(--color-accent)" />
                  <span className={styles.loadingText}>正在向已选平台送达稿件...</span>
                </div>
                <div className={styles.loadingPlaceholder}>
                  回执到达后，这里会自动变成每个平台的案例卡片。
                </div>
              </div>
            )}
      </div>
    </div>
  );
}
