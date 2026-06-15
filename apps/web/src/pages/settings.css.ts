import { style, styleVariants } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/app/styles/tokens.css';

export const pageWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing['5xl'],
  paddingBottom: '80px',
});

// Section block
export const sectionBlock = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing['3xl'],
});

export const sectionHeading = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.md,
  paddingBottom: vars.spacing.xl,
  borderBottom: `1px solid ${vars.color.borderFaint}`,
});

export const sectionTitle = style({
  margin: 0,
  fontSize: vars.fontSize['2xl'],
  fontWeight: 600,
  letterSpacing: '-0.01em',
  color: vars.color.text,
});

export const sectionDescription = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  color: vars.color.textMuted,
  lineHeight: 1.5,
});

// Floating save button
export const floatingSave = style({
  position: 'fixed',
  bottom: vars.spacing['3xl'],
  right: vars.spacing['3xl'],
  zIndex: 50,
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  borderRadius: vars.radius.full,
  border: 'none',
  background: vars.color.accent,
  padding: `${vars.spacing.lg} ${vars.spacing['3xl']}`,
  fontSize: vars.fontSize.md,
  fontWeight: 600,
  color: vars.color.surfaceDarkText,
  boxShadow: vars.shadow.lg,
  cursor: 'pointer',
  transition: 'transform 200ms, opacity 200ms, filter 150ms',
  ':hover': {
    filter: 'brightness(1.05)',
  },
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  '@media': {
    'screen and (min-width: 640px)': {
      right: vars.spacing['4xl'],
      bottom: vars.spacing['4xl'],
    },
  },
});

export const sectionAnchor = style({
  scrollMarginTop: '112px',
});

export const accordionCard = style({
  overflow: 'hidden',
});

export const platformList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xl,
});

// Save button / action area
export const saveActions = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: vars.spacing.md,
});

export const saveButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  borderRadius: vars.radius.lg,
  border: '1px solid transparent',
  background: vars.color.accent,
  padding: `${vars.spacing['md-lg']} ${vars.spacing['2xl']}`,
  fontSize: vars.fontSize.md,
  fontWeight: 500,
  color: vars.color.surfaceDarkText,
  transition: 'filter 150ms',
  ':hover': {
    filter: 'brightness(1.05)',
  },
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

export const savedIndicator = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  fontSize: vars.fontSize.md,
  color: vars.color.successText,
});

export const errorIndicator = style({
  maxWidth: '14rem',
  textAlign: 'right',
  fontSize: vars.fontSize.md,
  color: vars.color.errorText,
});

export const noticeIndicator = style({
  maxWidth: '18rem',
  textAlign: 'right',
  fontSize: vars.fontSize.md,
  lineHeight: 1.5,
  color: vars.color.textMuted,
});

// Accordion trigger row
export const accordionTrigger = style({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  gap: vars.spacing.xl,
  padding: `${vars.spacing['lg-xl']} ${vars.spacing['2xl']}`,
  border: 'none',
  background: 'transparent',
  textAlign: 'left',
  transition: 'background-color 150ms',
  ':hover': {
    background: vars.color.surface,
  },
  '@media': {
    'screen and (min-width: 640px)': {
      padding: `${vars.spacing['lg-xl']} ${vars.spacing['3xl']}`,
    },
  },
});

export const accordionIcon = style({
  display: 'flex',
  height: '36px',
  width: '36px',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
});

export const accordionBody = style({
  flex: 1,
  minWidth: 0,
});

export const accordionTitle = style({
  margin: 0,
  fontSize: vars.fontSize.base,
  fontWeight: 500,
  color: vars.color.text,
});

export const accordionSummary = style({
  margin: 0,
  marginTop: vars.spacing['2xs'],
  fontSize: vars.fontSize.md,
  color: vars.color.textMuted,
});

export const accordionAccountName = style({
  margin: 0,
  marginTop: '3px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
  color: vars.color.successText,
});

export const accordionMissingFields = style({
  margin: 0,
  marginTop: '3px',
  fontSize: vars.fontSize.sm,
  color: vars.color.warningText,
});

export const accordionToggle = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  gap: vars.spacing.md,
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
});

export const statusBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: vars.radius.full,
  padding: `${vars.spacing.xs} ${vars.spacing.md}`,
  fontSize: vars.fontSize.xs,
  fontWeight: 600,
  whiteSpace: 'nowrap',
});

export const statusBadgeVariants = styleVariants({
  connected: {
    border: `1px solid ${vars.color.successBorder}`,
    background: vars.color.successBg,
    color: vars.color.successText,
  },
  available: {
    border: `1px solid ${vars.color.borderStrong}`,
    background: vars.color.accentSoft,
    color: vars.color.signal,
  },
  'manual-required': {
    border: `1px solid ${vars.color.border}`,
    background: vars.color.bgElevated,
    color: vars.color.textMuted,
  },
});

// Expanded panel
export const accordionPanel = style({
  padding: `${vars.spacing['3xl']} ${vars.spacing['3xl']}`,
  '@media': {
    'screen and (min-width: 640px)': {
      padding: `${vars.spacing['3xl']} ${vars.spacing['4xl']}`,
    },
  },
});

export const connectionPanel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xl,
  marginBottom: vars.spacing['2xl'],
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: vars.spacing.xl,
  '@media': {
    'screen and (min-width: 720px)': {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  },
});

export const connectionBody = style({
  minWidth: 0,
});

export const connectionTitleRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  color: vars.color.text,
});

export const connectionTitle = style({
  margin: 0,
  fontSize: vars.fontSize.md,
  fontWeight: 600,
});

export const connectionText = style({
  margin: 0,
  marginTop: vars.spacing.md,
  fontSize: vars.fontSize.sm,
  lineHeight: 1.65,
  color: vars.color.textMuted,
});

export const connectionMeta = style({
  margin: 0,
  marginTop: vars.spacing.sm,
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
});

export const connectButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.borderStrong}`,
  background: vars.color.surface,
  padding: `${vars.spacing['md-lg']} ${vars.spacing.xl}`,
  fontSize: vars.fontSize.md,
  fontWeight: 600,
  color: vars.color.text,
  transition: 'border-color 150ms, background-color 150ms',
  ':hover': {
    borderColor: vars.color.accent,
    background: vars.color.accentSoft,
  },
});

export const connectionActions = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.spacing.md,
});

export const checkButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  flexShrink: 0,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.borderStrong}`,
  background: vars.color.surface,
  padding: `${vars.spacing.md} ${vars.spacing['lg-xl']}`,
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
  color: vars.color.text,
  transition: 'border-color 150ms, background-color 150ms',
  ':hover': {
    borderColor: vars.color.accent,
    background: vars.color.accentSoft,
  },
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

export const disconnectButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  flexShrink: 0,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: `${vars.spacing.md} ${vars.spacing['lg-xl']}`,
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
  color: vars.color.textMuted,
  transition: 'border-color 150ms, color 150ms',
  ':hover': {
    borderColor: vars.color.errorText,
    color: vars.color.errorText,
  },
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

export const checkResultOk = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: vars.fontSize.xs,
  color: vars.color.successText,
});

export const checkResultFail = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: vars.fontSize.xs,
  color: vars.color.errorText,
});

export const fieldList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing['2xl'],
});

export const fieldWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.sm,
});

export const fieldLabel = style({
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
  color: vars.color.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
});

export const fieldInputWrap = style({
  position: 'relative',
});

export const fieldInput = style({
  width: '100%',
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bg,
  padding: `${vars.spacing['md-lg']} ${vars.spacing.xl}`,
  paddingRight: '48px',
  fontSize: vars.fontSize.md,
  color: vars.color.text,
  outline: 'none',
  transition: 'border-color 150ms, box-shadow 150ms',
  '::placeholder': {
    color: vars.color.textMuted,
  },
  ':focus': {
    borderColor: vars.color.accent,
    boxShadow: `0 0 0 3px ${vars.color.accentSoft}`,
  },
});

export const fieldTextarea = style({
  width: '100%',
  resize: 'none',
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bg,
  padding: `${vars.spacing['md-lg']} ${vars.spacing.xl}`,
  fontSize: vars.fontSize.md,
  color: vars.color.text,
  outline: 'none',
  transition: 'border-color 150ms, box-shadow 150ms',
  '::placeholder': {
    color: vars.color.textMuted,
  },
  ':focus': {
    borderColor: vars.color.accent,
    boxShadow: `0 0 0 3px ${vars.color.accentSoft}`,
  },
});

export const eyeButton = style({
  position: 'absolute',
  right: vars.spacing.lg,
  top: '50%',
  transform: 'translateY(-50%)',
  border: 'none',
  background: 'transparent',
  borderRadius: vars.radius.lg,
  padding: vars.spacing.xs,
  color: vars.color.textMuted,
  transition: 'background-color 150ms, color 150ms',
  ':hover': {
    background: vars.color.bgElevated,
    color: vars.color.text,
  },
});

export const fieldHint = style({
  marginTop: vars.spacing.lg,
  fontSize: vars.fontSize.xs,
  lineHeight: 1.75,
  color: vars.color.textMuted,
});

export const inlineCode = style({
  borderRadius: vars.radius.xs,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bg,
  padding: '1px 4px',
});

// Sidebar group divider
export const sidebarDivider = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  padding: `${vars.spacing.lg} ${vars.spacing.xl}`,
  marginTop: vars.spacing.md,
  fontSize: vars.fontSize.xs,
  fontWeight: 600,
  color: vars.color.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  selectors: {
    '&::after': {
      content: '""',
      flex: 1,
      height: '1px',
      background: vars.color.borderFaint,
    },
  },
});

// Two-step OAuth layout
export const oauthSteps = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0',
});

export const oauthStep = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xl,
  padding: '20px 0',
  borderBottom: `1px solid ${vars.color.borderFaint}`,
  selectors: {
    '&:last-child': {
      borderBottom: 'none',
      paddingBottom: '0',
    },
    '&:first-child': {
      paddingTop: '0',
    },
  },
});

export const oauthStepHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing['md-lg'],
});

export const oauthStepBadge = style({
  display: 'flex',
  height: '22px',
  width: '22px',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.full,
  border: `1px solid ${vars.color.borderStrong}`,
  fontSize: vars.fontSize['2xs'],
  fontWeight: 700,
  color: vars.color.textMuted,
  letterSpacing: '0.02em',
});

export const oauthStepBadgeActive = style({
  display: 'flex',
  height: '22px',
  width: '22px',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.full,
  background: vars.color.accent,
  border: `1px solid ${vars.color.accent}`,
  fontSize: vars.fontSize['2xs'],
  fontWeight: 700,
  color: vars.color.surfaceDarkText,
  letterSpacing: '0.02em',
});

export const oauthStepTitle = style({
  margin: 0,
  fontSize: vars.fontSize.md,
  fontWeight: 600,
  color: vars.color.text,
});

export const oauthStepDesc = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  lineHeight: 1.65,
  color: vars.color.textMuted,
});

export const oauthAuthorizeRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: vars.spacing.lg,
});

export const authorizeButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  borderRadius: vars.radius.lg,
  border: '1px solid transparent',
  background: vars.color.accent,
  padding: `${vars.spacing['md-lg']} ${vars.spacing['2xl']}`,
  fontSize: vars.fontSize.md,
  fontWeight: 600,
  color: vars.color.surfaceDarkText,
  transition: 'filter 150ms',
  ':hover': {
    filter: 'brightness(1.05)',
  },
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

// ── Platform two-column layout ─────────────────────────────────────

export const platformLayout = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing['2xl'],
  '@media': {
    'screen and (min-width: 1024px)': {
      flexDirection: 'row',
      gap: vars.spacing['4xl'],
    },
  },
});

export const platformSidebar = style({
  display: 'none',
  '@media': {
    'screen and (min-width: 1024px)': {
      display: 'flex',
      flexDirection: 'column',
      width: '240px',
      flexShrink: 0,
      gap: vars.spacing.xs,
      paddingTop: vars.spacing.xs,
    },
  },
});

export const platformSidebarItem = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: vars.spacing.lg,
    width: '100%',
    padding: `${vars.spacing['md-lg']} ${vars.spacing.xl}`,
    borderRadius: vars.radius.md,
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background-color 150ms, box-shadow 150ms',
    ':hover': {
      background: vars.color.bgElevated,
    },
  },
  variants: {
    active: {
      true: {
        background: vars.color.accentSoft,
        color: vars.color.accent,
      },
    },
  },
  defaultVariants: { active: false },
});

export const sidebarItemIcon = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  flexShrink: 0,
});

export const sidebarItemBody = style({
  flex: 1,
  minWidth: 0,
});

export const sidebarItemName = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
  color: vars.color.text,
});

export const sidebarItemStatus = style({
  margin: 0,
  marginTop: '2px',
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
});

export const platformDetail = style({
  flex: 1,
  minWidth: 0,
});

export const platformDetailInner = style({
  maxWidth: '580px',
  padding: `${vars.spacing['3xl']} ${vars.spacing['3xl']}`,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing['3xl'],
});

export const platformDetailHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.xl,
  paddingBottom: vars.spacing['2xl'],
  borderBottom: `1px solid ${vars.color.borderFaint}`,
});

// Mobile platform tabs (horizontal, <1024px only)
export const platformMobileTabs = style({
  display: 'inline-flex',
  alignSelf: 'flex-start',
  maxWidth: '100%',
  gap: vars.spacing['2xs'],
  overflowX: 'auto',
  padding: vars.spacing.xs,
  borderRadius: vars.radius.full,
  border: `1px solid ${vars.color.borderFaint}`,
  background: vars.color.glassSurface,
  backdropFilter: 'blur(16px) saturate(180%)',
  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
  '@media': {
    'screen and (min-width: 1024px)': {
      display: 'none',
    },
  },
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});

export const platformMobileTab = recipe({
  base: {
    flexShrink: 0,
    borderRadius: vars.radius.full,
    border: 'none',
    background: 'transparent',
    padding: `${vars.spacing.md} ${vars.spacing.xl}`,
    fontSize: vars.fontSize.sm,
    fontWeight: 500,
    color: vars.color.textMuted,
    cursor: 'pointer',
    transition: 'background-color 150ms, color 150ms',
    ':hover': {
      color: vars.color.text,
      background: vars.color.bgElevated,
    },
  },
  variants: {
    active: {
      true: {
        background: vars.color.accent,
        color: vars.color.surfaceDarkText,
      },
    },
  },
  defaultVariants: { active: false },
});
