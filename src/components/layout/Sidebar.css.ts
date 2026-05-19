import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

const SIDEBAR_WIDTH_COLLAPSED = '64px';
const SIDEBAR_WIDTH_EXPANDED = '200px';

export const sidebarBase = style({
  display: 'none',
  '@media': {
    'screen and (min-width: 1024px)': {
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100dvh',
      flexShrink: 0,
      background: vars.color.glassSidebar,
      backdropFilter: 'blur(16px) saturate(180%)',
      WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      borderRight: `1px solid ${vars.color.glassBorder}`,
      padding: '20px 0',
      transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
});

export const sidebarVariants = styleVariants({
  collapsed: {
    width: SIDEBAR_WIDTH_COLLAPSED,
    alignItems: 'center',
  },
  expanded: {
    width: SIDEBAR_WIDTH_EXPANDED,
    alignItems: 'stretch',
    padding: '20px 12px',
  },
});

export const brand = style({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '24px',
  justifyContent: 'center',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  selectors: {
    [`${sidebarVariants.expanded} &`]: {
      justifyContent: 'space-between',
      padding: '0 4px',
    },
  },
});

export const brandLeft = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minWidth: 0,
  opacity: 0,
  width: 0,
  overflow: 'hidden',
  transition: 'opacity 150ms',
  selectors: {
    [`${sidebarVariants.expanded} &`]: {
      opacity: 1,
      width: 'auto',
    },
  },
});

export const brandLogo = style({
  width: '28px',
  height: '28px',
  flexShrink: 0,
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const brandName = style({
  fontSize: '20px',
  fontWeight: 700,
  fontFamily: 'var(--font-caveat), cursive',
  color: '#D97757',
  lineHeight: 1,
  opacity: 0,
  width: 0,
  overflow: 'hidden',
  transition: 'opacity 150ms',
  selectors: {
    [`${sidebarVariants.expanded} &`]: {
      opacity: 1,
      width: 'auto',
    },
  },
});

export const searchBox = style({
  display: 'none',
});

export const searchPlaceholder = style({
  display: 'none',
});

export const nav = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  flex: 1,
});

export const navItemBase = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  textDecoration: 'none',
  color: vars.color.textMuted,
  transition: `all ${vars.transition.fast}`,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  alignSelf: 'center',
  position: 'relative',
  selectors: {
    [`${sidebarVariants.expanded} &`]: {
      width: '100%',
      justifyContent: 'flex-start',
      borderRadius: vars.radius.sm,
      padding: '0 12px',
      alignSelf: 'stretch',
    },
  },
});

export const navTooltip = style({
  position: 'absolute',
  left: '100%',
  marginLeft: '8px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: vars.color.surfaceDark,
  color: vars.color.surfaceDarkText,
  fontSize: '12px',
  fontWeight: 500,
  padding: '4px 8px',
  borderRadius: '6px',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  opacity: 0,
  transition: 'opacity 80ms',
  selectors: {
    [`${navItemBase}:hover &`]: {
      opacity: 1,
    },
    [`${sidebarVariants.expanded} &`]: {
      display: 'none',
    },
  },
});

export const navItemVariants = styleVariants({
  active: {
    background: vars.color.surfaceDark,
  },
  inactive: {
    background: 'transparent',
    ':hover': {
      background: vars.color.accentSoft,
    },
  },
});

export const navIconBase = style({
  display: 'flex',
  width: '20px',
  height: '20px',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 0,
  transition: 'margin-right 150ms',
  selectors: {
    [`${sidebarVariants.expanded} &`]: {
      marginRight: '10px',
    },
  },
});

export const navIconVariants = styleVariants({
  active: {
    color: vars.color.surfaceDarkText,
  },
  inactive: {
    color: vars.color.textMuted,
  },
});

export const navLabel = style({
  fontSize: '14px',
  lineHeight: 1,
  opacity: 0,
  width: 0,
  overflow: 'hidden',
  transition: 'opacity 150ms, width 150ms',
  selectors: {
    [`${sidebarVariants.expanded} &`]: {
      opacity: 1,
      width: 'auto',
    },
  },
});

export const navLabelVariants = styleVariants({
  active: {
    fontWeight: 500,
    color: vars.color.surfaceDarkText,
  },
  inactive: {
    color: vars.color.textMuted,
  },
});

export const footer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingTop: '12px',
  selectors: {
    [`${sidebarVariants.expanded} &`]: {
      justifyContent: 'flex-start',
      paddingLeft: '12px',
    },
  },
});

export const themeToggleRow = style({
  display: 'flex',
  alignItems: 'center',
});

export const collapseToggle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  color: vars.color.textMuted,
  cursor: 'pointer',
  flexShrink: 0,
  transition: `all ${vars.transition.fast}`,
  ':hover': {
    borderColor: vars.color.borderStrong,
    color: vars.color.text,
  },
});

export const version = style({
  display: 'none',
});

// Mobile tab bar
export const mobileTabBar = style({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  display: 'flex',
  alignItems: 'stretch',
  background: vars.color.glassSurface,
  backdropFilter: 'blur(16px) saturate(180%)',
  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
  borderTop: `1px solid ${vars.color.glassBorder}`,
  paddingBottom: 'env(safe-area-inset-bottom)',
  '@media': {
    'screen and (min-width: 1024px)': {
      display: 'none',
    },
  },
});

export const mobileTabItem = styleVariants({
  active: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    padding: '8px 4px',
    textDecoration: 'none',
    color: vars.color.text,
  },
  inactive: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    padding: '8px 4px',
    textDecoration: 'none',
    color: vars.color.textMuted,
    ':hover': {
      color: vars.color.text,
    },
  },
});

export const mobileTabLabel = styleVariants({
  active: {
    fontSize: '10px',
    fontWeight: 600,
    lineHeight: 1,
  },
  inactive: {
    fontSize: '10px',
    fontWeight: 400,
    lineHeight: 1,
  },
});
