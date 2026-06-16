import { style } from '@vanilla-extract/css';
import { vars } from '@/app/styles/tokens.css';

export const section = style({
  marginLeft: 'auto',
  marginRight: 'auto',
  width: '100%',
  maxWidth: '1520px',
  padding: 0,
});

export const sectionHeader = style({
  marginBottom: vars.spacing['2xl'],
  padding: vars.spacing['2xl'],
  '@media': {
    'screen and (min-width: 640px)': {
      paddingLeft: vars.spacing['3xl'],
      paddingRight: vars.spacing['3xl'],
    },
  },
});

export const sectionHeaderInner = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xl,
  '@media': {
    'screen and (min-width: 1280px)': {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },
  },
});

export const sectionTextBlock = style({
  maxWidth: '48rem',
});

export const eyebrow = style({
  fontSize: vars.fontSize['2xs'],
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.32em',
  color: vars.color.accent,
});

export const sectionTitle = style({
  fontFamily: vars.font.serif,
  marginTop: vars.spacing.lg,
  fontSize: vars.fontSize['4xl'],
  lineHeight: 1.4,
  color: vars.color.text,
  '@media': {
    'screen and (min-width: 640px)': {
      fontSize: '34px',
    },
  },
});

export const sectionDescription = style({
  marginTop: vars.spacing.xl,
  maxWidth: '48rem',
  fontSize: vars.fontSize.md,
  lineHeight: 1.75,
  color: vars.color.textMuted,
});

export const sectionActions = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.spacing.md,
});

export const sectionContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing['3xl'],
});
