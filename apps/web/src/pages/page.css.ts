import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/app/styles/tokens.css';

export const pageWrap = style({
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
});

export const editorLayout = style({
  display: 'flex',
  alignItems: 'stretch',
  gap: vars.spacing.lg,
});

export const mainContentArea = style({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xl,
});

export const editorSection = style({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xl,
});

// 发布区：编辑器下方，主稿宽度内居中收窄
export const publishPanel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xl,
  borderRadius: vars.radius.xl,
  background: vars.color.surface,
  padding: vars.spacing.xl,
  '@media': {
    'screen and (min-width: 640px)': {
      padding: vars.spacing['2xl'],
    },
  },
});

export const mobileOnly = style({
  '@media': {
    'screen and (min-width: 1024px)': {
      display: 'none',
    },
  },
});

export const editorCard = recipe({
  base: {
    overflow: 'hidden',
    outline: 'none',
    borderRadius: vars.radius.xl,
    background: vars.color.surface,
  },
  variants: {
    // 预览态去掉卡底色/圆角，让 phone frame 直接浮在页面背景上，消除卡中卡
    preview: {
      true: {
        overflow: 'visible',
        borderRadius: 0,
        background: 'transparent',
      },
    },
  },
});

export const draftLoadError = style({
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.errorBorder}`,
  background: vars.color.errorBg,
  padding: `${vars.spacing.lg} ${vars.spacing['lg-xl']}`,
  fontSize: vars.fontSize.sm,
  color: vars.color.errorText,
});

export const publishBar = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.spacing.lg,
});

export const publishRight = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  gap: vars.spacing.lg,
});

export const resetLink = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.textMuted,
  textDecoration: 'underline',
  transition: `color ${vars.transition.fast}`,
  ':hover': {
    color: vars.color.text,
  },
});

export const tabSwitcher = style({
  display: 'inline-flex',
  alignItems: 'center',
  height: 38,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: '3px',
});

export const tabButton = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.sm,
    height: '100%',
    borderRadius: vars.radius.sm,
    border: 'none',
    padding: `0 ${vars.spacing.lg}`,
    fontSize: vars.fontSize.sm,
    fontWeight: 500,
    cursor: 'pointer',
    transition: `all ${vars.transition.fast}`,
  },
  variants: {
    active: {
      true: {
        background: vars.color.accent,
        color: vars.color.surfaceDarkText,
        boxShadow: vars.shadow.sm,
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

export const headerActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  minWidth: 0,
  flexWrap: 'wrap',
  '@media': {
    'screen and (max-width: 639px)': {
      width: '100%',
      justifyContent: 'flex-start',
      overflowX: 'auto',
      flexWrap: 'nowrap',
      paddingBottom: vars.spacing.xs,
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none',
    },
  },
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});

export const newDraftButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.spacing.sm,
  height: 38,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: `0 ${vars.spacing['md-lg']}`,
  fontSize: vars.fontSize.sm,
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: `all ${vars.transition.fast}`,
  ':hover': {
    background: vars.color.accentSoft,
    color: vars.color.accent,
    borderColor: vars.color.accent,
  },
});

export const newDraftButtonDanger = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.errorBorder}`,
  background: vars.color.errorBg,
  padding: `${vars.spacing.sm} ${vars.spacing['md-lg']}`,
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
  color: vars.color.errorText,
  cursor: 'pointer',
  transition: `all ${vars.transition.fast}`,
});

// 写作台保存按钮：黑底白字主按钮，与设置页主按钮风格一致。
export const saveButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  height: 38,
  flexShrink: 0,
  borderRadius: vars.radius.md,
  border: '1px solid transparent',
  background: vars.color.accent,
  padding: `0 ${vars.spacing.lg}`,
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
  color: vars.color.surfaceDarkText,
  cursor: 'pointer',
  transition: 'filter 150ms',
  ':hover': {
    filter: 'brightness(1.05)',
  },
  ':disabled': {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
});

// More menu (dropdown)
export const moreMenuWrap = style({
  position: 'relative',
  display: 'inline-flex',
});

export const moreMenuBackdrop = style({
  position: 'fixed',
  inset: 0,
  zIndex: 99,
});

export const moreMenu = style({
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: vars.spacing.sm,
  zIndex: 100,
  minWidth: '220px',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing['2xs'],
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: vars.spacing.md,
  boxShadow: vars.shadow.xl,
});

export const moreMenuItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  width: '100%',
  minHeight: '38px',
  borderRadius: vars.radius.md,
  border: 'none',
  background: 'transparent',
  padding: `${vars.spacing.md} ${vars.spacing.lg}`,
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
  color: vars.color.text,
  cursor: 'pointer',
  textAlign: 'left',
  transition: `background ${vars.transition.fast}, color ${vars.transition.fast}`,
  ':hover': {
    background: vars.color.bgElevated,
  },
});

export const moreMenuItemDanger = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  width: '100%',
  minHeight: '38px',
  marginTop: vars.spacing.xs,
  borderRadius: vars.radius.md,
  border: 'none',
  borderTop: `1px solid ${vars.color.borderFaint}`,
  background: 'transparent',
  padding: `${vars.spacing.lg} ${vars.spacing.lg} ${vars.spacing.md}`,
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
  color: vars.color.errorText,
  cursor: 'pointer',
  textAlign: 'left',
  transition: `background ${vars.transition.fast}`,
  ':hover': {
    background: vars.color.errorBg,
  },
});

// Clear confirm modal
export const confirmOverlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: 300,
  background: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: vars.spacing.xl,
});

export const confirmModal = style({
  width: '100%',
  maxWidth: '360px',
  background: vars.color.surface,
  borderRadius: vars.radius.xl,
  padding: vars.spacing['3xl'],
  boxShadow: vars.shadow.xl,
});

export const confirmTitle = style({
  fontSize: vars.fontSize.xl,
  fontWeight: 600,
  color: vars.color.text,
  marginBottom: vars.spacing.md,
});

export const confirmText = style({
  fontSize: vars.fontSize.base,
  color: vars.color.textMuted,
  lineHeight: vars.lineHeight.relaxed,
  marginBottom: vars.spacing['2xl'],
});

export const confirmActions = style({
  display: 'flex',
  gap: vars.spacing['md-lg'],
  justifyContent: 'flex-end',
});

export const confirmCancel = style({
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: `${vars.spacing.md} ${vars.spacing.xl}`,
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
  color: vars.color.text,
  cursor: 'pointer',
  transition: `background ${vars.transition.fast}`,
  ':hover': {
    background: vars.color.bgElevated,
  },
});

export const confirmDanger = style({
  borderRadius: vars.radius.md,
  border: 'none',
  background: vars.color.errorText,
  padding: `${vars.spacing.md} ${vars.spacing.xl}`,
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
  color: '#FFFFFF',
  cursor: 'pointer',
  transition: `opacity ${vars.transition.fast}`,
  ':hover': {
    opacity: 0.9,
  },
});
