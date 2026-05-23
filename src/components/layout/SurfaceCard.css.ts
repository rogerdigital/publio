import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/tokens.css';

export const surfaceCard = recipe({
  base: {
    borderRadius: vars.radius.xl,
    border: `1px solid ${vars.color.glassBorder}`,
    color: vars.color.text,
    background: vars.color.glassSurface,
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    boxShadow: vars.shadow.sm,
  },
  variants: {
    tone: {
      default: {},
      soft: {
        background: vars.color.bgElevated,
      },
      accent: {
        background: vars.color.surfaceDark,
        border: 'none',
        color: vars.color.surfaceDarkText,
      },
      dark: {
        background: vars.color.surfaceDark,
        border: 'none',
        color: vars.color.surfaceDarkText,
      },
    },
  },
  defaultVariants: {
    tone: 'default',
  },
});
