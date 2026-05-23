import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const errorPage = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100%',
  padding: '40px 16px',
  '@media': {
    'screen and (min-width: 640px)': {
      padding: '40px 24px',
    },
  },
});

export const errorCard = style({
  width: '100%',
  maxWidth: '40rem',
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '32px',
});

export const errorKicker = style({
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.28em',
  color: vars.color.accent,
});

export const errorTitle = style({
  marginTop: '16px',
  fontSize: '24px',
  fontWeight: 600,
  color: vars.color.text,
  lineHeight: 1.3,
  '@media': {
    'screen and (min-width: 640px)': {
      fontSize: '28px',
    },
  },
});

export const errorText = style({
  marginTop: '12px',
  fontSize: '14px',
  lineHeight: 1.75,
  color: vars.color.textMuted,
});

export const errorDetail = style({
  marginTop: '20px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.errorBorder}`,
  background: vars.color.errorBg,
  padding: '12px 16px',
  fontSize: '13px',
  lineHeight: 1.6,
  color: vars.color.errorText,
  wordBreak: 'break-word',
  fontFamily: 'var(--font-jetbrains-mono, monospace)',
});

export const actions = style({
  marginTop: '24px',
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
});

export const retryButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: vars.radius.lg,
  border: '1px solid transparent',
  background: vars.color.accent,
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: 500,
  color: vars.color.surfaceDarkText,
  cursor: 'pointer',
  transition: 'filter 150ms',
  ':hover': {
    filter: 'brightness(1.05)',
  },
});

export const secondaryLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: 500,
  color: vars.color.text,
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'background 150ms',
  ':hover': {
    background: vars.color.bgElevated,
  },
});
