import { style, keyframes } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

const slideUp = keyframes({
  from: { transform: 'translateY(8px)', opacity: 0 },
  to: { transform: 'translateY(0)', opacity: 1 },
});

export const overlay = style({
  position: 'fixed',
  bottom: vars.spacing['3xl'],
  right: vars.spacing['3xl'],
  width: '320px',
  zIndex: 1000,
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  animation: `${slideUp} 150ms ease-out`,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.spacing.lg} ${vars.spacing['lg-xl']}`,
  borderBottom: `1px solid ${vars.color.border}`,
});

export const headerTitle = style({
  fontSize: vars.fontSize.sm,
  fontWeight: 600,
  color: vars.color.text,
});

export const closeButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  borderRadius: '6px',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  color: vars.color.textMuted,
  transition: 'background-color 150ms, color 150ms',
  ':hover': {
    background: vars.color.canvasDeep,
    color: vars.color.text,
  },
});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing['2xs'],
  padding: `${vars.spacing.md} ${vars.spacing['lg-xl']}`,
});

export const receiptRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing['md-lg'],
  padding: '8px 0',
  borderBottom: `1px solid ${vars.color.border}`,
  selectors: {
    '&:last-child': {
      borderBottom: 'none',
    },
  },
});

export const platformName = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.text,
  flex: 1,
  minWidth: 0,
});

export const statusText = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
  flexShrink: 0,
});

export const statusTextSuccess = style({
  color: vars.color.successText,
});

export const statusTextError = style({
  color: vars.color.errorText,
});

export const footer = style({
  padding: `${vars.spacing['md-lg']} ${vars.spacing['lg-xl']}`,
  borderTop: `1px solid ${vars.color.border}`,
  display: 'flex',
  justifyContent: 'flex-end',
});

export const detailLink = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.accent,
  border: 0,
  background: 'transparent',
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  ':hover': {
    textDecoration: 'underline',
  },
});
