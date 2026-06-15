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

async function saveVariant(
  platform: PlatformId,
  adaptedContent: string,
  changeSummary: string,
  draftId: string | null,
  variantId: string | null,
  setVariantId: (platform: PlatformId, id: string | null) => void,
) {
  const patchBody = {
    content: adaptedContent,
    status: 'adapted',
    generatedByAgent: true,
    manuallyEdited: false,
    changeSummary,
  };

  if (variantId) {
    await fetch(`/api/platform-variants/${variantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patchBody),
    });
  } else if (draftId) {
    const res = await fetch(`/api/drafts/${draftId}/variants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platforms: [platform] }),
    });
    if (res.ok) {
      const data = await res.json();
      const created = data.variants?.[0];
      if (created) {
        setVariantId(platform, created.id);
        await fetch(`/api/platform-variants/${created.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patchBody),
        });
      }
    }
  }
}

export default function PlatformAdaptButton({ platform, agentEnabled }: PlatformAdaptButtonProps) {
  const {
    title,
    content,
    platformDrafts,
    setAIAdaptedContent,
    revertAIDraft,
    currentDraftId,
    variantIds,
    setVariantId,
  } = usePublishStore();
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
          } catch {
            /* skip */
          }
        }
      }

      if (accumulated) {
        let adaptedContent = accumulated;
        let changeSummary = '';

        // Try parsing as JSON {content, changeSummary}
        const jsonStart = accumulated.indexOf('{');
        const jsonEnd = accumulated.lastIndexOf('}');
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          try {
            const parsed = JSON.parse(accumulated.slice(jsonStart, jsonEnd + 1));
            if (parsed.content) {
              adaptedContent = parsed.content;
              changeSummary = parsed.changeSummary || '';
            }
          } catch {
            // fallback: treat entire response as content (backwards compatible)
          }
        }

        setAIAdaptedContent(platform, adaptedContent);
        saveVariant(
          platform,
          adaptedContent,
          changeSummary,
          currentDraftId,
          variantIds[platform],
          setVariantId,
        );
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
    } finally {
      setAdapting(false);
      abortRef.current = null;
    }
  }, [title, content, platform, setAIAdaptedContent, currentDraftId, variantIds, setVariantId]);

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
