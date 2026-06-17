import { style } from '@vanilla-extract/css';
import { vars } from '@/app/styles/tokens.css';

export const header = style({
  flexShrink: 0,
  position: 'relative',
  width: 'auto',
  padding: `${vars.spacing.lg} ${vars.spacing.xl}`,
  background: 'transparent',
  // 底部分割线用 ::after 伪元素，左右内缩到与标题文字内容齐宽
  selectors: {
    '&::after': {
      content: '""',
      position: 'absolute',
      left: vars.spacing.xl,
      right: vars.spacing.xl,
      bottom: 0,
      height: '1px',
      background: vars.color.borderFaint,
    },
  },
  '@media': {
    'screen and (min-width: 640px)': {
      padding: `${vars.spacing.lg} ${vars.spacing['3xl']}`,
      selectors: {
        '&::after': {
          left: vars.spacing['3xl'],
          right: vars.spacing['3xl'],
        },
      },
    },
    'screen and (min-width: 1024px)': {
      padding: '18px 36px',
      selectors: {
        '&::after': {
          left: '36px',
          right: '36px',
        },
      },
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
