import { recipe } from '@vanilla-extract/recipes';
import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const filterBar = style({
  display: 'flex',
  flexWrap: 'nowrap',
  gap: vars.spacing.sm,
});

export const filterChip = recipe({
  base: {
    borderRadius: vars.radius.full,
    border: `1px solid ${vars.color.border}`,
    padding: `${vars.spacing.xs} ${vars.spacing.lg}`,
    fontSize: vars.fontSize.xs,
    cursor: 'pointer',
    transition: 'background-color 150ms, color 150ms, border-color 150ms',
  },
  variants: {
    active: {
      true: {
        background: vars.color.accent,
        borderColor: vars.color.accent,
        color: vars.color.surfaceDarkText,
        fontWeight: 500,
      },
      false: {
        background: 'transparent',
        color: vars.color.textMuted,
        ':hover': {
          borderColor: vars.color.borderStrong,
          color: vars.color.text,
        },
      },
    },
  },
  defaultVariants: { active: false },
});
