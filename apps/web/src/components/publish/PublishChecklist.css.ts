import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '@/app/styles/tokens.css';

export const checklist = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.lg,
});

export const step = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.md,
});

export const stepHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
});

export const stepNumber = style({
  display: 'flex',
  width: '20px',
  height: '20px',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.full,
  border: `1px solid ${vars.color.borderStrong}`,
  fontSize: vars.fontSize['2xs'],
  fontWeight: 700,
  color: vars.color.textMuted,
});

export const stepTitle = style({
  fontSize: vars.fontSize.xs,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.20em',
  color: vars.color.accent,
});

export const stepContent = style({
  paddingLeft: '28px',
});

export const platformRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.spacing.md,
  padding: `${vars.spacing.sm} 0`,
});

export const platformInfo = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  minWidth: 0,
});

export const platformName = style({
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
  color: vars.color.text,
});

export const platformReason = style({
  fontSize: vars.fontSize['2xs'],
  color: vars.color.textMuted,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const readinessVariants = styleVariants({
  ready: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.full,
    padding: `${vars.spacing['2xs']} ${vars.spacing.md}`,
    fontSize: vars.fontSize['2xs'],
    fontWeight: 500,
    border: `1px solid ${vars.color.successBorder}`,
    background: vars.color.successBg,
    color: vars.color.successText,
  },
  'needs-content': {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.full,
    padding: `${vars.spacing['2xs']} ${vars.spacing.md}`,
    fontSize: vars.fontSize['2xs'],
    fontWeight: 500,
    border: `1px solid ${vars.color.warningBorder}`,
    background: vars.color.warningBg,
    color: vars.color.warningText,
  },
  'needs-review': {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.full,
    padding: `${vars.spacing['2xs']} ${vars.spacing.md}`,
    fontSize: vars.fontSize['2xs'],
    fontWeight: 500,
    border: `1px solid ${vars.color.warningBorder}`,
    background: vars.color.warningBg,
    color: vars.color.warningText,
  },
  'needs-adapt': {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.full,
    padding: `${vars.spacing['2xs']} ${vars.spacing.md}`,
    fontSize: vars.fontSize['2xs'],
    fontWeight: 500,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.accentSoft,
    color: vars.color.signal,
  },
  unconfigured: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.full,
    padding: `${vars.spacing['2xs']} ${vars.spacing.md}`,
    fontSize: vars.fontSize['2xs'],
    fontWeight: 500,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.bgElevated,
    color: vars.color.textMuted,
  },
  publishing: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.full,
    padding: `${vars.spacing['2xs']} ${vars.spacing.md}`,
    fontSize: vars.fontSize['2xs'],
    fontWeight: 500,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.bgElevated,
    color: vars.color.textMuted,
  },
  success: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.full,
    padding: `${vars.spacing['2xs']} ${vars.spacing.md}`,
    fontSize: vars.fontSize['2xs'],
    fontWeight: 500,
    border: `1px solid ${vars.color.successBorder}`,
    background: vars.color.successBg,
    color: vars.color.successText,
  },
  failed: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.full,
    padding: `${vars.spacing['2xs']} ${vars.spacing.md}`,
    fontSize: vars.fontSize['2xs'],
    fontWeight: 500,
    border: `1px solid ${vars.color.errorBorder}`,
    background: vars.color.errorBg,
    color: vars.color.errorText,
  },
});

export const publishAction = style({
  paddingTop: vars.spacing.md,
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.lg,
});

export const failureGuidance = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.sm,
  marginTop: vars.spacing.lg,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.errorBorder}`,
  background: vars.color.errorBg,
  padding: vars.spacing.lg,
});

export const failureItem = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing['2xs'],
});

export const failurePlatform = style({
  fontSize: vars.fontSize.sm,
  fontWeight: 600,
  color: vars.color.errorText,
});

export const failureMessage = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.errorText,
  lineHeight: 1.5,
});

export const resultLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  marginTop: vars.spacing.lg,
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
  color: vars.color.accent,
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline',
  },
});

// --- 第2步平台卡片（合并自 PlatformVariantPanel）---

export const platformCards = style({
  display: 'flex',
  flexDirection: 'column',
});

// 平铺样式：去掉卡片边框/背景/圆角，靠底部分隔线区分条目
export const variantCard = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.md,
  padding: `${vars.spacing.md} 0`,
  borderBottom: `1px solid ${vars.color.borderFaint}`,
  selectors: {
    '&:last-child': {
      borderBottom: 'none',
    },
  },
});

export const cardHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.spacing.md,
  flexWrap: 'wrap',
});

export const cardHeaderLeft = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  flexWrap: 'wrap',
});

export const cardPlatformName = style({
  fontSize: vars.fontSize.sm,
  fontWeight: 600,
  color: vars.color.text,
});

// variant 同步状态徽章（已同步/AI适配/已编辑/已发布 等）
export const variantStatusBadge = styleVariants({
  synced: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.sm,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.surface,
    padding: `${vars.spacing['2xs']} ${vars.spacing.sm}`,
    fontSize: '10px',
    fontWeight: 500,
    color: vars.color.textMuted,
  },
  adapted: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.sm,
    border: `1px solid ${vars.color.accentSoft}`,
    background: vars.color.accentSoft,
    padding: `${vars.spacing['2xs']} ${vars.spacing.sm}`,
    fontSize: '10px',
    fontWeight: 500,
    color: vars.color.signal,
  },
  edited: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.sm,
    border: `1px solid ${vars.color.warningBorder}`,
    background: vars.color.warningBg,
    padding: `${vars.spacing['2xs']} ${vars.spacing.sm}`,
    fontSize: '10px',
    fontWeight: 500,
    color: vars.color.warningText,
  },
  checked: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.sm,
    border: `1px solid ${vars.color.successBorder}`,
    background: vars.color.successBg,
    padding: `${vars.spacing['2xs']} ${vars.spacing.sm}`,
    fontSize: '10px',
    fontWeight: 500,
    color: vars.color.successText,
  },
  published: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.sm,
    border: `1px solid ${vars.color.successBorder}`,
    background: vars.color.successBg,
    padding: `${vars.spacing['2xs']} ${vars.spacing.sm}`,
    fontSize: '10px',
    fontWeight: 500,
    color: vars.color.successText,
  },
  scheduled: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.sm,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.surface,
    padding: `${vars.spacing['2xs']} ${vars.spacing.sm}`,
    fontSize: '10px',
    fontWeight: 500,
    color: vars.color.textMuted,
  },
});

export const cardMeta = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  fontSize: vars.fontSize['2xs'],
  color: vars.color.textMuted,
});

export const metaTag = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '3px',
});

export const titleInput = style({
  width: '100%',
  borderRadius: vars.radius.md,
  border: `1px solid transparent`,
  background: vars.color.glassInput,
  padding: `${vars.spacing['md-lg']} ${vars.spacing.lg}`,
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
  color: vars.color.text,
  outline: 'none',
  transition: 'border-color 150ms',
  ':focus': {
    borderColor: vars.color.glassInputFocus,
  },
});

export const contentArea = style({
  width: '100%',
  minHeight: '80px',
  maxHeight: '200px',
  borderRadius: vars.radius.md,
  border: `1px solid transparent`,
  background: vars.color.glassInput,
  padding: `${vars.spacing['md-lg']} ${vars.spacing.lg}`,
  fontSize: vars.fontSize.xs,
  lineHeight: 1.6,
  color: vars.color.text,
  resize: 'vertical',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 150ms',
  ':focus': {
    borderColor: vars.color.glassInputFocus,
  },
});

export const cardActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  flexWrap: 'wrap',
});

export const actionBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '3px',
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: '3px 7px',
  fontSize: vars.fontSize['2xs'],
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'all 150ms',
  ':hover': {
    borderColor: vars.color.borderStrong,
    color: vars.color.text,
  },
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

export const wordCount = style({
  fontSize: vars.fontSize['2xs'],
  color: vars.color.textMuted,
  marginLeft: 'auto',
});

export const validationList = style({
  margin: 0,
  paddingLeft: vars.spacing['lg-xl'],
  fontSize: vars.fontSize['2xs'],
  lineHeight: 1.6,
  color: vars.color.errorText,
});

export const passedHint = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  fontSize: vars.fontSize['2xs'],
  color: vars.color.successText,
});

export const changeSummary = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.spacing.xs,
  fontSize: vars.fontSize['2xs'],
  lineHeight: 1.5,
  color: vars.color.accent,
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  borderRadius: vars.radius.sm,
  background: `${vars.color.accent}08`,
  border: `1px solid ${vars.color.accent}20`,
});
