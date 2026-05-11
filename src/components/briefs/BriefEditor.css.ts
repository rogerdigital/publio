import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const editorContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
});

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const sectionLabel = style({
  fontSize: '12px',
  fontWeight: '500',
  color: vars.color.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
});

export const textInput = style({
  width: '100%',
  fontSize: '14px',
  padding: '8px 12px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  color: vars.color.text,
  transition: 'border-color 0.15s ease',
  outline: 'none',
  ':focus': {
    borderColor: vars.color.accent,
  },
  '::placeholder': {
    color: vars.color.textMuted,
  },
});

export const textArea = style({
  width: '100%',
  fontSize: '14px',
  padding: '8px 12px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  color: vars.color.text,
  transition: 'border-color 0.15s ease',
  outline: 'none',
  resize: 'vertical',
  minHeight: '60px',
  lineHeight: '1.5',
  ':focus': {
    borderColor: vars.color.accent,
  },
  '::placeholder': {
    color: vars.color.textMuted,
  },
});

export const outlineList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const outlineItem = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '8px',
  padding: '10px 12px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
});

export const outlineItemFields = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  flex: 1,
});

export const outlineItemInput = style({
  width: '100%',
  fontSize: '13px',
  padding: '4px 8px',
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.borderFaint}`,
  background: vars.color.surface,
  color: vars.color.text,
  outline: 'none',
  ':focus': {
    borderColor: vars.color.accent,
  },
});

export const removeBtn = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  borderRadius: vars.radius.sm,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  color: vars.color.textMuted,
  flexShrink: 0,
  transition: 'color 0.15s ease',
  ':hover': {
    color: vars.color.errorText,
  },
});

export const addBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '12px',
  padding: '4px 10px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  cursor: 'pointer',
  color: vars.color.textMuted,
  transition: 'all 0.15s ease',
  alignSelf: 'flex-start',
  ':hover': {
    borderColor: vars.color.borderStrong,
    color: vars.color.text,
  },
});

export const sourceList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
});

export const sourceItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 10px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.borderFaint}`,
  background: vars.color.bgElevated,
  fontSize: '13px',
});

export const sourceTitle = style({
  flex: 1,
  color: vars.color.text,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const sourceLink = style({
  color: vars.color.accent,
  textDecoration: 'none',
  fontSize: '12px',
  flexShrink: 0,
  ':hover': {
    textDecoration: 'underline',
  },
});

export const platformPlanList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const platformPlanItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
});

export const platformBadge = style({
  fontSize: '12px',
  padding: '2px 8px',
  borderRadius: vars.radius.sm,
  background: `${vars.color.accent}10`,
  color: vars.color.accent,
  border: `1px solid ${vars.color.accent}30`,
  fontWeight: '500',
  flexShrink: 0,
});

export const platformPlanFields = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flex: 1,
});

export const platformIntentInput = style({
  flex: 1,
  fontSize: '13px',
  padding: '4px 8px',
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.borderFaint}`,
  background: vars.color.surface,
  color: vars.color.text,
  outline: 'none',
  ':focus': {
    borderColor: vars.color.accent,
  },
});

export const lengthInput = style({
  width: '64px',
  fontSize: '13px',
  padding: '4px 8px',
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.borderFaint}`,
  background: vars.color.surface,
  color: vars.color.text,
  outline: 'none',
  textAlign: 'right',
  ':focus': {
    borderColor: vars.color.accent,
  },
});

export const saveBar = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  paddingTop: '12px',
  borderTop: `1px solid ${vars.color.border}`,
});

export const saveBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '13px',
  padding: '6px 14px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.accent}`,
  background: vars.color.accentSoft,
  color: vars.color.signal,
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  ':hover': {
    background: vars.color.accent,
    color: '#fff',
  },
});

export const errorMsg = style({
  fontSize: '13px',
  color: vars.color.errorText,
  padding: '6px 10px',
  borderRadius: vars.radius.lg,
  background: vars.color.errorBg,
  border: `1px solid ${vars.color.errorBorder}`,
});

export const savedHint = style({
  fontSize: '12px',
  color: vars.color.textMuted,
});

export const aiBar = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  flexWrap: 'wrap',
  paddingTop: '8px',
  borderTop: `1px solid ${vars.color.borderFaint}`,
});

export const aiBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '11px',
  padding: '4px 8px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  cursor: 'pointer',
  color: vars.color.textMuted,
  transition: 'all 0.15s ease',
  ':hover': {
    borderColor: vars.color.accent,
    color: vars.color.accent,
  },
});

export const suggestionBox = style({
  padding: '10px 12px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.accent}40`,
  background: `${vars.color.accent}08`,
  fontSize: '13px',
  lineHeight: '1.6',
  color: vars.color.text,
  whiteSpace: 'pre-wrap',
});

export const suggestionActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginTop: '8px',
});

export const acceptBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '3px',
  fontSize: '12px',
  padding: '4px 10px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.accent}`,
  background: vars.color.accentSoft,
  color: vars.color.accent,
  cursor: 'pointer',
  fontWeight: '500',
  ':hover': {
    background: vars.color.accent,
    color: '#fff',
  },
});

export const dismissSuggBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '3px',
  fontSize: '12px',
  padding: '4px 10px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  color: vars.color.textMuted,
  cursor: 'pointer',
  ':hover': {
    borderColor: vars.color.borderStrong,
    color: vars.color.text,
  },
});
