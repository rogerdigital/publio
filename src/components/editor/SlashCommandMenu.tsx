'use client';

import type { SlashCommand } from '@/hooks/useSlashCommands';
import * as styles from './slashCommand.css';

interface SlashCommandMenuProps {
  commands: SlashCommand[];
  selectedIndex: number;
  onSelect: (cmd: SlashCommand) => void;
}

export default function SlashCommandMenu({
  commands,
  selectedIndex,
  onSelect,
}: SlashCommandMenuProps) {
  if (commands.length === 0) {
    return (
      <div className={styles.menuOverlay}>
        <div className={styles.commandItem} style={{ opacity: 0.5 }}>
          无匹配命令
        </div>
      </div>
    );
  }

  return (
    <div className={styles.menuOverlay}>
      {commands.map((cmd, i) => (
        <button
          key={cmd.key}
          className={styles.commandItem}
          data-active={i === selectedIndex}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(cmd);
          }}
        >
          <span className={styles.commandIcon}>{cmd.icon}</span>
          <span className={styles.commandLabel}>{cmd.label}</span>
          <span className={styles.commandHint}>{cmd.prefix.trim()}</span>
        </button>
      ))}
    </div>
  );
}
