import { useMemo } from 'react';
import { usePublishStore } from '@/stores/publishStore';
import { PLATFORMS, PlatformId } from '@/types';
import { getPlatformReadiness } from '@/lib/publishChecks/platformReadiness';
import PlatformSelector from './PlatformSelector';
import PublishButton from './PublishButton';
import PublishStatusPanel from './PublishStatusPanel';
import * as styles from './PublishChecklist.css';

const READINESS_LABELS: Record<string, string> = {
  ready: '可发布',
  'needs-content': '内容待补全',
  'needs-adapt': '需要适配',
  unconfigured: '未配置',
  publishing: '发布中',
  success: '已发布',
  failed: '发布失败',
};

export default function PublishChecklist({ agentEnabled }: { agentEnabled: boolean }) {
  const { platforms, platformDrafts, overallStatus, results } = usePublishStore();

  const selectedPlatforms = useMemo(
    () =>
      (Object.entries(platforms) as [PlatformId, boolean][])
        .filter(([, selected]) => selected)
        .map(([id]) => id),
    [platforms],
  );

  const readinessItems = useMemo(
    () =>
      selectedPlatforms.map((platform) => {
        const result = results.find((r) => r.platform === platform);
        return getPlatformReadiness(
          platform,
          platformDrafts[platform],
          overallStatus,
          result ? { status: result.status, message: result.message } : undefined,
        );
      }),
    [selectedPlatforms, platformDrafts, overallStatus, results],
  );

  const platformNames: Record<PlatformId, string> = Object.fromEntries(
    PLATFORMS.map((p) => [p.id, p.name]),
  ) as Record<PlatformId, string>;

  return (
    <div className={styles.checklist}>
      {/* Step 1: 选择平台 */}
      <div className={styles.step}>
        <div className={styles.stepHeader}>
          <span className={styles.stepNumber}>1</span>
          <span className={styles.stepTitle}>选择平台</span>
        </div>
        <div className={styles.stepContent}>
          <PlatformSelector />
        </div>
      </div>

      {/* Step 2: 检查适配 */}
      {selectedPlatforms.length > 0 && (
        <div className={styles.step}>
          <div className={styles.stepHeader}>
            <span className={styles.stepNumber}>2</span>
            <span className={styles.stepTitle}>检查就绪</span>
          </div>
          <div className={styles.stepContent}>
            {readinessItems.map((item) => (
              <div key={item.platform} className={styles.platformRow}>
                <div className={styles.platformInfo}>
                  <span className={styles.platformName}>{platformNames[item.platform]}</span>
                </div>
                <span className={styles.readinessVariants[item.status]}>
                  {READINESS_LABELS[item.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: 发布 */}
      <div className={styles.step}>
        <div className={styles.stepHeader}>
          <span className={styles.stepNumber}>3</span>
          <span className={styles.stepTitle}>发布</span>
        </div>
        <div className={styles.stepContent}>
          <div className={styles.publishAction}>
            <PublishButton />
          </div>
          {overallStatus !== 'idle' && <PublishStatusPanel />}
          {results.some((r) => r.status === 'error') && (
            <div className={styles.failureGuidance}>
              {results
                .filter((r) => r.status === 'error')
                .map((r) => (
                  <div key={r.platform} className={styles.failureItem}>
                    <span className={styles.failurePlatform}>{platformNames[r.platform]}</span>
                    <span className={styles.failureMessage}>{r.message || '发布失败'}</span>
                  </div>
                ))}
            </div>
          )}
          {results.some((r) => r.status === 'success') && (
            <a href="/drafts" className={styles.resultLink}>
              查看分发记录 →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
