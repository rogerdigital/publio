import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/app/styles/tokens.css';

export const trigger = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  width: '100%',
  minHeight: '38px',
  borderRadius: vars.radius.md,
  border: 'none',
  background: 'transparent',
  padding: `${vars.spacing.md} ${vars.spacing.lg}`,
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
  color: vars.color.text,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background-color 150ms, color 150ms',
  ':hover': {
    background: vars.color.bgElevated,
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
  padding: vars.spacing['3xl'],
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
  padding: `${vars.spacing.xl} ${vars.spacing['2xl']}`,
  borderBottom: `1px solid ${vars.color.border}`,
});

export const modalTitle = style({
  margin: 0,
  fontSize: vars.fontSize.lg,
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
  padding: `${vars.spacing.xs} ${vars.spacing['md-lg']}`,
  fontSize: vars.fontSize.sm,
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
  padding: `${vars.spacing.lg} ${vars.spacing['2xl']}`,
  borderBottom: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
});

export const saveInput = style({
  flex: 1,
  padding: `${vars.spacing.sm} ${vars.spacing['md-lg']}`,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  color: vars.color.text,
  fontSize: vars.fontSize.sm,
  outline: 'none',
  ':focus': {
    borderColor: vars.color.accent,
  },
});

export const saveConfirmBtn = style({
  padding: `${vars.spacing.sm} ${vars.spacing.xl}`,
  borderRadius: vars.radius.lg,
  border: 'none',
  background: vars.color.accent,
  color: vars.color.surfaceDarkText,
  fontSize: vars.fontSize.sm,
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
  gap: vars.spacing.xs,
  padding: vars.spacing.lg,
  borderRight: `1px solid ${vars.color.border}`,
  overflowY: 'auto',
});

export const sectionLabel = style({
  fontSize: vars.fontSize['2xs'],
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: vars.color.textMuted,
  padding: `${vars.spacing.md} ${vars.spacing.lg} ${vars.spacing.xs}`,
});

export const templateCard = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: vars.spacing['2xs'],
    padding: `${vars.spacing['md-lg']} ${vars.spacing.lg}`,
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
  fontSize: vars.fontSize.xl,
  lineHeight: 1,
});

export const templateName = style({
  fontSize: vars.fontSize.md,
  fontWeight: 500,
  color: vars.color.text,
});

export const templateDesc = style({
  fontSize: vars.fontSize.xs,
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
  padding: `${vars.spacing.lg} ${vars.spacing.xl}`,
  borderBottom: `1px solid ${vars.color.border}`,
  fontSize: vars.fontSize.md,
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
  padding: `${vars.spacing.sm} ${vars.spacing['lg-xl']}`,
  fontSize: vars.fontSize.sm,
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
  padding: vars.spacing.xl,
  fontSize: vars.fontSize.sm,
  lineHeight: 1.6,
  color: vars.color.textMuted,
  fontFamily: 'monospace',
  overflowY: 'auto',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
});
