'use client';

import { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { aggregatePublishHistory, suggestPublishTiming } from '@/lib/agent/publishOps';
import type { SyncTask } from '@/lib/sync/types';
import * as publishStyles from './publish.css';

export default function PublishTimingSuggestion() {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/sync-tasks')
      .then((r) => r.json())
      .then((data: { syncTasks?: SyncTask[] }) => {
        if (!data.syncTasks || data.syncTasks.length === 0) return;
        const stats = aggregatePublishHistory(data.syncTasks);
        setSuggestions(suggestPublishTiming(stats));
      })
      .catch(() => {
        // silently fail — timing suggestions are non-critical
      });
  }, []);

  if (suggestions.length === 0) return null;

  return (
    <div className={publishStyles.rightPanelSection}>
      <span className={publishStyles.rightPanelSectionTitle}>
        <Clock3 size={11} style={{ marginRight: 4, verticalAlign: '-1px' }} />
        发布时机
      </span>
      <ul style={{ margin: 0, padding: '4px 0 0 16px', fontSize: '12px', color: '#6b5b4f' }}>
        {suggestions.map((s) => (
          <li key={s} style={{ marginBottom: 2 }}>{s}</li>
        ))}
      </ul>
    </div>
  );
}
