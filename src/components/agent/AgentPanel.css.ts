import { style, keyframes } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

const blink = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0 },
});

export const panelWrap = style({
  display: 'flex',
  flexDirection: 'column',
  width: '360px',
  flexShrink: 0,
  background: vars.color.surface,
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  overflow: 'hidden',
  maxHeight: 'calc(100vh - 140px)',
  position: 'sticky',
  top: '24px',
  '@media': {
    'screen and (max-width: 1279px)': {
      width: '300px',
    },
  },
});

export const panelHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderBottom: `1px solid ${vars.color.borderFaint}`,
});

export const panelTitle = style({
  fontSize: '13px',
  fontWeight: 600,
  color: vars.color.text,
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

export const panelBadge = style({
  fontSize: '11px',
  fontWeight: 500,
  color: vars.color.accent,
  background: vars.color.accentSoft,
  borderRadius: '4px',
  padding: '1px 6px',
});

export const closeButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  borderRadius: '4px',
  border: 'none',
  background: 'transparent',
  color: vars.color.textMuted,
  cursor: 'pointer',
  ':hover': {
    background: vars.color.canvasDeep,
    color: vars.color.text,
  },
});

export const panelBody = style({
  flex: 1,
  overflow: 'auto',
  padding: '16px',
});

export const outputArea = style({
  fontSize: '14px',
  lineHeight: 1.7,
  color: vars.color.text,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
});

export const cursor = style({
  display: 'inline-block',
  width: '2px',
  height: '1em',
  background: vars.color.accent,
  marginLeft: '1px',
  animation: `${blink} 1s step-end infinite`,
  verticalAlign: 'text-bottom',
});

export const panelActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 16px',
  borderTop: `1px solid ${vars.color.borderFaint}`,
});

export const actionButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  borderRadius: '6px',
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: '6px 10px',
  fontSize: '13px',
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'all 150ms',
  ':hover': {
    background: vars.color.canvasDeep,
    color: vars.color.text,
    borderColor: vars.color.borderStrong,
  },
});

export const actionButtonPrimary = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  borderRadius: '6px',
  border: 'none',
  background: vars.color.accent,
  padding: '6px 12px',
  fontSize: '13px',
  fontWeight: 500,
  color: '#ffffff',
  cursor: 'pointer',
  transition: 'opacity 150ms',
  ':hover': {
    opacity: 0.9,
  },
});

export const errorBox = style({
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.errorBorder}`,
  background: vars.color.errorBg,
  padding: '10px 12px',
  fontSize: '13px',
  color: vars.color.errorText,
});

export const emptyState = style({
  fontSize: '13px',
  color: vars.color.textMuted,
  textAlign: 'center',
  padding: '32px 16px',
});
