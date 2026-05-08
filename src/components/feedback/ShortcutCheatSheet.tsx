'use client';

import { useEffect, useState } from 'react';
import { SHORTCUT_DEFINITIONS, formatShortcut } from '@/hooks/useKeyboardShortcuts';
import * as css from './ShortcutCheatSheet.css';

export default function ShortcutCheatSheet() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.shiftKey && e.key === '/') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!open) return null;

  return (
    <div className={css.overlay} onClick={() => setOpen(false)}>
      <div className={css.panel} onClick={(e) => e.stopPropagation()}>
        <h3 className={css.title}>快捷键</h3>
        {SHORTCUT_DEFINITIONS.map((def) => (
          <div key={def.key} className={css.row}>
            <span className={css.label}>{def.label}</span>
            <kbd className={css.kbd}>{formatShortcut(def)}</kbd>
          </div>
        ))}
      </div>
    </div>
  );
}
