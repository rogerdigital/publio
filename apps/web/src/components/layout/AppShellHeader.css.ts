import { style } from '@vanilla-extract/css';
import { vars } from '@/app/styles/tokens.css';

export const header = style({
  position: 'sticky',
  top: 0,
  zIndex: 40,
  width: 'auto',
  margin: `calc(-1 * ${vars.spacing.xl}) calc(-1 * ${vars.spacing.xl}) ${vars.spacing.xl}`,
  padding: `${vars.spacing.lg} ${vars.spacing.xl}`,
  borderBottom: `1px solid ${vars.color.borderFaint}`,
  background: vars.color.bg,
  '@media': {
    'screen and (min-width: 640px)': {
      margin: `calc(-1 * ${vars.spacing['2xl']}) calc(-1 * ${vars.spacing['3xl']}) ${vars.spacing.xl}`,
      padding: `${vars.spacing.lg} ${vars.spacing['3xl']}`,
    },
    'screen and (min-width: 1024px)': {
      margin: '-28px -36px 24px',
      padding: '18px 36px',
    },
  },
});

export const inner = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.spacing.xl,
});

export const textBlock = style({
  display: 'flex',
  minWidth: 0,
  maxWidth: '56rem',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center',
});

export const title = style({
  margin: 0,
  fontSize: vars.fontSize['2xl'],
  fontWeight: 600,
  letterSpacing: '-0.01em',
  lineHeight: 1.15,
  color: vars.color.text,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  '@media': {
    'screen and (min-width: 640px)': {
      fontSize: vars.fontSize['3xl'],
    },
  },
});

export const description = style({
  margin: 0,
  marginTop: vars.spacing.xs,
  maxWidth: '48rem',
  fontSize: vars.fontSize.xs,
  lineHeight: 1.35,
  color: vars.color.textMuted,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  '@media': {
    'screen and (max-width: 639px)': {
      display: 'none',
    },
  },
});

export const action = style({
  display: 'flex',
  minWidth: 0,
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'flex-end',
});
