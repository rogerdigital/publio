'use client';

import { useCallback, useEffect, useState } from 'react';
import { FileText, Pencil, Plus, Trash2, X } from 'lucide-react';
import { CONTENT_TEMPLATES, type ContentTemplate } from '@/lib/templates';
import * as css from './templatePicker.css';

interface TemplatePickerProps {
  onSelect: (template: ContentTemplate) => void;
  currentTitle?: string;
  currentContent?: string;
}

export default function TemplatePicker({
  onSelect,
  currentTitle,
  currentContent,
}: TemplatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [customTemplates, setCustomTemplates] = useState<ContentTemplate[]>([]);
  const [saving, setSaving] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');

  const allTemplates = [...CONTENT_TEMPLATES, ...customTemplates];
  const selected = allTemplates.find((t) => t.id === previewId) ?? null;
  const isSelectedCustom = selected ? selected.id.startsWith('custom-') : false;

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      if (data.ok) {
        setCustomTemplates(data.custom);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      setShowSaveForm(false);
    }
  }, [isOpen, fetchTemplates]);

  function handleSelect(template: ContentTemplate) {
    onSelect(template);
    setIsOpen(false);
    setPreviewId(null);
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCustomTemplates((prev) => prev.filter((t) => t.id !== id));
        if (previewId === id) setPreviewId(null);
      }
    } catch {
      // ignore
    }
  }

  async function handleSave() {
    if (!saveName.trim() || !currentContent?.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveName.trim(),
          description: saveDescription.trim(),
          icon: '📝',
          title: currentTitle || '',
          content: currentContent,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setCustomTemplates((prev) => [...prev, data]);
        setSaveName('');
        setSaveDescription('');
        setShowSaveForm(false);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={css.trigger}
        onClick={() => setIsOpen(true)}
        title="使用模板"
      >
        <FileText size={14} />
        模板
      </button>

      {isOpen && (
        <div className={css.overlay} onClick={() => setIsOpen(false)}>
          <div className={css.modal} onClick={(e) => e.stopPropagation()}>
            <div className={css.modalHeader}>
              <h3 className={css.modalTitle}>选择模板</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {currentContent && (
                  <button
                    type="button"
                    className={css.saveAsBtn}
                    onClick={() => setShowSaveForm(!showSaveForm)}
                  >
                    <Plus size={14} />
                    保存为模板
                  </button>
                )}
                <button type="button" className={css.closeBtn} onClick={() => setIsOpen(false)}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {showSaveForm && (
              <div className={css.saveForm}>
                <input
                  type="text"
                  className={css.saveInput}
                  placeholder="模板名称"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  autoFocus
                />
                <input
                  type="text"
                  className={css.saveInput}
                  placeholder="描述（可选）"
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                />
                <button
                  type="button"
                  className={css.saveConfirmBtn}
                  onClick={handleSave}
                  disabled={saving || !saveName.trim()}
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            )}

            <div className={css.modalBody}>
              <div className={css.templateList}>
                <div className={css.sectionLabel}>内置模板</div>
                {CONTENT_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={css.templateCard({ active: previewId === t.id })}
                    onClick={() => setPreviewId(t.id)}
                    onDoubleClick={() => handleSelect(t)}
                  >
                    <span className={css.templateIcon}>{t.icon}</span>
                    <span className={css.templateName}>{t.name}</span>
                    <span className={css.templateDesc}>{t.description}</span>
                  </button>
                ))}

                {customTemplates.length > 0 && (
                  <>
                    <div className={css.sectionLabel}>自定义模板</div>
                    {customTemplates.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className={css.templateCard({
                          active: previewId === t.id,
                          variant: 'custom',
                        })}
                        onClick={() => setPreviewId(t.id)}
                        onDoubleClick={() => handleSelect(t)}
                      >
                        <span className={css.templateIcon}>{t.icon}</span>
                        <span className={css.templateName}>{t.name}</span>
                        <span className={css.templateDesc}>{t.description}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>

              {selected && (
                <div className={css.previewPane}>
                  <div className={css.previewHeader}>
                    <span>
                      {selected.icon} {selected.name}
                    </span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {isSelectedCustom && (
                        <>
                          <button
                            type="button"
                            className={css.iconBtn}
                            title="编辑"
                            onClick={() => {
                              /* edit handled by re-save */
                            }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            className={css.iconBtn}
                            title="删除"
                            onClick={() => handleDelete(selected.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className={css.useBtn}
                        onClick={() => handleSelect(selected)}
                      >
                        使用此模板
                      </button>
                    </div>
                  </div>
                  <pre className={css.previewContent}>{selected.content}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
