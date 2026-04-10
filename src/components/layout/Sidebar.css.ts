import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const sidebar = style({
  width: '100%',
  borderBottom: `1px solid ${vars.color.border}`,
  background: vars.color.bg,
  color: vars.color.text,
  '@media': {
    'screen and (min-width: 1024px)': {
      position: 'sticky',
      top: 0,
      height: '100dvh',
      width: '18rem',
      flexShrink: 0,
      borderBottom: 'none',
      borderRight: `1px solid ${vars.color.border}`,
      overflowY: 'auto',
      overscrollBehavior: 'contain',
    },
  },
});

export const inner = style({
  display: 'flex',
  flexDirection: 'column',
  padding: '16px',
  gap: '4px',
  '@media': {
    'screen and (min-width: 1024px)': {
      minHeight: '100%',
    },
  },
});

export const nav = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
});

export const navItemBase = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  borderRadius: vars.radius.xl,
  padding: '10px 12px',
  textDecoration: 'none',
  transition: 'background-color 150ms',
});

export const navItemVariants = styleVariants({
  active: {
    background: vars.color.surface,
  },
  inactive: {},
});

export const navIndicator = styleVariants({
  active: {
    position: 'absolute',
    left: 0,
    top: '26px',
    height: '20px',
    width: '3px',
    transform: 'translateY(-50%)',
    borderTopRightRadius: '4px',
    borderBottomRightRadius: '4px',
    background: vars.color.accent,
    opacity: 1,
    transition: 'opacity 150ms',
  },
  inactive: {
    position: 'absolute',
    left: 0,
    top: '26px',
    height: '20px',
    width: '3px',
    transform: 'translateY(-50%)',
    borderTopRightRadius: '4px',
    borderBottomRightRadius: '4px',
    background: vars.color.accent,
    opacity: 0,
    transition: 'opacity 150ms',
  },
});

export const navIconBase = style({
  display: 'flex',
  height: '32px',
  width: '32px',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.lg,
  transition: 'background-color 150ms, color 150ms',
});

export const navIconVariants = styleVariants({
  active: {
    background: vars.color.accent,
    color: '#ffffff',
  },
  inactive: {
    background: vars.color.canvasDeep,
    color: vars.color.textMuted,
    ':hover': {
      background: vars.color.accentSoft,
      color: vars.color.accent,
    },
  },
});

export const navText = style({
  minWidth: 0,
  flex: 1,
  paddingTop: '2px',
});

export const navLabelRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
});

export const navLabelVariants = styleVariants({
  active: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 600,
    color: vars.color.text,
    transition: 'color 150ms',
  },
  inactive: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 500,
    color: vars.color.textMuted,
    transition: 'color 150ms',
    ':hover': {
      color: vars.color.text,
    },
  },
});

export const navArrowVariants = styleVariants({
  active: {
    flexShrink: 0,
    color: vars.color.accent,
    transition: 'all 150ms',
  },
  inactive: {
    flexShrink: 0,
    color: 'transparent',
    transform: 'translateX(4px)',
    transition: 'all 150ms',
    ':hover': {
      color: vars.color.textMuted,
      transform: 'translateX(0)',
    },
  },
});

export const navDescription = style({
  margin: 0,
  marginTop: '3px',
  fontSize: '12px',
  lineHeight: 1.6,
  color: vars.color.textMuted,
});

export const brandFooter = style({
  marginTop: 'auto',
  paddingTop: '24px',
  paddingBottom: '16px',
});

export const brandName = style({
  fontSize: '26px',
  lineHeight: 1,
  color: vars.color.accent,
});

export const brandSlogan = style({
  marginTop: '6px',
  fontSize: '11px',
  lineHeight: '16px',
  color: vars.color.textMuted,
});

export const version = style({
  marginTop: '10px',
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.28em',
  textAlign: 'right',
  color: 'rgba(19, 19, 20, 0.32)',
});
