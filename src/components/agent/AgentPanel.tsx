'use client';

import { useCallback } from 'react';
import { X, Copy, Replace, CornerDownLeft } from 'lucide-react';
import { useAgentStore } from '@/stores/agentStore';
import { usePublishStore } from '@/stores/publishStore';
import * as styles from './AgentPanel.css';

const ACTION_LABELS: Record<string, string> = {
  expand: '扩写',
  condense: '缩写',
  rewrite: '改写',
  polish: '润色',
  continue: '续写',
};

export default function AgentPanel() {
  const { status, output, error, activeAction, abort, reset } = useAgentStore();
  const { content, setContent } = usePublishStore();

  const handleInsert = useCallback(() => {
    // 在当前内容末尾追加 agent 输出
    const separator = content.endsWith('\n') ? '\n' : '\n\n';
    setContent(content + separator + output);
    reset();
  }, [content, output, setContent, reset]);

  const handleReplace = useCallback(() => {
    // 替换全部内容
    setContent(output);
    reset();
  }, [output, setContent, reset]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
  }, [output]);

  const handleClose = useCallback(() => {
    if (status === 'streaming') {
      abort();
    }
    reset();
  }, [status, abort, reset]);

  const actionLabel = activeAction ? ACTION_LABELS[activeAction] || activeAction : 'AI';

  return (
    <div className={styles.panelWrap}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>
          AI 助手
          <span className={styles.panelBadge}>{actionLabel}</span>
        </span>
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          title="关闭"
        >
          <X size={14} />
        </button>
      </div>

      <div className={styles.panelBody}>
        {error ? (
          <div className={styles.errorBox}>{error}</div>
        ) : output ? (
          <div className={styles.outputArea}>
            {output}
            {status === 'streaming' && <span className={styles.cursor} />}
          </div>
        ) : status === 'streaming' ? (
          <div className={styles.outputArea}>
            <span className={styles.cursor} />
          </div>
        ) : (
          <div className={styles.emptyState}>等待 AI 响应...</div>
        )}
      </div>

      {(status === 'done' || (status === 'error' && output)) && (
        <div className={styles.panelActions}>
          <button
            type="button"
            className={styles.actionButtonPrimary}
            onClick={handleInsert}
            title="追加到文末"
          >
            <CornerDownLeft size={13} />
            插入
          </button>
          <button
            type="button"
            className={styles.actionButton}
            onClick={handleReplace}
            title="替换全部内容"
          >
            <Replace size={13} />
            替换
          </button>
          <button
            type="button"
            className={styles.actionButton}
            onClick={handleCopy}
            title="复制到剪贴板"
          >
            <Copy size={13} />
            复制
          </button>
        </div>
      )}

      {status === 'streaming' && (
        <div className={styles.panelActions}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={abort}
          >
            停止生成
          </button>
        </div>
      )}
    </div>
  );
}
