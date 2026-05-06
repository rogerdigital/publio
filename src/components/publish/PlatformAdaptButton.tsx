'use client';

import { useCallback, useRef, useState } from 'react';
import { Sparkles, Undo2, Loader2 } from 'lucide-react';
import { usePublishStore } from '@/stores/publishStore';
import type { PlatformId } from '@/types';
import type { AgentStreamEvent } from '@/lib/agent/types';
import * as styles from './publish.css';

interface PlatformAdaptButtonProps {
  platform: PlatformId;
  agentEnabled: boolean;
}

export default function PlatformAdaptButton({ platform, agentEnabled }: PlatformAdaptButtonProps) {
  const { title, content, platformDrafts, setAIAdaptedContent, revertAIDraft } = usePublishStore();
  const [adapting, setAdapting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const draft = platformDrafts[platform];
  const isAdapted = draft?.aiAdapted === true;

  const handleAdapt = useCallback(async () => {
    if (!content.trim()) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setAdapting(true);

    let accumulated = '';

    try {
      const response = await fetch('/api/agent/adapt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, platform }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        setAdapting(false);
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
          try {
            const event: AgentStreamEvent = JSON.parse(line.slice(6));
            if (event.type === 'delta') {
              accumulated += event.content;
            } else if (event.type === 'done') {
              break;
            }
          } catch { /* skip */ }
        }
      }

      if (accumulated) {
        setAIAdaptedContent(platform, accumulated);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
    } finally {
      setAdapting(false);
      abortRef.current = null;
    }
  }, [title, content, platform, setAIAdaptedContent]);

  const handleRevert = useCallback(() => {
    revertAIDraft(platform);
  }, [platform, revertAIDraft]);

  if (!agentEnabled) return null;

  if (isAdapted) {
    return (
      <button
        type="button"
        className={styles.adaptButtonRevert}
        onClick={handleRevert}
        title="恢复原始内容"
      >
        <Undo2 size={11} />
        回退
      </button>
    );
  }

  return (
    <button
      type="button"
      className={styles.adaptButton}
      onClick={handleAdapt}
      disabled={adapting || !content.trim()}
      title="用 AI 优化此平台内容"
    >
      {adapting ? <Loader2 size={11} className={styles.spinIcon} /> : <Sparkles size={11} />}
      {adapting ? '适配中…' : 'AI 适配'}
    </button>
  );
}
