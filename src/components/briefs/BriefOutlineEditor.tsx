'use client';

import { Plus, X } from 'lucide-react';
import type { BriefOutlineItem } from '@/lib/briefs/types';
import * as styles from './BriefEditor.css';

interface BriefOutlineEditorProps {
  outline: BriefOutlineItem[];
  onChange: (outline: BriefOutlineItem[]) => void;
}

export default function BriefOutlineEditor({ outline, onChange }: BriefOutlineEditorProps) {
  const handleAdd = () => {
    onChange([...outline, { heading: '', purpose: '', evidenceSignalIds: [] }]);
  };

  const handleRemove = (index: number) => {
    onChange(outline.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: 'heading' | 'purpose', value: string) => {
    const updated = outline.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    onChange(updated);
  };

  return (
    <div className={styles.section}>
      <span className={styles.sectionLabel}>大纲</span>
      {outline.length > 0 && (
        <div className={styles.outlineList}>
          {outline.map((item, index) => (
            <div key={index} className={styles.outlineItem}>
              <div className={styles.outlineItemFields}>
                <input
                  className={styles.outlineItemInput}
                  placeholder="段落标题"
                  value={item.heading}
                  onChange={(e) => handleChange(index, 'heading', e.target.value)}
                />
                <input
                  className={styles.outlineItemInput}
                  placeholder="用途说明"
                  value={item.purpose}
                  onChange={(e) => handleChange(index, 'purpose', e.target.value)}
                />
              </div>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => handleRemove(index)}
                aria-label="删除大纲项"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      <button type="button" className={styles.addBtn} onClick={handleAdd}>
        <Plus size={12} /> 添加段落
      </button>
    </div>
  );
}
