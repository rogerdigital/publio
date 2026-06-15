import { globalStyle, style, keyframes } from '@vanilla-extract/css';
import { vars } from '@/app/styles/tokens.css';

const blink = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0 },
});

export const drawerOverlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: 200,
  background: 'rgba(0, 0, 0, 0.3)',
  display: 'flex',
  justifyContent: 'flex-end',
  '@media': {
    'screen and (max-width: 767px)': {
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
  },
});

export const panelWrap = style({
  display: 'flex',
  flexDirection: 'column',
  width: '400px',
  maxWidth: '100%',
  height: '100%',
  background: vars.color.surface,
  borderLeft: `1px solid ${vars.color.border}`,
  boxShadow: vars.shadow.xl,
  overflow: 'hidden',
  '@media': {
    'screen and (max-width: 767px)': {
      width: '100%',
      height: '70vh',
      maxHeight: '70vh',
      borderLeft: 'none',
      borderRadius: `${vars.radius.xl} ${vars.radius.xl} 0 0`,
    },
  },
});

export const panelHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.spacing['lg-xl']} ${vars.spacing.xl}`,
  borderBottom: `1px solid ${vars.color.borderFaint}`,
});

export const panelTitle = style({
  fontSize: vars.fontSize.sm,
  fontWeight: 600,
  color: vars.color.text,
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
});

export const panelBadge = style({
  fontSize: vars.fontSize['2xs'],
  fontWeight: 500,
  color: vars.color.accent,
  background: vars.color.accentSoft,
  borderRadius: vars.radius.xs,
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
  padding: vars.spacing.xl,
});

export const outputArea = style({
  fontSize: vars.fontSize.md,
  lineHeight: 1.7,
  color: vars.color.text,
  wordBreak: 'break-word',
});

globalStyle(`${outputArea} p`, { margin: '8px 0' });
globalStyle(`${outputArea} h1`, {
  margin: '16px 0 8px',
  fontWeight: 600,
  lineHeight: 1.4,
  fontSize: vars.fontSize.xl,
});
globalStyle(`${outputArea} h2`, {
  margin: '16px 0 8px',
  fontWeight: 600,
  lineHeight: 1.4,
  fontSize: vars.fontSize.lg,
});
globalStyle(`${outputArea} h3`, {
  margin: '16px 0 8px',
  fontWeight: 600,
  lineHeight: 1.4,
  fontSize: vars.fontSize.base,
});
globalStyle(`${outputArea} h4`, { margin: '16px 0 8px', fontWeight: 600, lineHeight: 1.4 });
globalStyle(`${outputArea} ul, ${outputArea} ol`, { margin: '8px 0', paddingLeft: '20px' });
globalStyle(`${outputArea} li`, { margin: '4px 0' });
globalStyle(`${outputArea} blockquote`, {
  margin: '8px 0',
  padding: `${vars.spacing.md} ${vars.spacing.lg}`,
  borderLeft: `3px solid ${vars.color.accent}`,
  color: vars.color.textMuted,
});
globalStyle(`${outputArea} pre`, {
  margin: '8px 0',
  padding: `${vars.spacing['md-lg']} ${vars.spacing.lg}`,
  borderRadius: vars.radius.md,
  background: vars.color.canvasDeep,
  overflow: 'auto',
  fontSize: vars.fontSize.sm,
});
globalStyle(`${outputArea} code`, {
  padding: '1px 4px',
  borderRadius: vars.radius.xs,
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
  gap: vars.spacing.md,
  padding: `${vars.spacing.lg} ${vars.spacing.xl}`,
  borderTop: `1px solid ${vars.color.borderFaint}`,
});

export const actionButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  borderRadius: '6px',
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: `${vars.spacing.sm} ${vars.spacing['md-lg']}`,
  fontSize: vars.fontSize.sm,
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
  padding: `${vars.spacing.sm} ${vars.spacing.lg}`,
  fontSize: vars.fontSize.sm,
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
  padding: `${vars.spacing['md-lg']} ${vars.spacing.lg}`,
  fontSize: vars.fontSize.sm,
  color: vars.color.errorText,
});

export const emptyState = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.textMuted,
  textAlign: 'center',
  padding: `${vars.spacing['4xl']} ${vars.spacing.xl}`,
});
