'use client';

import { useEffect, useState } from 'react';
import type { DraftVersion } from '@/lib/drafts/types';
import * as css from './VersionHistory.css';

interface VersionHistoryProps {
  draftId: string | null;
  onRestore: (version: DraftVersion) => void;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function VersionHistory({ draftId, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<DraftVersion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!draftId) {
      setVersions([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/drafts/${draftId}/versions`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setVersions(d.versions ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [draftId]);

  if (!draftId) return null;

  return (
    <div className={css.panel}>
      <h4 className={css.header}>版本历史</h4>

      {loading && <p className={css.empty}>加载中...</p>}

      {!loading && versions.length === 0 && (
        <p className={css.empty}>暂无历史版本</p>
      )}

      {[...versions].reverse().map((v) => (
        <div key={v.id} className={css.item} onClick={() => onRestore(v)}>
          <div className={css.dot} />
          <div className={css.body}>
            <p className={css.summary}>{v.changeSummary ?? '保存快照'}</p>
            <p className={css.time}>{formatTime(v.savedAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
