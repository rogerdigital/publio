'use client';

import { XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';
import type { PlatformId } from '@/types';
import { PLATFORMS } from '@/types';
import type { PublishCheckResult } from '@/lib/publishChecks/types';
import * as css from './publishConfirm.css';

const platformLabelMap: Record<PlatformId, string> = Object.fromEntries(
  PLATFORMS.map((p) => [p.id, p.name]),
) as Record<PlatformId, string>;

interface PublishConfirmDialogProps {
  open: boolean;
  title: string;
  platforms: PlatformId[];
  onConfirm: () => void;
  onCancel: () => void;
  validating?: boolean;
  validationErrors?: string[];
  checkResults?: PublishCheckResult[];
  canPublish?: boolean;
  hasWarnings?: boolean;
}

export default function PublishConfirmDialog({
  open,
  title,
  platforms,
  onConfirm,
  onCancel,
  validating = false,
  validationErrors = [],
  checkResults,
  canPublish = true,
  hasWarnings = false,
}: PublishConfirmDialogProps) {
  if (!open) return null;

  const hasLegacyErrors = validationErrors.length > 0;
  const errors = checkResults?.filter((c) => c.severity === 'error') ?? [];
  const warnings = checkResults?.filter((c) => c.severity === 'warning') ?? [];
  const infos = checkResults?.filter((c) => c.severity === 'info') ?? [];
  const isBlocked = !canPublish || hasLegacyErrors;

  return (
    <div className={css.overlay} onClick={onCancel}>
      <div className={css.dialog} onClick={(e) => e.stopPropagation()}>
        <h3 className={css.title}>确认发布</h3>

        <div className={css.section}>
          <span className={css.label}>标题</span>
          <p className={css.value}>{title || '(无标题)'}</p>
        </div>

        <div className={css.section}>
          <span className={css.label}>目标平台 ({platforms.length})</span>
          <div className={css.platformList}>
            {platforms.map((id) => (
              <span key={id} className={css.platformTag}>
                {platformLabelMap[id] ?? id}
              </span>
            ))}
          </div>
        </div>

        {validating && (
          <div className={css.infoSection}>
            <p className={css.infoItem}>
              <Loader2 size={13} /> 正在检查发布就绪状态…
            </p>
          </div>
        )}

        {hasLegacyErrors && (
          <div className={css.errorSection}>
            {validationErrors.map((err, i) => (
              <p key={i} className={css.errorItem}>
                <XCircle size={13} /> {err}
              </p>
            ))}
          </div>
        )}

        {errors.length > 0 && (
          <div className={css.errorSection}>
            {errors.map((check) => (
              <p key={check.id} className={css.errorItem}>
                <XCircle size={13} /> {check.message}
                {check.nextAction ? ` → ${check.nextAction}` : ''}
              </p>
            ))}
          </div>
        )}

        {warnings.length > 0 && (
          <div className={css.warningSection}>
            {warnings.map((check) => (
              <p key={check.id} className={css.warningItem}>
                <AlertTriangle size={13} /> {check.message}
              </p>
            ))}
          </div>
        )}

        {infos.length > 0 && (
          <div className={css.infoSection}>
            {infos.map((check) => (
              <p key={check.id} className={css.infoItem}>
                <Info size={13} /> {check.message}
              </p>
            ))}
          </div>
        )}

        <div className={css.actions}>
          <button type="button" className={css.cancelBtn} onClick={onCancel}>
            取消
          </button>
          <button
            type="button"
            className={css.confirmBtn({ disabled: isBlocked || validating })}
            onClick={onConfirm}
            disabled={isBlocked || validating}
          >
            {validating
              ? '校验中...'
              : isBlocked
                ? '内容待补全'
                : hasWarnings
                  ? '确认发布（有警告）'
                  : '确认发布'}
          </button>
        </div>
      </div>
    </div>
  );
}
