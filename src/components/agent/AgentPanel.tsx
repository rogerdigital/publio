'use client';

import { useCallback, useRef, useState } from 'react';
import { X, Copy, Replace, CornerDownLeft, Send, Trash2 } from 'lucide-react';
import { useAgentStore } from '@/stores/agentStore';
import { usePublishStore } from '@/stores/publishStore';
import { useToastStore } from '@/stores/toastStore';
import type { AgentStreamEvent } from '@/lib/agent/types';
import * as styles from './AgentPanel.css';

const ACTION_LABELS: Record<string, string> = {
  expand: '扩写',
  condense: '缩写',
  rewrite: '改写',
  polish: '润色',
  continue: '续写',
  chat: '对话',
};

export default function AgentPanel() {
  const {
    status,
    output,
    error,
    activeAction,
    chatMessages,
    addChatTurn,
    clearChat,
    startStream,
    appendOutput,
    finishStream,
    setError,
    abort,
    reset,
  } = useAgentStore();
  const { title, content, setContent } = usePublishStore();
  const [chatInput, setChatInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // 发送聊天消息
  const handleSendChat = useCallback(async () => {
    const message = chatInput.trim();
    if (!message || status === 'streaming') return;

    // 添加用户消息到历史
    addChatTurn({ role: 'user', content: message });
    setChatInput('');

    // 如果有上一轮 AI 输出，先保存
    if (output && status === 'done') {
      addChatTurn({ role: 'assistant', content: output });
    }

    // 构建消息历史
    const messages = [
      ...chatMessages.map((t) => ({ role: t.role, content: t.content })),
      ...(output && status === 'done' ? [{ role: 'assistant' as const, content: output }] : []),
      { role: 'user' as const, content: message },
    ];

    const controller = startStream('chat');

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          context: { title, content: content.slice(0, 2000) },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.error || `请求失败 (${response.status})`;
        setError(msg);
        useToastStore.getState().addToast('error', msg);
        return;
      }

      if (!response.body) {
        setError('响应为空');
        return;
      }

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += value;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          const data = line.slice(6);
          try {
            const event: AgentStreamEvent = JSON.parse(data);

            switch (event.type) {
              case 'delta':
                appendOutput(event.content);
                break;
              case 'done':
                finishStream();
                return;
              case 'error':
                setError(event.error);
                return;
            }
          } catch {
            // skip unparseable lines
          }
        }
      }

      finishStream();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : '未知错误';
      setError(msg);
      useToastStore.getState().addToast('error', msg);
    }
  }, [
    chatInput,
    chatMessages,
    output,
    status,
    title,
    content,
    addChatTurn,
    startStream,
    appendOutput,
    finishStream,
    setError,
  ]);

  const handleChatKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        void handleSendChat();
      }
    },
    [handleSendChat],
  );

  const actionLabel = activeAction ? ACTION_LABELS[activeAction] || activeAction : 'AI';
  const hasChatHistory = chatMessages.length > 0;
  const showChatInput = status === 'done' || status === 'idle' || hasChatHistory;

  return (
    <div className={styles.panelWrap}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>
          AI 助手
          <span className={styles.panelBadge}>{actionLabel}</span>
          {hasChatHistory && (
            <button
              type="button"
              className={styles.clearChatButton}
              onClick={() => {
                clearChat();
                reset();
              }}
              title="清空对话"
              aria-label="清空对话"
            >
              <Trash2 size={11} />
            </button>
          )}
        </span>
        <button type="button" className={styles.closeButton} onClick={handleClose} title="关闭" aria-label="关闭">
          <X size={14} />
        </button>
      </div>

      <div className={styles.panelBody}>
        {/* 聊天历史 */}
        {hasChatHistory && (
          <div className={styles.chatMessages}>
            {chatMessages.map((turn, i) => (
              <div key={i} className={styles.chatTurn}>
                <span className={styles.chatTurnRole}>{turn.role === 'user' ? '你' : 'AI'}</span>
                <div
                  className={`${styles.chatTurnContent} ${turn.role === 'user' ? styles.chatTurnUser : styles.chatTurnAssistant}`}
                >
                  {turn.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 当前 AI 输出 */}
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
        ) : !hasChatHistory ? (
          <div className={styles.emptyState}>等待 AI 响应...</div>
        ) : null}
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

      {/* 聊天输入 */}
      {showChatInput && status !== 'streaming' && (
        <div className={styles.chatInputWrap}>
          <textarea
            ref={textareaRef}
            className={styles.chatInput}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleChatKeyDown}
            placeholder="输入追问或指令..."
            rows={1}
          />
          <button
            type="button"
            className={styles.chatSendButton}
            onClick={() => void handleSendChat()}
            disabled={!chatInput.trim()}
            title="发送"
            aria-label="发送"
          >
            <Send size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
