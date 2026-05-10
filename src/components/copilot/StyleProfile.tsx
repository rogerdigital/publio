'use client';

import { useEffect, useState } from 'react';
import { Save, Wand2, Loader2 } from 'lucide-react';
import * as styles from './copilot.css';

export default function StyleProfile() {
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/copilot/style')
      .then((r) => r.json())
      .then((data: { profile?: { description?: string } }) => {
        if (data.profile) setDescription(data.profile.description ?? '');
      })
      .finally(() => setLoaded(true));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/copilot/style', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError('');
    try {
      const res = await fetch('/api/copilot/style', { method: 'POST' });
      const data: { profile?: { description?: string }; error?: string } = await res.json();
      if (data.error) {
        setError(data.error);
      } else if (data.profile?.description) {
        setDescription(data.profile.description);
      }
    } catch {
      setError('分析请求失败');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!loaded) return null;

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <Wand2 size={14} />
        <span>写作风格</span>
      </div>
      <p className={styles.panelHint}>
        AI 将根据风格描述来匹配你的写作习惯。可手动编辑，或基于已有草稿自动分析。
      </p>

      <textarea
        className={styles.textarea}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="描述你的写作风格，如：短句为主，喜欢用比喻，段落不超过 3 句..."
        rows={4}
      />

      {error && <p className={styles.errorText}>{error}</p>}

      <div className={styles.buttonRow}>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || !description.trim()}
          className={styles.saveBtn}
        >
          <Save size={14} />
          {saving ? '保存中...' : '保存'}
        </button>
        <button
          type="button"
          onClick={() => void handleAnalyze()}
          disabled={analyzing}
          className={styles.analyzeBtn}
        >
          {analyzing ? <Loader2 size={14} className={styles.spinner} /> : <Wand2 size={14} />}
          {analyzing ? '分析中...' : '自动分析'}
        </button>
      </div>
    </div>
  );
}
