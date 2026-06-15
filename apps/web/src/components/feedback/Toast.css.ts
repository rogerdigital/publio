import { keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/app/styles/tokens.css';

const slideIn = keyframes({
  from: { opacity: 0, transform: 'translateX(100%)' },
  to: { opacity: 1, transform: 'translateX(0)' },
});

const slideOut = keyframes({
  from: { opacity: 1, transform: 'translateX(0)' },
  to: { opacity: 0, transform: 'translateX(100%)' },
});

export const toastContainer = style({
  position: 'fixed',
  top: 16,
  right: 16,
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  pointerEvents: 'none',
  '@media': {
    'screen and (max-width: 640px)': {
      top: 12,
      right: 12,
      left: 12,
    },
  },
});

export const toast = recipe({
  base: {
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: `${vars.spacing['md-lg']} ${vars.spacing['lg-xl']}`,
    borderRadius: vars.radius.lg,
    border: '1px solid rgba(255, 255, 255, 0.3)',
    fontSize: 14,
    lineHeight: 1.5,
    boxShadow: vars.shadow.md,
    backdropFilter: 'blur(16px) saturate(180%)',
    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
    animation: `${slideIn} 0.25s ease-out`,
    maxWidth: 380,
    width: '100%',
  },
  variants: {
    type: {
      success: {
        background: vars.color.successBg,
        borderColor: vars.color.successBorder,
        color: vars.color.successText,
      },
      error: {
        background: vars.color.errorBg,
        borderColor: vars.color.errorBorder,
        color: vars.color.errorText,
      },
      warning: {
        background: vars.color.warningBg,
        borderColor: vars.color.warningBorder,
        color: vars.color.warningText,
      },
      info: {
        background: vars.color.bgElevated,
        borderColor: vars.color.border,
        color: vars.color.text,
      },
    },
    exiting: {
      true: {
        animation: `${slideOut} 0.2s ease-in forwards`,
      },
    },
  },
  defaultVariants: {
    type: 'info',
    exiting: false,
  },
});

export const toastIcon = style({
  flexShrink: 0,
  width: 18,
  height: 18,
});

export const toastMessage = style({
  flex: 1,
  minWidth: 0,
});

export const toastClose = style({
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 20,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  padding: 0,
  borderRadius: 4,
  color: 'inherit',
  opacity: 0.6,
  ':hover': { opacity: 1 },
});
