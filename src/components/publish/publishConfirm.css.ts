import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/tokens.css';

export const overlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: 10000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0, 0, 0, 0.3)',
});

export const dialog = style({
  background: vars.color.surface,
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  padding: '24px',
  width: '90%',
  maxWidth: 400,
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
});

export const title = style({
  margin: '0 0 20px',
  fontFamily: vars.font.serif,
  fontSize: 20,
  color: vars.color.text,
});

export const section = style({
  marginBottom: 16,
});

export const label = style({
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: vars.color.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 6,
});

export const value = style({
  margin: 0,
  fontSize: 14,
  color: vars.color.text,
  lineHeight: 1.5,
});

export const platformList = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
});

export const platformTag = style({
  borderRadius: 999,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: '3px 10px',
  fontSize: 12,
  color: vars.color.text,
});

export const errorSection = style({
  marginBottom: 16,
  padding: 12,
  borderRadius: vars.radius.lg,
  background: vars.color.errorBg,
  border: `1px solid ${vars.color.errorBorder}`,
});

export const errorItem = style({
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 13,
  color: vars.color.errorText,
  lineHeight: 1.6,
});

export const actions = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 10,
  marginTop: 20,
});

export const cancelBtn = style({
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  background: 'transparent',
  padding: '8px 16px',
  fontSize: 14,
  color: vars.color.textMuted,
  cursor: 'pointer',
  ':hover': {
    borderColor: vars.color.borderStrong,
    color: vars.color.text,
  },
});

export const confirmBtn = recipe({
  base: {
    border: 0,
    borderRadius: vars.radius.lg,
    background: vars.color.accent,
    padding: '8px 16px',
    fontSize: 14,
    fontWeight: 600,
    color: '#ffffff',
    cursor: 'pointer',
    ':hover': {
      background: vars.color.signal,
    },
  },
  variants: {
    disabled: {
      true: {
        cursor: 'not-allowed',
        opacity: 0.5,
        ':hover': {},
      },
    },
  },
  defaultVariants: { disabled: false },
});
