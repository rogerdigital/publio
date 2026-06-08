import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing['md-lg'],
});

export const variantCard = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.md,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: vars.spacing.lg,
});

export const cardHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.spacing.md,
});

export const platformName = style({
  fontSize: vars.fontSize.sm,
  fontWeight: 600,
  color: vars.color.text,
});

export const statusBadge = styleVariants({
  synced: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.sm,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.surface,
    padding: `${vars.spacing['2xs']} ${vars.spacing.sm}`,
    fontSize: '10px',
    fontWeight: 500,
    color: vars.color.textMuted,
  },
  adapted: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.sm,
    border: `1px solid ${vars.color.accentSoft}`,
    background: vars.color.accentSoft,
    padding: `${vars.spacing['2xs']} ${vars.spacing.sm}`,
    fontSize: '10px',
    fontWeight: 500,
    color: vars.color.signal,
  },
  edited: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.sm,
    border: `1px solid ${vars.color.warningBorder}`,
    background: vars.color.warningBg,
    padding: `${vars.spacing['2xs']} ${vars.spacing.sm}`,
    fontSize: '10px',
    fontWeight: 500,
    color: vars.color.warningText,
  },
  checked: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.sm,
    border: `1px solid ${vars.color.successBorder}`,
    background: vars.color.successBg,
    padding: `${vars.spacing['2xs']} ${vars.spacing.sm}`,
    fontSize: '10px',
    fontWeight: 500,
    color: vars.color.successText,
  },
  published: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.sm,
    border: `1px solid ${vars.color.successBorder}`,
    background: vars.color.successBg,
    padding: `${vars.spacing['2xs']} ${vars.spacing.sm}`,
    fontSize: '10px',
    fontWeight: 500,
    color: vars.color.successText,
  },
  scheduled: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.sm,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.surface,
    padding: `${vars.spacing['2xs']} ${vars.spacing.sm}`,
    fontSize: '10px',
    fontWeight: 500,
    color: vars.color.textMuted,
  },
});

export const cardMeta = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  fontSize: vars.fontSize['2xs'],
  color: vars.color.textMuted,
});

export const metaTag = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '3px',
});

export const titleInput = style({
  width: '100%',
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
  color: vars.color.text,
  outline: 'none',
  transition: 'border-color 150ms',
  ':focus': {
    borderColor: vars.color.accent,
  },
});

export const contentArea = style({
  width: '100%',
  minHeight: '80px',
  maxHeight: '200px',
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  fontSize: vars.fontSize.xs,
  lineHeight: 1.6,
  color: vars.color.text,
  resize: 'vertical',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 150ms',
  ':focus': {
    borderColor: vars.color.accent,
  },
});

export const cardActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  flexWrap: 'wrap',
});

export const actionBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '3px',
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: '3px 7px',
  fontSize: vars.fontSize['2xs'],
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'all 150ms',
  ':hover': {
    borderColor: vars.color.borderStrong,
    color: vars.color.text,
  },
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

export const wordCount = style({
  fontSize: vars.fontSize['2xs'],
  color: vars.color.textMuted,
  marginLeft: 'auto',
});

export const validationList = style({
  margin: 0,
  paddingLeft: vars.spacing['lg-xl'],
  fontSize: vars.fontSize['2xs'],
  lineHeight: 1.6,
  color: vars.color.errorText,
});

export const changeSummary = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.spacing.xs,
  fontSize: vars.fontSize['2xs'],
  lineHeight: 1.5,
  color: vars.color.accent,
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  borderRadius: vars.radius.sm,
  background: `${vars.color.accent}08`,
  border: `1px solid ${vars.color.accent}20`,
});
