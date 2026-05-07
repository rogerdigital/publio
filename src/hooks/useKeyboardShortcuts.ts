import { useEffect, useCallback, useRef } from 'react';

export interface ShortcutDef {
  key: string;
  mod?: boolean; // Cmd (Mac) / Ctrl (Win)
  shift?: boolean;
  description: string;
  handler: () => void;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: ShortcutDef[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    const mod = e.metaKey || e.ctrlKey;

    for (const s of shortcutsRef.current) {
      if (e.key.toLowerCase() !== s.key.toLowerCase()) continue;
      if (!!s.mod !== mod) continue;
      if (!!s.shift !== e.shiftKey) continue;

      e.preventDefault();
      s.handler();
      return;
    }
  }, [enabled]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export const SHORTCUT_DEFINITIONS: Array<{ key: string; mod?: boolean; shift?: boolean; label: string }> = [
  { key: 's', mod: true, label: '保存草稿' },
  { key: 'Enter', mod: true, label: '发布' },
  { key: 'p', mod: true, label: '切换预览' },
  { key: '/', mod: true, shift: true, label: '快捷键帮助' },
];

export function formatShortcut(def: { key: string; mod?: boolean; shift?: boolean }): string {
  const parts: string[] = [];
  if (def.mod) parts.push('⌘');
  if (def.shift) parts.push('⇧');
  if (def.key === 'Enter') parts.push('↵');
  else if (def.key === '/') parts.push('/');
  else parts.push(def.key.toUpperCase());
  return parts.join('');
}
