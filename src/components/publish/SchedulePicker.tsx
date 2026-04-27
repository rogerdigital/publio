'use client';

import { Clock } from 'lucide-react';
import { usePublishStore } from '@/stores/publishStore';
import * as styles from './schedulePicker.css';

export default function SchedulePicker() {
  const { scheduledAt, setScheduledAt } = usePublishStore();

  const minDatetime = new Date().toISOString().slice(0, 16);

  return (
    <div className={styles.pickerWrap}>
      <label className={styles.label}>
        <Clock size={14} />
        定时发布
      </label>
      <div className={styles.inputRow}>
        <input
          type="datetime-local"
          value={scheduledAt ?? ''}
          onChange={(e) => setScheduledAt(e.target.value || null)}
          min={minDatetime}
          className={styles.input}
        />
        {scheduledAt && (
          <button
            type="button"
            onClick={() => setScheduledAt(null)}
            className={styles.clearBtn}
          >
            取消
          </button>
        )}
      </div>
    </div>
  );
}
