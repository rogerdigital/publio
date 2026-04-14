import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/tokens.css';

export const pageWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

// 双列容器：草稿面板 + 编辑主区
export const editorLayout = style({
  display: 'flex',
  alignItems: 'stretch',
  gap: '16px',
});

// 面板外层：控制宽度动画，移动端隐藏
export const panelOuter = style({
  display: 'none',
  flexShrink: 0,
  overflow: 'hidden',
  transition: 'width 220ms cubic-bezier(0.4, 0, 0.2, 1)',
  '@media': {
    'screen and (min-width: 1024px)': {
      display: 'block',
    },
  },
});

export const editorSection = style({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

// 仅移动端显示（< 1024px）
export const mobileOnly = style({
  '@media': {
    'screen and (min-width: 1024px)': {
      display: 'none',
    },
  },
});

export const editorCard = style({
  overflow: 'hidden',
  borderRadius: vars.radius.xl,
  background: vars.color.surface,
});

export const draftLoadError = style({
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.errorBorder}`,
  background: vars.color.errorBg,
  padding: '12px 14px',
  fontSize: '14px',
  color: vars.color.errorText,
});

export const publishBar = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
});

export const publishRight = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  gap: '12px',
});

export const resetLink = style({
  fontSize: '14px',
  color: vars.color.textMuted,
  textDecoration: 'underline',
  transition: 'color 150ms',
  ':hover': {
    color: vars.color.text,
  },
});

// Tab switcher
export const tabSwitcher = style({
  display: 'inline-flex',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: '2px',
});

export const tabButton = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '6px',
    border: 'none',
    padding: '6px 12px',
    fontSize: '14px',
    transition: 'background-color 150ms, color 150ms',
  },
  variants: {
    active: {
      true: {
        background: vars.color.accent,
        color: '#ffffff',
      },
      false: {
        background: 'transparent',
        color: vars.color.textMuted,
        ':hover': {
          color: vars.color.text,
        },
      },
    },
  },
  defaultVariants: {
    active: false,
  },
});

// Header 右侧操作区（Tab switcher + 面板切换）
export const headerActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const newDraftButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: '6px 10px',
  fontSize: '14px',
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'background-color 150ms, color 150ms, border-color 150ms',
  ':hover': {
    background: vars.color.canvasDeep,
    color: vars.color.text,
    borderColor: vars.color.borderStrong,
  },
});

// 面板切换按钮，仅桌面端显示（带文字标签，避免与复制按钮混淆）
export const panelToggle = recipe({
  base: {
    display: 'none',
    cursor: 'pointer',
    gap: '6px',
    transition: 'background-color 150ms, color 150ms, border-color 150ms',
    ':hover': {
      background: vars.color.canvasDeep,
      color: vars.color.text,
      borderColor: vars.color.borderStrong,
    },
    '@media': {
      'screen and (min-width: 1024px)': {
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: vars.radius.lg,
        border: `1px solid ${vars.color.border}`,
        background: 'transparent',
        color: vars.color.textMuted,
        padding: '6px 10px',
        fontSize: '14px',
      },
    },
  },
  variants: {
    active: {
      true: {
        background: vars.color.accentSoft,
        color: vars.color.accent,
        borderColor: vars.color.accentSoft,
        ':hover': {
          background: vars.color.accentSoft,
          color: vars.color.accent,
          borderColor: vars.color.accentSoft,
        },
      },
      false: {},
    },
  },
  defaultVariants: { active: false },
});
