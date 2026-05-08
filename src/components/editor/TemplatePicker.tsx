'use client';

import { useState } from 'react';
import { FileText, X } from 'lucide-react';
import { CONTENT_TEMPLATES, type ContentTemplate } from '@/lib/templates';
import * as css from './templatePicker.css';

interface TemplatePickerProps {
  onSelect: (template: ContentTemplate) => void;
}

export default function TemplatePicker({ onSelect }: TemplatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const selected = CONTENT_TEMPLATES.find((t) => t.id === previewId) ?? null;

  function handleSelect(template: ContentTemplate) {
    onSelect(template);
    setIsOpen(false);
    setPreviewId(null);
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
              <button type="button" className={css.closeBtn} onClick={() => setIsOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className={css.modalBody}>
              <div className={css.templateList}>
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
              </div>

              {selected && (
                <div className={css.previewPane}>
                  <div className={css.previewHeader}>
                    <span>
                      {selected.icon} {selected.name}
                    </span>
                    <button
                      type="button"
                      className={css.useBtn}
                      onClick={() => handleSelect(selected)}
                    >
                      使用此模板
                    </button>
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
