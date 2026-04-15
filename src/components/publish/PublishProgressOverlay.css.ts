import { style, keyframes } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

const slideUp = keyframes({
  from: { transform: 'translateY(8px)', opacity: 0 },
  to: { transform: 'translateY(0)', opacity: 1 },
});

export const overlay = style({
  position: 'fixed',
  bottom: '24px',
  right: '24px',
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
  padding: '12px 14px',
  borderBottom: `1px solid ${vars.color.border}`,
});

export const headerTitle = style({
  fontSize: '13px',
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
  gap: '2px',
  padding: '8px 14px',
});

export const receiptRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '8px 0',
  borderBottom: `1px solid ${vars.color.border}`,
  selectors: {
    '&:last-child': {
      borderBottom: 'none',
    },
  },
});

export const platformName = style({
  fontSize: '13px',
  color: vars.color.text,
  flex: 1,
  minWidth: 0,
});

export const statusText = style({
  fontSize: '12px',
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
  padding: '10px 14px',
  borderTop: `1px solid ${vars.color.border}`,
  display: 'flex',
  justifyContent: 'flex-end',
});

export const detailLink = style({
  fontSize: '13px',
  color: vars.color.accent,
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  ':hover': {
    textDecoration: 'underline',
  },
});
