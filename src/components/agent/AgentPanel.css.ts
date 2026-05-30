import { globalStyle, style, keyframes } from '@vanilla-extract/css';
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
  background: vars.color.glassSurface,
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.glassBorder}`,
  boxShadow: vars.shadow.md,
  overflow: 'hidden',
  maxHeight: 'calc(100vh - 140px)',
  position: 'sticky',
  top: '28px',
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
  padding: '14px 16px',
  borderBottom: `1px solid ${vars.color.borderFaint}`,
});

export const panelTitle = style({
  fontSize: vars.fontSize.sm,
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
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  border: 'none',
  background: 'transparent',
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: `all ${vars.transition.fast}`,
  ':hover': {
    background: vars.color.bgElevated,
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
  wordBreak: 'break-word',
});

globalStyle(`${outputArea} p`, { margin: '8px 0' });
globalStyle(`${outputArea} h1`, {
  margin: '16px 0 8px',
  fontWeight: 600,
  lineHeight: 1.4,
  fontSize: '18px',
});
globalStyle(`${outputArea} h2`, {
  margin: '16px 0 8px',
  fontWeight: 600,
  lineHeight: 1.4,
  fontSize: '16px',
});
globalStyle(`${outputArea} h3`, {
  margin: '16px 0 8px',
  fontWeight: 600,
  lineHeight: 1.4,
  fontSize: '15px',
});
globalStyle(`${outputArea} h4`, { margin: '16px 0 8px', fontWeight: 600, lineHeight: 1.4 });
globalStyle(`${outputArea} ul, ${outputArea} ol`, { margin: '8px 0', paddingLeft: '20px' });
globalStyle(`${outputArea} li`, { margin: '4px 0' });
globalStyle(`${outputArea} blockquote`, {
  margin: '8px 0',
  padding: '8px 12px',
  borderLeft: `3px solid ${vars.color.accent}`,
  color: vars.color.textMuted,
});
globalStyle(`${outputArea} pre`, {
  margin: '8px 0',
  padding: '10px 12px',
  borderRadius: vars.radius.md,
  background: vars.color.canvasDeep,
  overflow: 'auto',
  fontSize: '13px',
});
globalStyle(`${outputArea} code`, {
  padding: '1px 4px',
  borderRadius: '4px',
  background: vars.color.canvasDeep,
  fontSize: '0.9em',
});
globalStyle(`${outputArea} pre code`, { padding: 0, background: 'transparent' });
globalStyle(`${outputArea} hr`, {
  margin: '12px 0',
  border: 'none',
  borderTop: `1px solid ${vars.color.border}`,
});
globalStyle(`${outputArea} a`, { color: vars.color.accent, textDecoration: 'none' });
globalStyle(`${outputArea} img`, { maxWidth: '100%', borderRadius: vars.radius.md });
globalStyle(`${outputArea} del`, { opacity: 0.6 });

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
  color: vars.color.surfaceDarkText,
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
