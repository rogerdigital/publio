import { keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/tokens.css';

const shimmer = keyframes({
  '0%': { backgroundPosition: '-200% 0' },
  '100%': { backgroundPosition: '200% 0' },
});

const shimmerGradient = `linear-gradient(90deg, ${vars.color.bgElevated} 25%, ${vars.color.canvasDeep} 50%, ${vars.color.bgElevated} 75%)`;

export const skeleton = recipe({
  base: {
    background: shimmerGradient,
    backgroundSize: '200% 100%',
    animation: `${shimmer} 1.5s ease-in-out infinite`,
    borderRadius: vars.radius.lg,
  },
  variants: {
    shape: {
      text: {
        height: 14,
        width: '100%',
      },
      title: {
        height: 22,
        width: '60%',
      },
      circle: {
        borderRadius: '50%',
        width: 40,
        height: 40,
      },
      rect: {
        width: '100%',
        height: 120,
      },
    },
  },
  defaultVariants: {
    shape: 'text',
  },
});

export const skeletonGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
});
