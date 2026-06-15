import { recipe } from '@vanilla-extract/recipes';
import { vars } from './tokens.css';

/**
 * 统一按钮规范
 *
 * Variants:
 *   - primary: 实心深色背景，白色文字，用于每个区域的主要动作
 *   - secondary: 描边透明背景，用于次级动作
 *   - destructive: 错误色背景/边框，用于删除等破坏性动作
 *   - ghost: 无边框透明，用于最低层级动作
 *
 * Sizes:
 *   - sm: 紧凑按钮（列表内动作、badge 旁按钮）
 *   - md: 默认按钮（表单提交、面板内动作）
 *   - lg: 强调按钮（页面主 CTA、浮动按钮）
 */
export const button = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vars.spacing.sm,
    border: '1px solid transparent',
    fontWeight: 500,
    cursor: 'pointer',
    transition: `all ${vars.transition.fast}`,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    selectors: {
      '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
  },
  variants: {
    variant: {
      primary: {
        background: vars.color.accent,
        color: vars.color.surfaceDarkText,
        ':hover': {
          filter: 'brightness(1.05)',
        },
      },
      secondary: {
        background: 'transparent',
        borderColor: vars.color.border,
        color: vars.color.textMuted,
        ':hover': {
          borderColor: vars.color.borderStrong,
          color: vars.color.text,
        },
      },
      destructive: {
        background: vars.color.errorBg,
        borderColor: vars.color.errorBorder,
        color: vars.color.errorText,
        ':hover': {
          opacity: 0.9,
        },
      },
      ghost: {
        background: 'transparent',
        color: vars.color.textMuted,
        ':hover': {
          background: vars.color.accentSoft,
          color: vars.color.text,
        },
      },
    },
    size: {
      sm: {
        borderRadius: vars.radius.sm,
        padding: `${vars.spacing.xs} ${vars.spacing.lg}`,
        fontSize: vars.fontSize.sm,
      },
      md: {
        borderRadius: vars.radius.md,
        padding: `${vars.spacing.md} ${vars.spacing.xl}`,
        fontSize: vars.fontSize.md,
      },
      lg: {
        borderRadius: vars.radius.lg,
        padding: `${vars.spacing['md-lg']} ${vars.spacing['2xl']}`,
        fontSize: vars.fontSize.md,
        fontWeight: 600,
      },
    },
  },
  defaultVariants: {
    variant: 'secondary',
    size: 'md',
  },
});

/**
 * 统一状态 Badge 规范
 *
 * 语义色覆盖：已连接、缺失、错误、待验证、成功、失败、发布中、默认
 */
export const statusBadge = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.full,
    padding: `${vars.spacing.xs} ${vars.spacing.md}`,
    fontSize: vars.fontSize['2xs'],
    fontWeight: 600,
    whiteSpace: 'nowrap',
    border: '1px solid',
  },
  variants: {
    status: {
      success: {
        borderColor: vars.color.successBorder,
        background: vars.color.successBg,
        color: vars.color.successText,
      },
      error: {
        borderColor: vars.color.errorBorder,
        background: vars.color.errorBg,
        color: vars.color.errorText,
      },
      warning: {
        borderColor: vars.color.warningBorder,
        background: vars.color.warningBg,
        color: vars.color.warningText,
      },
      info: {
        borderColor: vars.color.border,
        background: vars.color.bgElevated,
        color: vars.color.textMuted,
      },
      neutral: {
        borderColor: vars.color.border,
        background: vars.color.surface,
        color: vars.color.textMuted,
      },
      accent: {
        borderColor: vars.color.borderStrong,
        background: vars.color.accentSoft,
        color: vars.color.signal,
      },
    },
  },
  defaultVariants: {
    status: 'neutral',
  },
});
