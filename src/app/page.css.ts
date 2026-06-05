import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/tokens.css';

export const pageWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
});

export const editorLayout = style({
  display: 'flex',
  alignItems: 'stretch',
  gap: '16px',
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
  gap: '16px',
  '@media': {
    'screen and (min-width: 1024px)': {
      flexDirection: 'row',
      alignItems: 'start',
      gap: '20px',
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

export const rightPanel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
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
  padding: '12px 14px',
  fontSize: vars.fontSize.sm,
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
    gap: '6px',
    borderRadius: vars.radius.sm,
    border: 'none',
    padding: '6px 12px',
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
  gap: '8px',
  minWidth: 0,
  flexWrap: 'wrap',
  '@media': {
    'screen and (max-width: 639px)': {
      width: '100%',
      justifyContent: 'flex-start',
      overflowX: 'auto',
      flexWrap: 'nowrap',
      paddingBottom: '4px',
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
  gap: '6px',
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: '6px 10px',
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
  gap: '6px',
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.errorBorder}`,
  background: vars.color.errorBg,
  padding: '6px 10px',
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
    gap: '6px',
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
        padding: '6px 10px',
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
  right: '16px',
  zIndex: 90,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  borderRadius: vars.radius.xl,
  border: 'none',
  background: vars.color.brand,
  color: '#FFFFFF',
  padding: '12px 20px',
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
  padding: '20px 16px',
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
  marginBottom: '16px',
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
  padding: '16px',
});

export const confirmModal = style({
  width: '100%',
  maxWidth: '360px',
  background: vars.color.surface,
  borderRadius: vars.radius.xl,
  padding: '24px',
  boxShadow: vars.shadow.xl,
});

export const confirmTitle = style({
  fontSize: vars.fontSize.xl,
  fontWeight: 600,
  color: vars.color.text,
  marginBottom: '8px',
});

export const confirmText = style({
  fontSize: vars.fontSize.base,
  color: vars.color.textMuted,
  lineHeight: vars.lineHeight.relaxed,
  marginBottom: '20px',
});

export const confirmActions = style({
  display: 'flex',
  gap: '10px',
  justifyContent: 'flex-end',
});

export const confirmCancel = style({
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: '8px 16px',
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
  padding: '8px 16px',
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
  color: '#FFFFFF',
  cursor: 'pointer',
  transition: `opacity ${vars.transition.fast}`,
  ':hover': {
    opacity: 0.9,
  },
});
