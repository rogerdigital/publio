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
