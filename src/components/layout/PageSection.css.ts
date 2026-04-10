import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const section = style({
  marginLeft: 'auto',
  marginRight: 'auto',
  width: '100%',
  maxWidth: '1520px',
  padding: 0,
});

export const sectionHeader = style({
  marginBottom: '20px',
  padding: '20px',
  '@media': {
    'screen and (min-width: 640px)': {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },
});

export const sectionHeaderInner = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
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
  fontSize: '11px',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.32em',
  color: vars.color.accent,
});

export const sectionTitle = style({
  fontFamily: vars.font.serif,
  marginTop: '8px',
  fontSize: '28px',
  lineHeight: 1.3,
  color: vars.color.text,
  '@media': {
    'screen and (min-width: 640px)': {
      fontSize: '34px',
    },
  },
});

export const sectionDescription = style({
  marginTop: '12px',
  maxWidth: '48rem',
  fontSize: '14px',
  lineHeight: 1.75,
  color: vars.color.textMuted,
});

export const sectionActions = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
});

export const sectionContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});
