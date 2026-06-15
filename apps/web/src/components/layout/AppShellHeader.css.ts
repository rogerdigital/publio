import { style } from '@vanilla-extract/css';
import { vars } from '@/app/styles/tokens.css';

export const header = style({
  position: 'sticky',
  top: 0,
  zIndex: 40,
  height: '80px',
  width: 'auto',
  margin: `calc(-1 * ${vars.spacing.xl}) calc(-1 * ${vars.spacing.xl}) ${vars.spacing['2xl']}`,
  padding: `0 ${vars.spacing.xl}`,
  borderBottom: `1px solid ${vars.color.glassBorder}`,
  background: vars.color.glassSurface,
  backdropFilter: 'blur(16px) saturate(180%)',
  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
  '@media': {
    'screen and (min-width: 640px)': {
      margin: `calc(-1 * ${vars.spacing['2xl']}) calc(-1 * ${vars.spacing['3xl']}) ${vars.spacing['2xl']}`,
      padding: `0 ${vars.spacing['3xl']}`,
    },
    'screen and (min-width: 1024px)': {
      margin: '-28px -36px 28px',
      padding: '0 36px',
    },
  },
});

export const inner = style({
  display: 'flex',
  height: '100%',
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

export const kicker = style({
  margin: 0,
  fontSize: vars.fontSize['2xs'],
  fontWeight: 600,
  letterSpacing: vars.tracking.kicker,
  lineHeight: 1.1,
  color: vars.color.textMuted,
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  '@media': {
    'screen and (max-width: 639px)': {
      display: 'none',
    },
  },
});

export const title = style({
  margin: 0,
  marginTop: vars.spacing.xs,
  fontSize: vars.fontSize['2xl'],
  fontWeight: 600,
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
