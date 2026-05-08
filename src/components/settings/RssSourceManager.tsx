'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Rss } from 'lucide-react';
import * as styles from './settings.css';

interface RssSource {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
}

export default function RssSourceManager() {
  const [sources, setSources] = useState<RssSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState('');

  const fetchSources = useCallback(async () => {
    try {
      const res = await fetch('/api/rss-sources');
      const data = await res.json();
      if (data.sources) setSources(data.sources);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSources();
  }, [fetchSources]);

  const handleAdd = async () => {
    setError('');
    if (!newName.trim() || !newUrl.trim()) {
      setError('名称和 URL 不能为空');
      return;
    }
    try {
      new URL(newUrl);
    } catch {
      setError('URL 格式无效');
      return;
    }

    try {
      const res = await fetch('/api/rss-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, url: newUrl }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '添加失败');
        return;
      }
      setNewName('');
      setNewUrl('');
      void fetchSources();
    } catch {
      setError('网络错误');
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    await fetch('/api/rss-sources', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, enabled }),
    });
    void fetchSources();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/rss-sources?id=${id}`, { method: 'DELETE' });
    void fetchSources();
  };

  if (loading) return <div className={styles.sectionHint}>加载中...</div>;

  return (
    <div className={styles.sectionGroup}>
      <div className={styles.sectionHeader}>
        <Rss size={14} />
        <span>自定义 RSS 源</span>
      </div>
      <p className={styles.sectionHint}>添加自定义 RSS 源，选题台会自动聚合这些源的内容。</p>

      {/* 添加表单 */}
      <div className={styles.sourceForm}>
        <input
          type="text"
          placeholder="源名称"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className={styles.sourceInput}
        />
        <input
          type="url"
          placeholder="https://example.com/feed"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className={styles.sourceInput}
        />
        <button type="button" onClick={() => void handleAdd()} className={styles.sourceAddBtn}>
          <Plus size={14} />
          添加
        </button>
      </div>
      {error && <p className={styles.sourceError}>{error}</p>}

      {/* 源列表 */}
      {sources.length === 0 ? (
        <p className={styles.sectionHint}>暂无自定义源。</p>
      ) : (
        <div className={styles.sourceList}>
          {sources.map((source) => (
            <div key={source.id} className={styles.sourceItem}>
              <div className={styles.sourceInfo}>
                <span className={styles.sourceName}>{source.name}</span>
                <span className={styles.sourceUrl}>{source.url}</span>
              </div>
              <div className={styles.sourceActions}>
                <button
                  type="button"
                  onClick={() => void handleToggle(source.id, !source.enabled)}
                  className={styles.sourceToggle}
                  title={source.enabled ? '点击禁用' : '点击启用'}
                >
                  {source.enabled ? (
                    <ToggleRight size={18} className={styles.sourceToggleOn} />
                  ) : (
                    <ToggleLeft size={18} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(source.id)}
                  className={styles.sourceDeleteBtn}
                  title="删除"
                  aria-label="删除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
