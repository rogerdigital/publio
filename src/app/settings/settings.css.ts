import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const pageWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

export const accordionCard = style({
  overflow: 'hidden',
  padding: 0,
});

export const platformList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

// Save button / action area
export const saveActions = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '8px',
});

export const saveButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
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
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

export const savedIndicator = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '14px',
  color: vars.color.successText,
});

export const errorIndicator = style({
  maxWidth: '14rem',
  textAlign: 'right',
  fontSize: '14px',
  color: vars.color.errorText,
});

export const noticeIndicator = style({
  maxWidth: '18rem',
  textAlign: 'right',
  fontSize: '14px',
  lineHeight: 1.5,
  color: vars.color.textMuted,
});

// Accordion trigger row
export const accordionTrigger = style({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  gap: '16px',
  padding: '14px 20px',
  border: 'none',
  background: 'transparent',
  textAlign: 'left',
  transition: 'background-color 150ms',
  ':hover': {
    background: vars.color.surface,
  },
  '@media': {
    'screen and (min-width: 640px)': {
      padding: '14px 24px',
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
  fontSize: '15px',
  fontWeight: 500,
  color: vars.color.text,
});

export const accordionSummary = style({
  margin: 0,
  marginTop: '2px',
  fontSize: '14px',
  color: vars.color.textMuted,
});

export const accordionAccountName = style({
  margin: 0,
  marginTop: '3px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '13px',
  fontWeight: 500,
  color: vars.color.successText,
});

export const accordionToggle = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  gap: '8px',
  fontSize: '12px',
  color: vars.color.textMuted,
});

export const statusBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: '999px',
  padding: '4px 8px',
  fontSize: '12px',
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
  borderTop: `1px solid ${vars.color.border}`,
  padding: '20px',
  '@media': {
    'screen and (min-width: 640px)': {
      padding: '20px 24px',
    },
  },
});

export const connectionPanel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  marginBottom: '20px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: '16px',
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
  gap: '8px',
  color: vars.color.text,
});

export const connectionTitle = style({
  margin: 0,
  fontSize: '14px',
  fontWeight: 600,
});

export const connectionText = style({
  margin: 0,
  marginTop: '8px',
  fontSize: '13px',
  lineHeight: 1.65,
  color: vars.color.textMuted,
});

export const connectionMeta = style({
  margin: 0,
  marginTop: '6px',
  fontSize: '12px',
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
  padding: '10px 16px',
  fontSize: '14px',
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
  gap: '8px',
});

export const checkButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  flexShrink: 0,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.borderStrong}`,
  background: vars.color.surface,
  padding: '8px 14px',
  fontSize: '13px',
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
  gap: '6px',
  flexShrink: 0,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: '8px 14px',
  fontSize: '13px',
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
  fontSize: '12px',
  color: vars.color.successText,
});

export const checkResultFail = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '12px',
  color: vars.color.errorText,
});

export const fieldList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const fieldWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
});

export const fieldLabel = style({
  fontSize: '14px',
  fontWeight: 500,
  color: vars.color.text,
});

export const fieldInputWrap = style({
  position: 'relative',
});

export const fieldInput = style({
  width: '100%',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '12px 16px',
  paddingRight: '48px',
  fontSize: '14px',
  color: vars.color.text,
  outline: 'none',
  transition: 'border-color 150ms',
  '::placeholder': {
    color: vars.color.textMuted,
  },
  ':focus': {
    borderColor: vars.color.accent,
  },
});

export const fieldTextarea = style({
  width: '100%',
  resize: 'none',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '12px 16px',
  fontSize: '14px',
  color: vars.color.text,
  outline: 'none',
  transition: 'border-color 150ms',
  '::placeholder': {
    color: vars.color.textMuted,
  },
  ':focus': {
    borderColor: vars.color.accent,
  },
});

export const eyeButton = style({
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  border: 'none',
  background: 'transparent',
  borderRadius: vars.radius.lg,
  padding: '4px',
  color: vars.color.textMuted,
  transition: 'background-color 150ms, color 150ms',
  ':hover': {
    background: vars.color.bgElevated,
    color: vars.color.text,
  },
});

export const fieldHint = style({
  marginTop: '16px',
  fontSize: '13px',
  lineHeight: 1.75,
  color: vars.color.textMuted,
});

export const inlineCode = style({
  borderRadius: '4px',
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bg,
  padding: '1px 4px',
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
  gap: '16px',
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
  gap: '10px',
});

export const oauthStepBadge = style({
  display: 'flex',
  height: '22px',
  width: '22px',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '999px',
  border: `1px solid ${vars.color.borderStrong}`,
  fontSize: '11px',
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
  borderRadius: '999px',
  background: vars.color.accent,
  border: `1px solid ${vars.color.accent}`,
  fontSize: '11px',
  fontWeight: 700,
  color: '#ffffff',
  letterSpacing: '0.02em',
});

export const oauthStepTitle = style({
  margin: 0,
  fontSize: '14px',
  fontWeight: 600,
  color: vars.color.text,
});

export const oauthStepDesc = style({
  margin: 0,
  fontSize: '13px',
  lineHeight: 1.65,
  color: vars.color.textMuted,
});

export const oauthAuthorizeRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '12px',
});

export const authorizeButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  borderRadius: vars.radius.lg,
  border: '1px solid transparent',
  background: vars.color.accent,
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#ffffff',
  transition: 'filter 150ms',
  ':hover': {
    filter: 'brightness(1.05)',
  },
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});
