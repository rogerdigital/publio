import { style, keyframes } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

// --- Brand Profile Form ---

export const fieldWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const fieldLabel = style({
  fontSize: '13px',
  fontWeight: 500,
  color: vars.color.text,
});

export const fieldInput = style({
  width: '100%',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '8px 12px',
  fontSize: '13px',
  color: vars.color.text,
  outline: 'none',
  transition: 'border-color 150ms',
  ':focus': {
    borderColor: vars.color.accent,
  },
});

export const saveBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.accent}`,
  background: vars.color.accent,
  padding: '8px 14px',
  fontSize: '13px',
  fontWeight: 500,
  color: '#ffffff',
  cursor: 'pointer',
  transition: 'filter 150ms',
  alignSelf: 'flex-start',
  ':hover': { filter: 'brightness(1.1)' },
  ':disabled': { opacity: 0.5, cursor: 'not-allowed' },
});

export const panel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '16px',
});

export const panelHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  fontWeight: 600,
  color: vars.color.text,
});

export const panelHint = style({
  fontSize: '13px',
  color: vars.color.textMuted,
  lineHeight: 1.5,
  margin: 0,
});

export const recommendBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.accent}`,
  background: vars.color.accent,
  padding: '8px 16px',
  fontSize: '13px',
  fontWeight: 500,
  color: '#ffffff',
  cursor: 'pointer',
  transition: 'filter 150ms',
  alignSelf: 'flex-start',
  ':hover': { filter: 'brightness(1.1)' },
  ':disabled': { opacity: 0.5, cursor: 'not-allowed' },
});

export const loadingRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  color: vars.color.textMuted,
});

const spin = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

export const spinner = style({
  animation: `${spin} 1s linear infinite`,
});

export const errorText = style({
  fontSize: '13px',
  color: vars.color.errorText,
  margin: 0,
});

export const recommendList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const recommendCard = style({
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: '14px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const recommendTitle = style({
  fontSize: '15px',
  fontWeight: 600,
  color: vars.color.text,
});

export const recommendReason = style({
  fontSize: '13px',
  color: vars.color.textMuted,
  lineHeight: 1.5,
  margin: 0,
});

export const recommendAngle = style({
  fontSize: '13px',
  color: vars.color.text,
  lineHeight: 1.5,
  margin: 0,
});

export const recommendMeta = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

export const engagementBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '12px',
  color: vars.color.textMuted,
});

export const relatedCount = style({
  fontSize: '12px',
  color: vars.color.textMuted,
});

export const useTopicBtn = style({
  alignSelf: 'flex-start',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '6px 14px',
  fontSize: '13px',
  color: vars.color.text,
  cursor: 'pointer',
  transition: 'border-color 150ms',
  ':hover': { borderColor: vars.color.accent },
});

export const refreshBtn = style({
  alignSelf: 'center',
  borderRadius: vars.radius.lg,
  border: 'none',
  background: 'transparent',
  padding: '6px 14px',
  fontSize: '13px',
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'color 150ms',
  ':hover': { color: vars.color.text },
});

// --- Style Profile ---

export const textarea = style({
  width: '100%',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '10px 12px',
  fontSize: '13px',
  color: vars.color.text,
  lineHeight: 1.6,
  resize: 'vertical',
  outline: 'none',
  transition: 'border-color 150ms',
  ':focus': { borderColor: vars.color.accent },
});

export const buttonRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const analyzeBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '8px 14px',
  fontSize: '13px',
  fontWeight: 500,
  color: vars.color.text,
  cursor: 'pointer',
  transition: 'border-color 150ms',
  ':hover': { borderColor: vars.color.accent },
  ':disabled': { opacity: 0.5, cursor: 'not-allowed' },
});
