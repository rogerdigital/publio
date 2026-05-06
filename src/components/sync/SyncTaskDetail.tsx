'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { PlatformId } from '@/types';
import type {
  SyncEvent,
  SyncEventType,
  SyncFailureCode,
  SyncNextAction,
  SyncReceiptStatus,
  SyncTask,
  SyncTaskStatus,
  PlatformSyncReceipt,
} from '@/lib/sync/types';
import type { AgentStreamEvent } from '@/lib/agent/types';
import SyncTaskMarkDoneButton from '@/components/sync/SyncTaskMarkDoneButton';
import SyncTaskRetryButton from '@/components/sync/SyncTaskRetryButton';
import * as styles from './sync.css';

const platformLabels: Record<PlatformId, string> = {
  wechat: '微信公众号',
  xiaohongshu: '小红书',
  zhihu: '知乎',
  x: 'X (Twitter)',
};

const taskStatusLabels: Record<SyncTaskStatus, string> = {
  pending: '待分发',
  syncing: '分发中',
  completed: '已完成',
  failed: '失败',
  partial: '部分完成',
  'needs-action': '需要处理',
};

const receiptStatusLabels: Record<SyncReceiptStatus, string> = {
  pending: '待分发',
  syncing: '分发中',
  'draft-created': '草稿已创建',
  published: '已发布',
  failed: '失败',
  'needs-action': '需要处理',
};

const failureCodeLabels: Record<SyncFailureCode, string> = {
  'auth-expired': '授权已过期',
  'rate-limited': '触发频率限制',
  'invalid-content': '内容格式有误',
  'network-error': '网络请求失败',
  'manual-required': '需要手动操作',
  'unknown': '未知错误',
};

const nextActionLabels: Record<SyncNextAction, string> = {
  'reconnect': '前往设置页重新授权',
  'wait-and-retry': '稍后重试',
  'fix-content': '修改内容后重新发布',
  'open-platform': '前往平台手动操作',
  'mark-done': '人工确认完成',
  'contact-support': '联系平台客服',
};

const eventTypeLabels: Record<SyncEventType, string> = {
  'created': '任务已创建',
  'platform-started': '平台开始分发',
  'platform-succeeded': '平台分发成功',
  'platform-failed': '平台分发失败',
  'platform-needs-action': '平台需要手动处理',
  'retried': '触发重试',
  'manual-completed': '人工标记完成',
};

function buildEventLabel(event: SyncEvent): string {
  const base = eventTypeLabels[event.type];
  if (event.platform) {
    return `${platformLabels[event.platform]}：${base}`;
  }
  return base;
}

function formatTime(value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return '时间待确认';
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp);
}

interface SyncTaskDetailProps {
  syncTask: SyncTask;
  agentEnabled?: boolean;
}

function DiagnoseButton({ receipt, taskId }: { receipt: PlatformSyncReceipt; taskId: string }) {
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState(receipt.diagnosis || '');
  const [retrying, setRetrying] = useState(false);
  const [retryMessage, setRetryMessage] = useState('');

  const canRetry = diagnosis.includes('可重试：是');

  const handleRetry = async () => {
    setRetrying(true);
    setRetryMessage('');
    try {
      const response = await fetch(`/api/sync-tasks/${taskId}/retry`, { method: 'POST' });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setRetryMessage(data.error ?? '重试失败');
      } else {
        setRetryMessage('重试已完成');
      }
    } catch {
      setRetryMessage('重试失败');
    } finally {
      setRetrying(false);
    }
  };

  const handleDiagnose = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/agent/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: receipt.platform,
          errorMessage: receipt.failureMessage || receipt.message || '未知错误',
          statusCode: undefined,
          context: receipt.failureCode ? `failureCode: ${receipt.failureCode}` : undefined,
        }),
      });

      if (!response.ok || !response.body) {
        setDiagnosis('诊断请求失败');
        return;
      }

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event: AgentStreamEvent = JSON.parse(line.slice(6));
            if (event.type === 'delta') {
              accumulated += event.content;
              setDiagnosis(accumulated);
            }
          } catch {
            // skip
          }
        }
      }
    } catch {
      setDiagnosis('诊断失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 8 }}>
      {!diagnosis && (
        <button
          type="button"
          onClick={handleDiagnose}
          disabled={loading}
          className={styles.receiptLink}
          style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}
        >
          <Sparkles size={12} style={{ marginRight: 4, verticalAlign: '-1px' }} />
          {loading ? '诊断中…' : 'AI 诊断'}
        </button>
      )}
      {diagnosis && (
        <div style={{ fontSize: '12px', color: '#5c4a3f', whiteSpace: 'pre-wrap', marginTop: 4, padding: '8px', background: '#faf6f2', borderRadius: 6 }}>
          {diagnosis}
          {canRetry && (
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                onClick={handleRetry}
                disabled={retrying}
                className={styles.receiptLink}
                style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0, fontWeight: 500 }}
              >
                {retrying ? '重试中…' : '🔄 智能重试'}
              </button>
              {retryMessage && <span style={{ marginLeft: 8, fontSize: '11px' }}>{retryMessage}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SyncTaskDetail({ syncTask, agentEnabled: agentEnabledProp }: SyncTaskDetailProps) {
  const hasFailedReceipt = syncTask.receipts.some((receipt) => receipt.status === 'failed');
  const [agentChecked, setAgentChecked] = useState(agentEnabledProp ?? false);

  useEffect(() => {
    if (agentEnabledProp !== undefined) return;
    fetch('/api/agent/status')
      .then((r) => r.json())
      .then((d) => setAgentChecked(d.available === true))
      .catch(() => setAgentChecked(false));
  }, [agentEnabledProp]);

  const agentEnabled = agentEnabledProp ?? agentChecked;

  return (
    <section className={styles.detailPanel}>
      <div className={styles.detailHeader}>
        <p className={styles.detailEyebrow}>Sync task</p>
        <h2 className={styles.detailTitle}>{syncTask.title}</h2>
        <p className={styles.detailMeta}>
          {taskStatusLabels[syncTask.status]} · {syncTask.receipts.length} 个平台 · 更新于 {formatTime(syncTask.updatedAt)}
        </p>
      </div>

      <div className={styles.receiptList}>
        {syncTask.receipts.map((receipt) => (
          <article key={receipt.platform} className={styles.receiptCard}>
            <div className={styles.receiptHeader}>
              <p className={styles.receiptPlatform}>{platformLabels[receipt.platform]}</p>
              <span className={styles.receiptStatus}>
                {receiptStatusLabels[receipt.status]}
              </span>
            </div>
            <p className={styles.receiptMessage}>
              {receipt.message ?? '暂无平台回执信息'} · 第 {receipt.attempts} 次尝试 · {formatTime(receipt.updatedAt)}
            </p>
            {receipt.failureCode ? (
              <p className={styles.receiptFailureReason}>
                原因：{failureCodeLabels[receipt.failureCode]}
                {receipt.nextAction ? `　建议：${nextActionLabels[receipt.nextAction]}` : ''}
              </p>
            ) : null}
            {receipt.url ? (
              <a
                className={styles.receiptLink}
                href={receipt.url}
                target="_blank"
                rel="noreferrer"
              >
                打开平台结果
              </a>
            ) : null}
            {receipt.status === 'needs-action' ? (
              <SyncTaskMarkDoneButton
                taskId={syncTask.id}
                platform={receipt.platform}
              />
            ) : null}
            {receipt.status === 'failed' && agentEnabled ? (
              <DiagnoseButton receipt={receipt} taskId={syncTask.id} />
            ) : null}
          </article>
        ))}
      </div>

      {hasFailedReceipt ? <SyncTaskRetryButton taskId={syncTask.id} /> : null}

      {syncTask.events && syncTask.events.length > 0 ? (
        <div>
          <p className={styles.eventTimelineTitle}>分发日志</p>
          <ol className={styles.eventTimeline}>
            {syncTask.events.map((event, index) => (
              <li key={index} className={styles.eventItem}>
                <span className={styles.eventDot} />
                <div className={styles.eventBody}>
                  <p className={styles.eventLabel}>{buildEventLabel(event)}</p>
                  {event.message ? (
                    <p className={styles.eventTime}>{event.message}</p>
                  ) : null}
                  <p className={styles.eventTime}>{formatTime(event.timestamp)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
