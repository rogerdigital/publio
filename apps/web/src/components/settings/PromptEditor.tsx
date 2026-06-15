import { useCallback, useEffect, useState } from 'react';
import { Sparkles, Save } from 'lucide-react';
import type { PlatformId } from '@/types';
import { PLATFORMS } from '@/types';
import * as styles from './settings.css';

const PROMPT_TARGETS = [
  { id: 'global', label: '全局' },
  ...PLATFORMS.map((p) => ({ id: p.id, label: p.name })),
];

export default function PromptEditor() {
  const [prompts, setPrompts] = useState<Record<string, string>>({});
  const [activeTarget, setActiveTarget] = useState<string>('global');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/custom-prompts')
      .then((r) => r.json())
      .then((data) => {
        if (data.prompts) {
          const map: Record<string, string> = {};
          for (const p of data.prompts) {
            map[p.platform] = p.prefix;
          }
          setPrompts(map);
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await fetch('/api/custom-prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: activeTarget,
          prefix: prompts[activeTarget] ?? '',
        }),
      });
    } finally {
      setSaving(false);
    }
  }, [activeTarget, prompts]);

  if (!loaded) return null;

  const currentValue = prompts[activeTarget] ?? '';

  return (
    <div className={styles.sectionGroup}>
      <div className={styles.sectionHeader}>
        <Sparkles size={14} />
        <span>自定义 AI Prompt</span>
      </div>
      <p className={styles.sectionHint}>
        为各平台的 AI 适配添加自定义要求。会追加到默认 prompt 之后。
      </p>

      <div className={styles.promptTargetTabs}>
        {PROMPT_TARGETS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={styles.promptTab({ active: activeTarget === t.id })}
            onClick={() => setActiveTarget(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <textarea
        className={styles.promptTextarea}
        value={currentValue}
        onChange={(e) => setPrompts((prev) => ({ ...prev, [activeTarget]: e.target.value }))}
        placeholder={`输入${PROMPT_TARGETS.find((t) => t.id === activeTarget)?.label ?? ''}的自定义 prompt 要求...`}
        aria-label={`自定义 prompt`}
        rows={4}
      />

      <div className={styles.promptActions}>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className={styles.sourceAddBtn}
        >
          <Save size={14} />
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}
