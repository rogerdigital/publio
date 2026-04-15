import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/tokens.css';

export const pageWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

// 最外层 flex 容器：草稿抽屉 + 主内容区
export const editorLayout = style({
  display: 'flex',
  alignItems: 'stretch',
  gap: '16px',
});

// 草稿抽屉外层：控制宽度动画，移动端隐藏
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

// 主内容区域：移动端单列，桌面端双列（编辑区 + 右侧控制面板）
export const mainContentArea = style({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  '@media': {
    'screen and (min-width: 1024px)': {
      flexDirection: 'row',
      alignItems: 'start',
      gap: '20px',
    },
  },
});

// 左侧编辑内容区（撑满剩余宽度）
export const editorSection = style({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

// 右侧固定控制面板（桌面端 sticky，移动端退化为底部区块）
export const rightPanel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  '@media': {
    'screen and (min-width: 1024px)': {
      width: '280px',
      flexShrink: 0,
      position: 'sticky',
      top: '24px',
    },
  },
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

export const newDraftButtonDanger = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.errorBorder}`,
  background: vars.color.errorBg,
  padding: '6px 10px',
  fontSize: '14px',
  fontWeight: 500,
  color: vars.color.errorText,
  cursor: 'pointer',
  transition: 'background-color 150ms, color 150ms, border-color 150ms',
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

// 自动保存状态提示
export const saveStatusHint = style({
  fontSize: '13px',
  color: vars.color.textMuted,
  display: 'none',
  '@media': {
    'screen and (min-width: 1024px)': {
      display: 'inline',
    },
  },
});
