import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/tokens.css';

export const surfaceCard = recipe({
  base: {
    borderRadius: vars.radius.xl,
    border: `1px solid ${vars.color.border}`,
    color: vars.color.text,
  },
  variants: {
    tone: {
      default: {
        background: vars.color.surface,
      },
      soft: {
        background: vars.color.bgElevated,
      },
      accent: {
        background: vars.color.accentSoft,
      },
    },
  },
  defaultVariants: {
    tone: 'default',
  },
});
