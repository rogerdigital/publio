import { useCallback, useEffect, useRef, useState } from 'react';
import { Sparkles, Undo2, Loader2 } from 'lucide-react';
import { usePublishStore } from '@/stores/publishStore';
import type { PlatformId } from '@/types';
import type { AgentStreamEvent } from '@/lib/agent/types';
import type { PlatformVariant } from '@/lib/platformVariants/types';
import * as styles from './publish.css';

interface PlatformAdaptButtonProps {
  platform: PlatformId;
  agentEnabled: boolean;
  disabled?: boolean;
  onMutationStart?: (platform: PlatformId) => number | null;
  onVariantSaved?: (platform: PlatformId, variant: PlatformVariant, operation: number) => boolean;
  onMutationEnd?: (platform: PlatformId, operation: number) => void;
}

async function saveVariant(
  platform: PlatformId,
  adaptedContent: string,
  changeSummary: string,
  draftId: string | null,
  variantId: string | null,
  signal: AbortSignal,
): Promise<PlatformVariant | null> {
  const patchBody = {
    content: adaptedContent,
    status: 'adapted',
    generatedByAgent: true,
    manuallyEdited: false,
    changeSummary,
  };

  if (variantId) {
    const response = await fetch(`/api/platform-variants/${variantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patchBody),
      signal,
    });
    if (!response.ok) return null;
    const data = await response.json();
    return (data.variant as PlatformVariant | undefined) ?? null;
  } else if (draftId) {
    const res = await fetch(`/api/drafts/${draftId}/variants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platforms: [platform] }),
      signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const created = data.variants?.[0] as PlatformVariant | undefined;
    if (!created) return null;

    const patchResponse = await fetch(`/api/platform-variants/${created.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patchBody),
      signal,
    });
    if (!patchResponse.ok) return null;
    const patchData = await patchResponse.json();
    return (patchData.variant as PlatformVariant | undefined) ?? null;
  }

  return null;
}

export default function PlatformAdaptButton({
  platform,
  agentEnabled,
  disabled = false,
  onMutationStart,
  onVariantSaved,
  onMutationEnd,
}: PlatformAdaptButtonProps) {
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

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [currentDraftId],
  );

  const handleAdapt = useCallback(async () => {
    if (!content.trim() || disabled) return;

    const operation = onMutationStart?.(platform) ?? null;
    if (onMutationStart && operation === null) return;

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

        const savedVariant = await saveVariant(
          platform,
          adaptedContent,
          changeSummary,
          currentDraftId,
          variantIds[platform],
          controller.signal,
        );
        if (!savedVariant || controller.signal.aborted) return;

        const accepted =
          operation === null || !onVariantSaved
            ? true
            : onVariantSaved(platform, savedVariant, operation);
        if (!accepted) return;

        setVariantId(platform, savedVariant.id);
        setAIAdaptedContent(platform, adaptedContent);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
    } finally {
      setAdapting(false);
      abortRef.current = null;
      if (operation !== null) onMutationEnd?.(platform, operation);
    }
  }, [
    title,
    content,
    platform,
    disabled,
    onMutationStart,
    currentDraftId,
    variantIds,
    onVariantSaved,
    setVariantId,
    setAIAdaptedContent,
    onMutationEnd,
  ]);

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
      disabled={disabled || adapting || !content.trim()}
      title="用 AI 优化此平台内容"
    >
      {adapting ? <Loader2 size={11} className={styles.spinIcon} /> : <Sparkles size={11} />}
      {adapting ? '适配中…' : 'AI 适配'}
    </button>
  );
}
