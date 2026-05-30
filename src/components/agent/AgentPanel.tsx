'use client';

import { useCallback, useEffect, useRef } from 'react';
import { X, Copy, Replace, CornerDownLeft } from 'lucide-react';
import { useAgentStore } from '@/stores/agentStore';
import { usePublishStore } from '@/stores/publishStore';
import { renderAgentMarkdown } from '@/lib/agent/renderMarkdown';
import * as styles from './AgentPanel.css';

const ACTION_LABELS: Record<string, string> = {
  rewrite: '改写',
  title: '标题建议',
  adapt: '平台适配',
};

export default function AgentPanel() {
  const { status, output, error, activeAction, abort, reset } = useAgentStore();
  const { content, setContent } = usePublishStore();
  const bodyRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);

  useEffect(() => {
    userScrolledRef.current = false;
  }, [activeAction]);

  useEffect(() => {
    if (status === 'streaming' && !userScrolledRef.current && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [output, status]);

  const handleBodyScroll = useCallback(() => {
    if (!bodyRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = bodyRef.current;
    userScrolledRef.current = scrollHeight - scrollTop - clientHeight > 40;
  }, []);

  const handleInsert = useCallback(() => {
    const separator = content.endsWith('\n') ? '\n' : '\n\n';
    setContent(content + separator + output);
    reset();
  }, [content, output, setContent, reset]);

  const handleReplace = useCallback(() => {
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
          aria-label="关闭"
        >
          <X size={14} />
        </button>
      </div>

      <div className={styles.panelBody} ref={bodyRef} onScroll={handleBodyScroll}>
        {/* 当前 AI 输出 */}
        {error ? (
          <div className={styles.errorBox}>{error}</div>
        ) : output ? (
          <div className={styles.outputArea}>
            <span dangerouslySetInnerHTML={{ __html: renderAgentMarkdown(output) }} />
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

      {/* 操作按钮：插入/替换/复制 */}
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

      {/* 停止生成 */}
      {status === 'streaming' && (
        <div className={styles.panelActions}>
          <button type="button" className={styles.actionButton} onClick={abort}>
            停止生成
          </button>
        </div>
      )}
    </div>
  );
}
