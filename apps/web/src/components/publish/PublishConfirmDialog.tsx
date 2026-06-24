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
  const isBlocked = !canPublish || hasLegacyErrors;
  const hasIssues = hasLegacyErrors || errors.length > 0 || warnings.length > 0;

  return (
    <div className={css.overlay} onClick={onCancel}>
      <div className={css.dialog} onClick={(e) => e.stopPropagation()}>
        <h3 className={css.title}>确认发布</h3>

        <p className={css.summary}>
          将发布到{' '}
          <span className={css.platformListInline}>
            {platforms.map((id, i) => (
              <span key={id} className={css.platformInline}>
                {platformLabelMap[id] ?? id}
                {i < platforms.length - 1 ? '、' : ''}
              </span>
            ))}
          </span>
          ，共 {platforms.length} 个平台。
        </p>

        {validating && (
          <div className={css.infoRow}>
            <Loader2 size={13} /> 正在检查发布就绪状态…
          </div>
        )}

        {!validating && !hasIssues && (
          <div className={css.okRow}>
            <Info size={13} /> 内容检查通过，可以发布。
          </div>
        )}

        {!validating && hasLegacyErrors && (
          <div className={css.issueList}>
            {validationErrors.map((err, i) => (
              <p key={i} className={css.issueRow({ severity: 'error' })}>
                <XCircle size={13} /> {err}
              </p>
            ))}
          </div>
        )}

        {!validating && errors.length > 0 && (
          <div className={css.issueList}>
            {errors.map((check) => (
              <p key={check.id} className={css.issueRow({ severity: 'error' })}>
                <XCircle size={13} /> {check.message}
              </p>
            ))}
          </div>
        )}

        {!validating && warnings.length > 0 && (
          <div className={css.issueList}>
            {warnings.map((check) => (
              <p key={check.id} className={css.issueRow({ severity: 'warning' })}>
                <AlertTriangle size={13} /> {check.message}
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
