'use client';

import { useState, useCallback, useRef } from 'react';
import type { WritingAction } from '@/lib/agent/types';

export interface SlashCommand {
  key: string;
  label: string;
  prefix: string;
  suffix?: string;
  placeholder?: string;
  icon: string;
  type: 'format' | 'ai';
  /** AI commands 对应的 action */
  aiAction?: WritingAction;
}

export const FORMAT_COMMANDS: SlashCommand[] = [
  { key: 'heading1', label: '一级标题', prefix: '# ', icon: 'H1', type: 'format' },
  { key: 'heading2', label: '二级标题', prefix: '## ', icon: 'H2', type: 'format' },
  { key: 'heading3', label: '三级标题', prefix: '### ', icon: 'H3', type: 'format' },
  { key: 'bold', label: '粗体', prefix: '**', suffix: '**', placeholder: '粗体文本', icon: 'B', type: 'format' },
  { key: 'italic', label: '斜体', prefix: '*', suffix: '*', placeholder: '斜体文本', icon: 'I', type: 'format' },
  { key: 'link', label: '链接', prefix: '[', suffix: '](url)', placeholder: '链接文本', icon: '🔗', type: 'format' },
  { key: 'image', label: '图片', prefix: '![](', suffix: ')', placeholder: '图片 URL', icon: '🖼', type: 'format' },
  { key: 'code', label: '行内代码', prefix: '`', suffix: '`', placeholder: '代码', icon: '</>', type: 'format' },
  { key: 'quote', label: '引用', prefix: '> ', icon: '❝', type: 'format' },
  { key: 'list', label: '无序列表', prefix: '- ', icon: '•', type: 'format' },
  { key: 'divider', label: '分割线', prefix: '\n---\n', icon: '—', type: 'format' },
];

export const AI_COMMANDS: SlashCommand[] = [
  { key: 'ai-expand', label: 'AI 扩写', prefix: '', icon: '✨', type: 'ai', aiAction: 'expand' },
  { key: 'ai-condense', label: 'AI 缩写', prefix: '', icon: '📐', type: 'ai', aiAction: 'condense' },
  { key: 'ai-rewrite', label: 'AI 改写', prefix: '', icon: '🔄', type: 'ai', aiAction: 'rewrite' },
  { key: 'ai-polish', label: 'AI 润色', prefix: '', icon: '💎', type: 'ai', aiAction: 'polish' },
  { key: 'ai-continue', label: 'AI 续写', prefix: '', icon: '➡️', type: 'ai', aiAction: 'continue' },
];

/** 兼容旧代码的导出 */
export const SLASH_COMMANDS: SlashCommand[] = [...FORMAT_COMMANDS, ...AI_COMMANDS];

interface SlashCommandResult {
  type: 'format';
  newContent: string;
  insertionOffset: number;
}

interface SlashCommandAIResult {
  type: 'ai';
  action: WritingAction;
}

export type SelectCommandResult = SlashCommandResult | SlashCommandAIResult | null;

interface UseSlashCommandsReturn {
  visible: boolean;
  selectedIndex: number;
  filterText: string;
  filteredCommands: SlashCommand[];
  onKeyDown: (e: KeyboardEvent) => boolean;
  onTextChange: (text: string, cursorPos: number) => void;
  selectCommand: (cmd: SlashCommand) => SelectCommandResult;
  hide: () => void;
}

export function useSlashCommands(
  content: string,
  setContent: (val: string) => void,
  options?: { agentEnabled?: boolean },
): UseSlashCommandsReturn {
  const [visible, setVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filterText, setFilterText] = useState('');
  const slashPosRef = useRef(-1);

  const agentEnabled = options?.agentEnabled ?? false;

  // 根据 agentEnabled 过滤可用命令
  const availableCommands = agentEnabled ? SLASH_COMMANDS : FORMAT_COMMANDS;

  const filteredCommands = availableCommands.filter((cmd) =>
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

  const selectCommand = useCallback((cmd: SlashCommand): SelectCommandResult => {
    if (slashPosRef.current < 0) return null;

    // AI 命令：清除斜杠行，触发 agent
    if (cmd.type === 'ai' && cmd.aiAction) {
      const before = content.slice(0, slashPosRef.current);
      const slashLineEnd = content.indexOf('\n', slashPosRef.current);
      const after = slashLineEnd >= 0 ? content.slice(slashLineEnd) : '';
      const newContent = before + after;
      setContent(newContent);
      hide();
      return { type: 'ai', action: cmd.aiAction };
    }

    // 格式命令：插入 prefix/suffix
    const before = content.slice(0, slashPosRef.current);
    const slashLineEnd = content.indexOf('\n', slashPosRef.current);
    const after = slashLineEnd >= 0 ? content.slice(slashLineEnd) : '';

    const placeholder = cmd.placeholder || '';
    const insertion = cmd.prefix + placeholder + (cmd.suffix || '');
    const newContent = before + insertion + after;

    setContent(newContent);
    hide();
    return { type: 'format', newContent, insertionOffset: newContent.length };
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
