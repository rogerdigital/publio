import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/app/styles/tokens.css';

export const overlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: 10000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: vars.spacing.lg,
  background: 'rgba(0, 0, 0, 0.3)',
});

// 调整宽高比：min/max 约束让弹窗接近横向矩形，避免窄而高
export const dialog = style({
  background: vars.color.surface,
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  padding: vars.spacing['xl'],
  width: '100%',
  minWidth: 320,
  maxWidth: 440,
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
});

export const title = style({
  margin: '0 0 12px',
  fontFamily: vars.font.serif,
  fontSize: 18,
  color: vars.color.text,
});

// 一句话引导：即将发布到哪些平台
export const summary = style({
  margin: '0 0 16px',
  fontSize: 13,
  lineHeight: 1.6,
  color: vars.color.textMuted,
});

export const platformListInline = style({});

export const platformInline = style({
  fontWeight: 600,
  color: vars.color.text,
});

// 通过态
export const okRow = style({
  margin: '0 0 16px',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 13,
  color: vars.color.successText,
});

// 校验中
export const infoRow = style({
  margin: '0 0 16px',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 13,
  color: vars.color.textMuted,
});

// 统一的校验问题容器（仅在有 error/warning 时出现）
export const issueList = style({
  margin: '0 0 16px',
  padding: 12,
  borderRadius: vars.radius.lg,
  background: vars.color.bgElevated,
  border: `1px solid ${vars.color.border}`,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
});

export const issueRow = recipe({
  base: {
    margin: 0,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
    fontSize: 13,
    lineHeight: 1.5,
  },
  variants: {
    severity: {
      error: {
        color: vars.color.errorText,
      },
      warning: {
        color: vars.color.warningText,
      },
    },
  },
});

export const actions = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 10,
  marginTop: 4,
});

export const cancelBtn = style({
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  background: 'transparent',
  padding: `${vars.spacing.sm} ${vars.spacing.lg}`,
  fontSize: 13,
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'all 150ms',
  ':hover': {
    borderColor: vars.color.borderStrong,
    color: vars.color.text,
  },
});

export const confirmBtn = recipe({
  base: {
    border: 0,
    borderRadius: vars.radius.md,
    background: vars.color.accent,
    padding: `${vars.spacing.sm} ${vars.spacing.lg}`,
    fontSize: 13,
    fontWeight: 600,
    color: vars.color.surfaceDarkText,
    cursor: 'pointer',
    transition: 'background 150ms',
    ':hover': {
      background: vars.color.signal,
    },
  },
  variants: {
    disabled: {
      true: {
        cursor: 'not-allowed',
        opacity: 0.5,
        ':hover': {},
      },
    },
  },
  defaultVariants: { disabled: false },
});
