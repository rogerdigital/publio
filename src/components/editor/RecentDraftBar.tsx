'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ContentDraft } from '@/lib/drafts/types';
import * as styles from './editor.css';

interface DraftsResponse {
  drafts?: ContentDraft[];
}

export default function RecentDraftBar() {
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/drafts', { cache: 'no-store' })
      .then((res) => res.json() as Promise<DraftsResponse>)
      .then((data) => {
        if (!cancelled && data.drafts) {
          setDrafts(data.drafts.slice(0, 5));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (drafts.length === 0) return null;

  return (
    <div className={styles.recentDraftBar}>
      <span className={styles.recentDraftLabel}>最近草稿</span>
      <div className={styles.recentDraftChips}>
        {drafts.map((draft) => (
          <Link
            key={draft.id}
            href={`/?draftId=${draft.id}`}
            className={styles.recentDraftChip}
            title={draft.title}
          >
            {draft.title.length > 20 ? `${draft.title.slice(0, 20)}…` : draft.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
