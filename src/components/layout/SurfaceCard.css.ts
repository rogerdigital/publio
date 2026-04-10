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
        background: 'rgba(255, 246, 237, 0.92)',
      },
    },
  },
  defaultVariants: {
    tone: 'default',
  },
});
