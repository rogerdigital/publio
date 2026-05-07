'use client';

import { XCircle, CheckCircle2 } from 'lucide-react';
import type { PlatformId } from '@/types';
import { PLATFORMS } from '@/types';
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
}

export default function PublishConfirmDialog({
  open,
  title,
  platforms,
  onConfirm,
  onCancel,
  validating = false,
  validationErrors = [],
}: PublishConfirmDialogProps) {
  if (!open) return null;

  const hasErrors = validationErrors.length > 0;

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

        {hasErrors && (
          <div className={css.errorSection}>
            {validationErrors.map((err, i) => (
              <p key={i} className={css.errorItem}>
                <XCircle size={13} /> {err}
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
            className={css.confirmBtn({ disabled: hasErrors || validating })}
            onClick={onConfirm}
            disabled={hasErrors || validating}
          >
            {validating ? '校验中...' : hasErrors ? '内容待补全' : '确认发布'}
          </button>
        </div>
      </div>
    </div>
  );
}
