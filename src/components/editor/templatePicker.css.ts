import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/tokens.css';

export const trigger = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: '6px 10px',
  fontSize: '14px',
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'background-color 150ms, color 150ms, border-color 150ms',
  ':hover': {
    background: vars.color.canvasDeep,
    color: vars.color.text,
    borderColor: vars.color.borderStrong,
  },
});

export const overlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  background: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
});

export const modal = style({
  width: '100%',
  maxWidth: 720,
  maxHeight: '80vh',
  borderRadius: vars.radius.xl,
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
});

export const modalHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px',
  borderBottom: `1px solid ${vars.color.border}`,
});

export const modalTitle = style({
  margin: 0,
  fontSize: '16px',
  fontWeight: 600,
  color: vars.color.text,
});

export const closeBtn = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  borderRadius: vars.radius.lg,
  border: 'none',
  background: 'transparent',
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'background-color 150ms, color 150ms',
  ':hover': {
    background: vars.color.bgElevated,
    color: vars.color.text,
  },
});

export const saveAsBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: '4px 10px',
  fontSize: '13px',
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'background-color 150ms, color 150ms, border-color 150ms',
  ':hover': {
    background: vars.color.bgElevated,
    color: vars.color.text,
    borderColor: vars.color.borderStrong,
  },
});

export const saveForm = style({
  display: 'flex',
  gap: 8,
  padding: '12px 20px',
  borderBottom: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
});

export const saveInput = style({
  flex: 1,
  padding: '6px 10px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  color: vars.color.text,
  fontSize: '13px',
  outline: 'none',
  ':focus': {
    borderColor: vars.color.accent,
  },
});

export const saveConfirmBtn = style({
  padding: '6px 16px',
  borderRadius: vars.radius.lg,
  border: 'none',
  background: vars.color.accent,
  color: vars.color.surfaceDarkText,
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'opacity 150ms',
  ':hover': {
    opacity: 0.9,
  },
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

export const modalBody = style({
  display: 'flex',
  flex: 1,
  overflow: 'hidden',
});

export const templateList = style({
  width: 220,
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  padding: '12px',
  borderRight: `1px solid ${vars.color.border}`,
  overflowY: 'auto',
});

export const sectionLabel = style({
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: vars.color.textMuted,
  padding: '8px 12px 4px',
});

export const templateCard = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '10px 12px',
    borderRadius: vars.radius.lg,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 150ms',
    ':hover': {
      background: vars.color.bgElevated,
    },
  },
  variants: {
    active: {
      true: {
        background: vars.color.accentSoft,
        ':hover': {
          background: vars.color.accentSoft,
        },
      },
      false: {},
    },
    variant: {
      builtIn: {},
      custom: {
        borderLeft: `2px solid ${vars.color.accent}`,
      },
    },
  },
  defaultVariants: { active: false, variant: 'builtIn' },
});

export const templateIcon = style({
  fontSize: '18px',
  lineHeight: 1,
});

export const templateName = style({
  fontSize: '14px',
  fontWeight: 500,
  color: vars.color.text,
});

export const templateDesc = style({
  fontSize: '12px',
  color: vars.color.textMuted,
  lineHeight: 1.4,
});

export const previewPane = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const previewHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderBottom: `1px solid ${vars.color.border}`,
  fontSize: '14px',
  fontWeight: 500,
  color: vars.color.text,
});

export const iconBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  borderRadius: vars.radius.lg,
  border: 'none',
  background: 'transparent',
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'background-color 150ms, color 150ms',
  ':hover': {
    background: vars.color.bgElevated,
    color: vars.color.text,
  },
});

export const useBtn = style({
  borderRadius: vars.radius.lg,
  border: 'none',
  background: vars.color.accent,
  color: vars.color.surfaceDarkText,
  padding: '6px 14px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'opacity 150ms',
  ':hover': {
    opacity: 0.9,
  },
});

export const previewContent = style({
  flex: 1,
  margin: 0,
  padding: '16px',
  fontSize: '13px',
  lineHeight: 1.6,
  color: vars.color.textMuted,
  fontFamily: 'monospace',
  overflowY: 'auto',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
});
