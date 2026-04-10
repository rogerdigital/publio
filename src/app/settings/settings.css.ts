import { style } from '@vanilla-extract/css';
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

// Accordion trigger row
export const accordionTrigger = style({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  gap: '16px',
  padding: '16px 20px',
  textAlign: 'left',
  transition: 'background-color 150ms',
  ':hover': {
    background: vars.color.surface,
  },
  '@media': {
    'screen and (min-width: 640px)': {
      padding: '16px 24px',
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
  fontSize: '15px',
  fontWeight: 500,
  color: vars.color.text,
});

export const accordionSummary = style({
  marginTop: '2px',
  fontSize: '14px',
  color: vars.color.textMuted,
});

export const accordionToggle = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  gap: '8px',
  fontSize: '12px',
  color: vars.color.textMuted,
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
