import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/tokens.css';

export const pageWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing['2xl'],
});

export const editorLayout = style({
  display: 'flex',
  alignItems: 'stretch',
  gap: vars.spacing.xl,
});

export const panelOuter = style({
  display: 'none',
  flexShrink: 0,
  overflow: 'hidden',
  transition: `width ${vars.transition.base}`,
  '@media': {
    'screen and (min-width: 1024px)': {
      display: 'block',
    },
  },
});

export const mainContentArea = style({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xl,
  '@media': {
    'screen and (min-width: 1024px)': {
      flexDirection: 'row',
      alignItems: 'start',
      gap: vars.spacing['2xl'],
    },
  },
});

export const editorSection = style({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xl,
});

export const rightPanel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.lg,
  '@media': {
    'screen and (min-width: 1024px)': {
      width: '280px',
      flexShrink: 0,
      position: 'sticky',
      top: '28px',
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

export const editorCard = style({
  overflow: 'hidden',
  borderRadius: vars.radius.xl,
  background: vars.color.glassSurface,
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: `1px solid ${vars.color.glassBorder}`,
  boxShadow: vars.shadow.sm,
  outline: 'none',
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
    borderRadius: vars.radius.sm,
    border: 'none',
    padding: `${vars.spacing.sm} ${vars.spacing.lg}`,
    fontSize: vars.fontSize.sm,
    fontWeight: 500,
    cursor: 'pointer',
    transition: `all ${vars.transition.fast}`,
  },
  variants: {
    active: {
      true: {
        background: vars.color.surfaceDark,
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
  gap: vars.spacing.sm,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: `${vars.spacing.sm} ${vars.spacing['md-lg']}`,
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

export const panelToggle = recipe({
  base: {
    display: 'none',
    cursor: 'pointer',
    gap: vars.spacing.sm,
    transition: `all ${vars.transition.fast}`,
    ':hover': {
      background: vars.color.accentSoft,
      color: vars.color.accent,
      borderColor: vars.color.accent,
    },
    '@media': {
      'screen and (min-width: 1024px)': {
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: vars.radius.md,
        border: `1px solid ${vars.color.border}`,
        background: 'transparent',
        color: vars.color.textMuted,
        padding: `${vars.spacing.sm} ${vars.spacing['md-lg']}`,
        fontSize: vars.fontSize.sm,
      },
    },
  },
  variants: {
    active: {
      true: {
        background: vars.color.accentSoft,
        color: vars.color.accent,
        borderColor: vars.color.accent,
        ':hover': {
          background: vars.color.accentSoft,
          color: vars.color.accent,
          borderColor: vars.color.accent,
        },
      },
      false: {},
    },
  },
  defaultVariants: { active: false },
});

export const saveStatusHint = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
  display: 'none',
  '@media': {
    'screen and (min-width: 1024px)': {
      display: 'inline',
    },
  },
});

// Mobile publish FAB
export const mobilePublishFab = style({
  position: 'fixed',
  bottom: 'calc(68px + env(safe-area-inset-bottom))',
  right: vars.spacing.xl,
  zIndex: 90,
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  borderRadius: vars.radius.xl,
  border: 'none',
  background: vars.color.brand,
  color: '#FFFFFF',
  padding: `${vars.spacing.lg} ${vars.spacing['2xl']}`,
  fontSize: vars.fontSize.base,
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: vars.shadow.lg,
  transition: `all ${vars.transition.fast}`,
  ':hover': {
    background: vars.color.brandHover,
    transform: 'translateY(-1px)',
    boxShadow: vars.shadow.xl,
  },
  ':active': {
    transform: 'translateY(0)',
  },
  '@media': {
    'screen and (min-width: 1024px)': {
      display: 'none',
    },
  },
});

// Mobile publish sheet overlay
export const mobileSheetOverlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: 200,
  background: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
});

export const mobileSheet = style({
  width: '100%',
  maxHeight: '80vh',
  overflowY: 'auto',
  background: vars.color.surface,
  borderRadius: `${vars.radius.xl} ${vars.radius.xl} 0 0`,
  padding: `${vars.spacing['2xl']} ${vars.spacing.xl}`,
  paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
});

export const mobileSheetHandle = style({
  width: '36px',
  height: '4px',
  borderRadius: '2px',
  background: vars.color.borderStrong,
  margin: '0 auto 16px',
});

export const mobileSheetTitle = style({
  fontSize: vars.fontSize.lg,
  fontWeight: 600,
  color: vars.color.text,
  marginBottom: vars.spacing.xl,
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
