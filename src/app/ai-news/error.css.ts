import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const errorPage = style({
  minHeight: '100vh',
  background: vars.color.bg,
  padding: '40px 16px',
  '@media': {
    'screen and (min-width: 640px)': {
      padding: '40px 24px',
    },
    'screen and (min-width: 1024px)': {
      padding: '40px',
    },
  },
});

export const errorCard = style({
  marginLeft: 'auto',
  marginRight: 'auto',
  maxWidth: '48rem',
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
  fontSize: '30px',
  fontWeight: 600,
  color: vars.color.text,
});

export const errorText = style({
  marginTop: '16px',
  fontSize: '14px',
  lineHeight: 1.75,
  color: vars.color.textMuted,
});

export const errorDetail = style({
  marginTop: '24px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.errorBorder}`,
  background: vars.color.errorBg,
  padding: '16px',
  fontSize: '14px',
  lineHeight: 1.75,
  color: vars.color.errorText,
});

export const retryButton = style({
  marginTop: '24px',
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: vars.radius.lg,
  border: '1px solid transparent',
  background: vars.color.accent,
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#ffffff',
  transition: 'filter 150ms',
  ':hover': {
    filter: 'brightness(1.05)',
  },
});
