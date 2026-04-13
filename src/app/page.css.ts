import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/tokens.css';

export const pageWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

export const editorSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
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
