import { recipe } from '@vanilla-extract/recipes';
import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const filterBar = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
});

export const filterChip = recipe({
  base: {
    borderRadius: '999px',
    border: `1px solid ${vars.color.border}`,
    padding: '4px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'background-color 150ms, color 150ms, border-color 150ms',
  },
  variants: {
    active: {
      true: {
        background: vars.color.surfaceDark,
        borderColor: vars.color.surfaceDark,
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
