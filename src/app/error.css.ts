import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const errorPage = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100%',
  padding: `${vars.spacing['5xl']} ${vars.spacing.xl}`,
  '@media': {
    'screen and (min-width: 640px)': {
      padding: `${vars.spacing['5xl']} ${vars.spacing['3xl']}`,
    },
  },
});

export const errorCard = style({
  width: '100%',
  maxWidth: '40rem',
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: vars.spacing['4xl'],
});

export const errorKicker = style({
  fontSize: vars.fontSize.xs,
  textTransform: 'uppercase',
  letterSpacing: '0.28em',
  color: vars.color.accent,
});

export const errorTitle = style({
  marginTop: vars.spacing.xl,
  fontSize: vars.fontSize['3xl'],
  fontWeight: 600,
  color: vars.color.text,
  lineHeight: 1.3,
  '@media': {
    'screen and (min-width: 640px)': {
      fontSize: vars.fontSize['4xl'],
    },
  },
});

export const errorText = style({
  marginTop: vars.spacing.lg,
  fontSize: vars.fontSize.md,
  lineHeight: 1.75,
  color: vars.color.textMuted,
});

export const errorDetail = style({
  marginTop: vars.spacing['2xl'],
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.errorBorder}`,
  background: vars.color.errorBg,
  padding: `${vars.spacing.lg} ${vars.spacing.xl}`,
  fontSize: vars.fontSize.sm,
  lineHeight: 1.6,
  color: vars.color.errorText,
  wordBreak: 'break-word',
  fontFamily: 'var(--font-jetbrains-mono, monospace)',
});

export const actions = style({
  marginTop: vars.spacing['3xl'],
  display: 'flex',
  gap: vars.spacing.lg,
  flexWrap: 'wrap',
});

export const retryButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: vars.radius.lg,
  border: '1px solid transparent',
  background: vars.color.accent,
  padding: `${vars.spacing['md-lg']} ${vars.spacing['2xl']}`,
  fontSize: vars.fontSize.md,
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
  padding: `${vars.spacing['md-lg']} ${vars.spacing['2xl']}`,
  fontSize: vars.fontSize.md,
  fontWeight: 500,
  color: vars.color.text,
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'background 150ms',
  ':hover': {
    background: vars.color.bgElevated,
  },
});
