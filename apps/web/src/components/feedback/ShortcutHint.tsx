import { formatShortcut } from '@/hooks/useKeyboardShortcuts';
import * as css from './ShortcutHint.css';

type ShortcutDefLike = Parameters<typeof formatShortcut>[0] & { label?: string };

interface ShortcutHintProps {
  shortcut: ShortcutDefLike;
}

export default function ShortcutHint({ shortcut }: ShortcutHintProps) {
  return (
    <span className={css.hint}>
      <kbd className={css.kbd}>{formatShortcut(shortcut)}</kbd>
    </span>
  );
}
