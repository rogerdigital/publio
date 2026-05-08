'use client';

import { useEffect, useState } from 'react';
import { Save, Users } from 'lucide-react';
import * as styles from './copilot.css';

export default function BrandProfileForm() {
  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState('');
  const [persona, setPersona] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [contentStyle, setContentStyle] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/copilot/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setBrandName(data.profile.brandName);
          setIndustry(data.profile.industry);
          setPersona(data.profile.persona);
          setTargetAudience(data.profile.targetAudience);
          setContentStyle(data.profile.contentStyle);
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/copilot/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName, industry, persona, targetAudience, contentStyle }),
      });
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return null;

  const fields = [
    { label: '品牌名称', value: brandName, set: setBrandName, placeholder: '如：Publio' },
    { label: '行业', value: industry, set: setIndustry, placeholder: '如：内容创作、SaaS、电商' },
    {
      label: '人设/语调',
      value: persona,
      set: setPersona,
      placeholder: '如：专业但不严肃、活泼有趣、权威专家',
    },
    {
      label: '目标受众',
      value: targetAudience,
      set: setTargetAudience,
      placeholder: '如：25-35岁互联网从业者、内容创作者',
    },
    {
      label: '内容风格偏好',
      value: contentStyle,
      set: setContentStyle,
      placeholder: '如：深度分析、轻松科普、案例驱动、数据导向',
    },
  ];

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <Users size={14} />
        <span>品牌画像</span>
      </div>
      <p className={styles.panelHint}>
        配置品牌信息后，AI 选题推荐将根据画像匹配适合的内容方向。
      </p>

      {fields.map((f) => (
        <div key={f.label} className={styles.fieldWrap}>
          <label className={styles.fieldLabel}>{f.label}</label>
          <input
            type="text"
            value={f.value}
            onChange={(e) => f.set(e.target.value)}
            placeholder={f.placeholder}
            className={styles.fieldInput}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving || !brandName.trim()}
        className={styles.saveBtn}
      >
        <Save size={14} />
        {saving ? '保存中...' : '保存画像'}
      </button>
    </div>
  );
}
