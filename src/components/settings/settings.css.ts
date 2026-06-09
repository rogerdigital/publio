import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/tokens.css';

export const sectionGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xl,
  padding: vars.spacing['2xl'],
});

export const sectionHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  fontSize: vars.fontSize.sm,
  fontWeight: 600,
  color: vars.color.text,
});

export const sectionHint = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.textMuted,
  lineHeight: 1.5,
  margin: 0,
});

export const sourceForm = style({
  display: 'flex',
  gap: vars.spacing.md,
  flexWrap: 'wrap',
});

export const sourceInput = style({
  flex: 1,
  minWidth: '140px',
  borderRadius: vars.radius.md,
  border: 'none',
  background: vars.color.glassInput,
  padding: `${vars.spacing['md-lg']} ${vars.spacing['lg-xl']}`,
  fontSize: vars.fontSize.sm,
  color: vars.color.text,
  outline: 'none',
  transition: `border-color ${vars.transition.fast}`,
  ':focus': {
    border: `1px solid ${vars.color.glassInputFocus}`,
  },
});

export const sourceAddBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  borderRadius: vars.radius.md,
  border: 'none',
  background: vars.color.accent,
  padding: `${vars.spacing['md-lg']} ${vars.spacing['lg-xl']}`,
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
  color: vars.color.surfaceDarkText,
  cursor: 'pointer',
  transition: 'filter 150ms',
  ':hover': { filter: 'brightness(1.2)' },
});

export const sourceError = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.errorText,
  margin: 0,
});

export const sourceList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.sm,
});

export const sourceItem = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.spacing.lg,
  padding: `${vars.spacing['md-lg']} ${vars.spacing.lg}`,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  boxShadow: vars.shadow.sm,
  transition: `box-shadow ${vars.transition.fast}`,
  ':hover': {
    boxShadow: vars.shadow.md,
  },
});

export const sourceInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing['2xs'],
  minWidth: 0,
  flex: 1,
});

export const sourceName = style({
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
  color: vars.color.text,
});

export const sourceUrl = style({
  fontSize: vars.fontSize['2xs'],
  color: vars.color.textMuted,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const sourceActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  flexShrink: 0,
});

export const sourceToggle = style({
  background: 'none',
  border: 'none',
  padding: vars.spacing['2xs'],
  cursor: 'pointer',
  color: vars.color.textMuted,
  transition: 'color 150ms',
});

export const sourceToggleOn = style({
  color: vars.color.accent,
});

export const sourceDeleteBtn = style({
  background: 'none',
  border: 'none',
  padding: vars.spacing.xs,
  cursor: 'pointer',
  color: vars.color.textMuted,
  borderRadius: vars.radius.sm,
  transition: 'color 150ms',
  ':hover': { color: vars.color.errorText },
});

// --- Prompt Editor ---

export const promptTargetTabs = style({
  display: 'flex',
  gap: vars.spacing.xs,
  flexWrap: 'wrap',
});

export const promptTab = recipe({
  base: {
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.border}`,
    background: 'transparent',
    padding: `${vars.spacing.sm} ${vars.spacing.lg}`,
    fontSize: vars.fontSize.sm,
    color: vars.color.textMuted,
    cursor: 'pointer',
    transition: `all ${vars.transition.fast}`,
  },
  variants: {
    active: {
      true: {
        borderColor: vars.color.accent,
        background: vars.color.accent,
        color: vars.color.surfaceDarkText,
      },
    },
  },
});

export const promptTextarea = style({
  width: '100%',
  borderRadius: vars.radius.md,
  border: 'none',
  background: vars.color.glassInput,
  padding: `${vars.spacing['md-lg']} ${vars.spacing['lg-xl']}`,
  fontSize: vars.fontSize.sm,
  color: vars.color.text,
  lineHeight: 1.6,
  resize: 'vertical',
  outline: 'none',
  transition: `border-color ${vars.transition.fast}`,
  ':focus': {
    border: `1px solid ${vars.color.glassInputFocus}`,
  },
});

export const promptActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
});
