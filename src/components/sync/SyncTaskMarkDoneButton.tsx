'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import type { PlatformId } from '@/types';
import * as styles from './sync.css';

interface SyncTaskMarkDoneButtonProps {
  taskId: string;
  platform: PlatformId;
}

export default function SyncTaskMarkDoneButton({
  taskId,
  platform,
}: SyncTaskMarkDoneButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');

  async function markDone() {
    setPending(true);
    setMessage('');

    try {
      const response = await fetch(`/api/sync-tasks/${taskId}/mark-done`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(data.error ?? '标记失败，请稍后再试。');
        return;
      }

      setMessage('已标记完成，正在刷新分发详情。');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '标记失败，请稍后再试。');
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button
        className={styles.inlineActionButton}
        disabled={pending}
        type="button"
        onClick={markDone}
      >
        {pending ? '正在标记...' : '标记已完成'}
      </button>
      {message ? <p className={styles.inlineActionMessage}>{message}</p> : null}
    </div>
  );
}
