'use client';

import { useState, useCallback, useRef } from 'react';

export interface SlashCommand {
  key: string;
  label: string;
  prefix: string;
  suffix?: string;
  placeholder?: string;
  icon: string;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  { key: 'heading1', label: '一级标题', prefix: '# ', icon: 'H1' },
  { key: 'heading2', label: '二级标题', prefix: '## ', icon: 'H2' },
  { key: 'heading3', label: '三级标题', prefix: '### ', icon: 'H3' },
  { key: 'bold', label: '粗体', prefix: '**', suffix: '**', placeholder: '粗体文本', icon: 'B' },
  { key: 'italic', label: '斜体', prefix: '*', suffix: '*', placeholder: '斜体文本', icon: 'I' },
  { key: 'link', label: '链接', prefix: '[', suffix: '](url)', placeholder: '链接文本', icon: '🔗' },
  { key: 'image', label: '图片', prefix: '![](', suffix: ')', placeholder: '图片 URL', icon: '🖼' },
  { key: 'code', label: '行内代码', prefix: '`', suffix: '`', placeholder: '代码', icon: '</>' },
  { key: 'quote', label: '引用', prefix: '> ', icon: '❝' },
  { key: 'list', label: '无序列表', prefix: '- ', icon: '•' },
  { key: 'divider', label: '分割线', prefix: '\n---\n', icon: '—' },
];

interface UseSlashCommandsReturn {
  visible: boolean;
  selectedIndex: number;
  filterText: string;
  filteredCommands: SlashCommand[];
  onKeyDown: (e: KeyboardEvent) => boolean;
  onTextChange: (text: string, cursorPos: number) => void;
  selectCommand: (cmd: SlashCommand) => { newContent: string; insertionOffset: number } | null;
  hide: () => void;
}

export function useSlashCommands(
  content: string,
  setContent: (val: string) => void,
): UseSlashCommandsReturn {
  const [visible, setVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filterText, setFilterText] = useState('');
  const slashPosRef = useRef(-1);

  const filteredCommands = SLASH_COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(filterText.toLowerCase()) ||
    cmd.key.toLowerCase().includes(filterText.toLowerCase()),
  );

  const hide = useCallback(() => {
    setVisible(false);
    setSelectedIndex(0);
    setFilterText('');
    slashPosRef.current = -1;
  }, []);

  const onTextChange = useCallback((text: string, cursorPos: number) => {
    // 使用 cursorPos 作为近似光标位置
    // CodeMirror 不暴露精确位置，MDEditor onChange 传的是 text.length
    // 查找最后一段文本中的 / 命令
    const searchEnd = Math.min(cursorPos, text.length);
    const lineStart = text.lastIndexOf('\n', searchEnd - 1) + 1;
    const lineBeforeCursor = text.slice(lineStart, searchEnd);

    const match = lineBeforeCursor.match(/^\/(.*)$/);
    if (match) {
      slashPosRef.current = lineStart;
      setFilterText(match[1]);
      setSelectedIndex(0);
      setVisible(true);
    } else {
      hide();
    }
  }, [hide]);

  const selectCommand = useCallback((cmd: SlashCommand) => {
    if (slashPosRef.current < 0) return null;

    const before = content.slice(0, slashPosRef.current);
    const slashLineEnd = content.indexOf('\n', slashPosRef.current);
    const after = slashLineEnd >= 0 ? content.slice(slashLineEnd) : '';

    const placeholder = cmd.placeholder || '';
    const insertion = cmd.prefix + placeholder + (cmd.suffix || '');
    const newContent = before + insertion + after;

    setContent(newContent);
    hide();
    return { newContent, insertionOffset: newContent.length };
  }, [content, setContent, hide]);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (!visible) return false;

    if (e.key === 'Escape') {
      hide();
      return true;
    }
    if (e.key === 'ArrowUp') {
      setSelectedIndex((i) => (i > 0 ? i - 1 : filteredCommands.length - 1));
      return true;
    }
    if (e.key === 'ArrowDown') {
      setSelectedIndex((i) => (i < filteredCommands.length - 1 ? i + 1 : 0));
      return true;
    }
    if (e.key === 'Enter') {
      if (filteredCommands[selectedIndex]) {
        selectCommand(filteredCommands[selectedIndex]);
      }
      return true;
    }
    return false;
  }, [visible, filteredCommands, selectedIndex, selectCommand, hide]);

  return {
    visible,
    selectedIndex,
    filterText,
    filteredCommands,
    onKeyDown,
    onTextChange,
    selectCommand,
    hide,
  };
}
