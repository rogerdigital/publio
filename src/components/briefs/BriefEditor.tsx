'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, Save, Sparkles, X } from 'lucide-react';
import type {
  Brief,
  BriefOutlineItem,
  BriefPlatformPlan,
  BriefSourceLink,
} from '@/lib/briefs/types';
import type { AgentStreamEvent } from '@/lib/agent/types';
import type { BriefAction } from '@/lib/agent/prompts/brief';
import BriefOutlineEditor from './BriefOutlineEditor';
import BriefSourceList from './BriefSourceList';
import * as styles from './BriefEditor.css';

const PLATFORM_LABELS: Record<string, string> = {
  wechat: '公众号',
  xiaohongshu: '小红书',
  zhihu: '知乎',
  x: 'X',
};

interface BriefEditorProps {
  briefId: string;
  onSaved?: (brief: Brief) => void;
}

export default function BriefEditor({ briefId, onSaved }: BriefEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState('');

  const [workingTitle, setWorkingTitle] = useState('');
  const [thesis, setThesis] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('');
  const [outline, setOutline] = useState<BriefOutlineItem[]>([]);
  const [sourceLinks, setSourceLinks] = useState<BriefSourceLink[]>([]);
  const [platformPlan, setPlatformPlan] = useState<BriefPlatformPlan[]>([]);

  const [agentEnabled, setAgentEnabled] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    action: BriefAction;
    data: Record<string, unknown>;
    reasoning?: string;
  } | null>(null);
  const [topicId, setTopicId] = useState('');

  useEffect(() => {
    async function loadBrief() {
      try {
        const res = await fetch(`/api/briefs/${briefId}`, { cache: 'no-store' });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || '加载 Brief 失败');
        const b: Brief = json.brief;
        setWorkingTitle(b.workingTitle);
        setThesis(b.thesis);
        setAudience(b.audience);
        setTone(b.tone);
        setOutline(b.outline);
        setSourceLinks(b.sourceLinks);
        setPlatformPlan(b.platformPlan);
        setTopicId(b.topicId);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    }
    loadBrief();
  }, [briefId]);

  useEffect(() => {
    fetch('/api/agent/status')
      .then((r) => r.json())
      .then((d) => setAgentEnabled(d.available === true))
      .catch(() => setAgentEnabled(false));
  }, []);

  const handleSave = useCallback(async () => {
    setError('');
    setSaving(true);
    try {
      const res = await fetch(`/api/briefs/${briefId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workingTitle,
          thesis,
          audience,
          tone,
          outline,
          sourceLinks,
          platformPlan,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || '保存失败');
      setSavedAt(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
      onSaved?.(json.brief);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  }, [briefId, workingTitle, thesis, audience, tone, outline, sourceLinks, platformPlan, onSaved]);

  const handleAiAction = useCallback(
    async (action: BriefAction) => {
      setAiLoading(true);
      setAiSuggestion(null);
      setError('');

      try {
        let topicData: Record<string, unknown> | undefined;
        if (topicId) {
          const topicRes = await fetch(`/api/topics/${topicId}`, { cache: 'no-store' });
          const topicJson = await topicRes.json();
          if (topicJson.ok) {
            topicData = {
              title: topicJson.topic.title,
              angle: topicJson.topic.angle,
              summary: topicJson.topic.summary,
              targetAudience: topicJson.topic.targetAudience,
              tags: topicJson.topic.tags,
              recommendedPlatforms: topicJson.topic.recommendedPlatforms,
            };
          }
        }

        const response = await fetch('/api/agent/brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            topic: topicData || { title: workingTitle || '未命名' },
            currentBrief: {
              workingTitle,
              thesis,
              audience,
              tone,
              outline: outline.map((o) => ({ heading: o.heading, purpose: o.purpose })),
            },
          }),
        });

        if (!response.ok || !response.body) {
          setError('AI 生成失败');
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
              if (event.type === 'delta') accumulated += event.content;
            } catch {
              // skip
            }
          }
        }

        const jsonStart = accumulated.indexOf('{');
        const jsonEnd = accumulated.lastIndexOf('}');
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          const parsed = JSON.parse(accumulated.slice(jsonStart, jsonEnd + 1));
          setAiSuggestion({ action, data: parsed, reasoning: parsed.reasoning });
        } else {
          setError('AI 返回格式异常');
        }
      } catch {
        setError('AI 请求失败');
      } finally {
        setAiLoading(false);
      }
    },
    [topicId, workingTitle, thesis, audience, tone, outline],
  );

  const handleAcceptSuggestion = () => {
    if (!aiSuggestion) return;
    const { action, data } = aiSuggestion;

    if (action === 'generate') {
      if (data.workingTitle) setWorkingTitle(data.workingTitle as string);
      if (data.thesis) setThesis(data.thesis as string);
      if (data.audience) setAudience(data.audience as string);
      if (data.tone) setTone(data.tone as string);
      if (Array.isArray(data.outline)) {
        setOutline(
          (data.outline as Array<{ heading: string; purpose: string }>).map((o) => ({
            heading: o.heading,
            purpose: o.purpose,
            evidenceSignalIds: [],
          })),
        );
      }
      if (Array.isArray(data.sourceLinks)) {
        setSourceLinks(
          (data.sourceLinks as Array<{ title: string; url: string }>).map((sl) => ({
            title: sl.title,
            url: sl.url,
          })),
        );
      }
      if (Array.isArray(data.platformPlan)) {
        setPlatformPlan(
          (
            data.platformPlan as Array<{
              platform: string;
              intent: string;
              estimatedLength: number;
            }>
          ).map((p) => ({
            platform: p.platform as any,
            intent: p.intent,
            estimatedLength: p.estimatedLength || 0,
          })),
        );
      }
    } else if (action === 'rewrite-thesis') {
      if (data.thesis) setThesis(data.thesis as string);
    } else if (action === 'fill-outline') {
      if (Array.isArray(data.outline)) {
        setOutline(
          (data.outline as Array<{ heading: string; purpose: string }>).map((o) => ({
            heading: o.heading,
            purpose: o.purpose,
            evidenceSignalIds: [],
          })),
        );
      }
    } else if (action === 'platform-plan') {
      if (Array.isArray(data.platformPlan)) {
        setPlatformPlan(
          (
            data.platformPlan as Array<{
              platform: string;
              intent: string;
              estimatedLength: number;
            }>
          ).map((p) => ({
            platform: p.platform as any,
            intent: p.intent,
            estimatedLength: p.estimatedLength || 0,
          })),
        );
      }
    }

    setAiSuggestion(null);
  };

  const handlePlatformIntentChange = (index: number, intent: string) => {
    setPlatformPlan((prev) => prev.map((p, i) => (i === index ? { ...p, intent } : p)));
  };

  const handlePlatformLengthChange = (index: number, value: string) => {
    const num = parseInt(value, 10);
    setPlatformPlan((prev) =>
      prev.map((p, i) => (i === index ? { ...p, estimatedLength: isNaN(num) ? 0 : num } : p)),
    );
  };

  const handlePlatformRemove = (index: number) => {
    setPlatformPlan((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return <div className={styles.savedHint}>加载 Brief...</div>;
  }

  return (
    <div className={styles.editorContainer}>
      {error && <div className={styles.errorMsg}>{error}</div>}

      <div className={styles.section}>
        <span className={styles.sectionLabel}>工作标题</span>
        <input
          className={styles.textInput}
          value={workingTitle}
          onChange={(e) => setWorkingTitle(e.target.value)}
          placeholder="文章工作标题"
        />
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>核心观点</span>
        <textarea
          className={styles.textArea}
          value={thesis}
          onChange={(e) => setThesis(e.target.value)}
          placeholder="这篇文章要传达的核心观点是什么？"
        />
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>目标读者</span>
        <input
          className={styles.textInput}
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder="这篇文章写给谁看？"
        />
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>语气</span>
        <input
          className={styles.textInput}
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          placeholder="专业但平易近人 / 犀利 / 轻松有趣..."
        />
      </div>

      <BriefOutlineEditor outline={outline} onChange={setOutline} />

      <BriefSourceList sources={sourceLinks} onChange={setSourceLinks} />

      {platformPlan.length > 0 && (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>渠道计划</span>
          <div className={styles.platformPlanList}>
            {platformPlan.map((plan, index) => (
              <div key={plan.platform} className={styles.platformPlanItem}>
                <span className={styles.platformBadge}>
                  {PLATFORM_LABELS[plan.platform] || plan.platform}
                </span>
                <div className={styles.platformPlanFields}>
                  <input
                    className={styles.platformIntentInput}
                    value={plan.intent}
                    onChange={(e) => handlePlatformIntentChange(index, e.target.value)}
                    placeholder="这个渠道的发布意图"
                  />
                  <input
                    className={styles.lengthInput}
                    type="number"
                    value={plan.estimatedLength || ''}
                    onChange={(e) => handlePlatformLengthChange(index, e.target.value)}
                    placeholder="字数"
                  />
                </div>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => handlePlatformRemove(index)}
                  aria-label="移除渠道"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {agentEnabled && (
        <div className={styles.aiBar}>
          <button
            className={styles.aiBtn}
            onClick={() => void handleAiAction('generate')}
            disabled={aiLoading}
          >
            <Sparkles size={11} /> 生成初稿
          </button>
          <button
            className={styles.aiBtn}
            onClick={() => void handleAiAction('rewrite-thesis')}
            disabled={aiLoading}
          >
            <Sparkles size={11} /> 改写观点
          </button>
          <button
            className={styles.aiBtn}
            onClick={() => void handleAiAction('fill-outline')}
            disabled={aiLoading}
          >
            <Sparkles size={11} /> 补全大纲
          </button>
          <button
            className={styles.aiBtn}
            onClick={() => void handleAiAction('platform-plan')}
            disabled={aiLoading}
          >
            <Sparkles size={11} /> 渠道计划
          </button>
          {aiLoading && <Loader2 size={12} className="animate-spin" />}
        </div>
      )}

      {aiSuggestion && (
        <div className={styles.suggestionBox}>
          <strong>AI 建议</strong>
          {aiSuggestion.reasoning && <span> — {aiSuggestion.reasoning}</span>}
          <pre style={{ fontSize: 12, margin: '6px 0 0', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {JSON.stringify(aiSuggestion.data, null, 2)}
          </pre>
          <div className={styles.suggestionActions}>
            <button className={styles.acceptBtn} onClick={handleAcceptSuggestion}>
              <Check size={11} /> 采纳
            </button>
            <button className={styles.dismissSuggBtn} onClick={() => setAiSuggestion(null)}>
              <X size={11} /> 忽略
            </button>
          </div>
        </div>
      )}

      <div className={styles.saveBar}>
        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          <Save size={14} /> {saving ? '保存中...' : '保存 Brief'}
        </button>
        {savedAt && <span className={styles.savedHint}>已保存于 {savedAt}</span>}
      </div>
    </div>
  );
}
