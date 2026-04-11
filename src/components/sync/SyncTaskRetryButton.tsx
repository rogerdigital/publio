'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as styles from './sync.css';

interface SyncTaskRetryButtonProps {
  taskId: string;
}

export default function SyncTaskRetryButton({ taskId }: SyncTaskRetryButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');

  async function retryFailedPlatforms() {
    setPending(true);
    setMessage('');

    try {
      const response = await fetch(`/api/sync-tasks/${taskId}/retry`, {
        method: 'POST',
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(data.error ?? '重试失败，请稍后再试。');
        return;
      }

      setMessage('重试已完成，正在刷新分发详情。');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '重试失败，请稍后再试。');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.retryPanel}>
      <button
        className={styles.retryButton}
        disabled={pending}
        type="button"
        onClick={retryFailedPlatforms}
      >
        {pending ? '正在重试...' : '重试失败平台'}
      </button>
      {message ? <p className={styles.retryMessage}>{message}</p> : null}
    </div>
  );
}
