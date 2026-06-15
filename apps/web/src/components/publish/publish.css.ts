import { style, styleVariants, keyframes, globalStyle } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/app/styles/tokens.css';

const spin = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

export const selectorWrap = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.spacing.md,
});

export const selectorFooter = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: vars.spacing.md,
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
});

export const selectorToggleAll = style({
  background: 'none',
  border: 'none',
  padding: 0,
  fontSize: vars.fontSize.xs,
  color: vars.color.accent,
  cursor: 'pointer',
  transition: 'color 150ms',
  ':hover': {
    color: vars.color.signal,
  },
});

export const platformLabel = recipe({
  base: {
    display: 'inline-flex',
    cursor: 'pointer',
    userSelect: 'none',
    alignItems: 'center',
    gap: vars.spacing.md,
    borderRadius: vars.radius.lg,
    padding: `${vars.spacing.md} ${vars.spacing.lg}`,
    fontSize: vars.fontSize.md,
    transition: 'background-color 150ms, color 150ms',
  },
  variants: {
    checked: {
      true: {
        background: vars.color.accentSoft,
        fontWeight: 500,
        color: vars.color.signal,
      },
      false: {
        background: vars.color.bgElevated,
        color: vars.color.textMuted,
        ':hover': {
          background: vars.color.surface,
          color: vars.color.text,
        },
      },
    },
  },
  defaultVariants: {
    checked: false,
  },
});

export const srOnly = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
});

// PublishButton styles
export const publishButton = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.md,
    borderRadius: vars.radius.lg,
    border: '1px solid transparent',
    padding: `${vars.spacing['md-lg']} ${vars.spacing['2xl']}`,
    fontSize: vars.fontSize.md,
    fontWeight: 500,
    transition: 'filter 150ms, background-color 150ms',
  },
  variants: {
    disabled: {
      true: {
        cursor: 'not-allowed',
        borderColor: vars.color.border,
        background: vars.color.bgElevated,
        color: vars.color.textMuted,
      },
      false: {
        background: vars.color.accent,
        color: vars.color.surfaceDarkText,
        ':hover': {
          filter: 'brightness(1.05)',
        },
      },
    },
  },
  defaultVariants: {
    disabled: false,
  },
});

// PublishStatusPanel styles
export const panel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xl,
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: vars.spacing.xl,
});

export const panelHeader = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.lg,
  '@media': {
    'screen and (min-width: 640px)': {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },
  },
});

export const panelKicker = style({
  fontSize: vars.fontSize['2xs'],
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.32em',
  color: vars.color.accent,
});

export const panelTitle = style({
  marginTop: vars.spacing.xs,
  fontSize: vars.fontSize.xl,
  fontWeight: 600,
  lineHeight: 1.3,
  color: vars.color.text,
});

export const panelStats = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.spacing.md,
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
});

export const statBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: `${vars.spacing.sm} ${vars.spacing.lg}`,
});

export const resultList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.lg,
});

export const resultCardVariants = styleVariants({
  success: {
    display: 'grid',
    gap: vars.spacing.lg,
    borderRadius: vars.radius.xl,
    border: `1px solid ${vars.color.successBorder}`,
    background: vars.color.successBg,
    padding: vars.spacing.xl,
    '@media': {
      'screen and (min-width: 640px)': {
        gridTemplateColumns: 'auto minmax(0, 1fr) auto',
        alignItems: 'center',
      },
    },
  },
  error: {
    display: 'grid',
    gap: vars.spacing.lg,
    borderRadius: vars.radius.xl,
    border: `1px solid ${vars.color.errorBorder}`,
    background: vars.color.errorBg,
    padding: vars.spacing.xl,
    '@media': {
      'screen and (min-width: 640px)': {
        gridTemplateColumns: 'auto minmax(0, 1fr) auto',
        alignItems: 'center',
      },
    },
  },
  publishing: {
    display: 'grid',
    gap: vars.spacing.lg,
    borderRadius: vars.radius.xl,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.bgElevated,
    padding: vars.spacing.xl,
    '@media': {
      'screen and (min-width: 640px)': {
        gridTemplateColumns: 'auto minmax(0, 1fr) auto',
        alignItems: 'center',
      },
    },
  },
});

export const resultPlatformRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.lg,
});

export const platformIconWrap = style({
  display: 'flex',
  height: '40px',
  width: '40px',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
});

export const platformName = style({
  fontSize: vars.fontSize.md,
  fontWeight: 500,
  color: vars.color.text,
});

export const platformSubLabel = style({
  marginTop: vars.spacing.xs,
  fontSize: vars.fontSize['2xs'],
  textTransform: 'uppercase',
  letterSpacing: '0.24em',
  color: vars.color.textMuted,
});

export const resultMessage = style({
  minWidth: 0,
});

export const resultMessageTextVariants = styleVariants({
  success: {
    fontSize: vars.fontSize.md,
    lineHeight: 1.5,
    color: vars.color.successText,
  },
  error: {
    fontSize: vars.fontSize.md,
    lineHeight: 1.5,
    color: vars.color.errorText,
  },
  publishing: {
    fontSize: vars.fontSize.md,
    lineHeight: 1.5,
    color: vars.color.textMuted,
  },
});

export const resultActions = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.spacing.lg,
  '@media': {
    'screen and (min-width: 640px)': {
      justifyContent: 'flex-end',
    },
  },
});

export const statusBadgeVariants = styleVariants({
  success: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.sm,
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.successBorder}`,
    background: vars.color.surface,
    padding: `${vars.spacing.xs} ${vars.spacing['md-lg']}`,
    fontSize: vars.fontSize['2xs'],
    fontWeight: 500,
    color: vars.color.successText,
  },
  error: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.sm,
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.errorBorder}`,
    background: vars.color.surface,
    padding: `${vars.spacing.xs} ${vars.spacing['md-lg']}`,
    fontSize: vars.fontSize['2xs'],
    fontWeight: 500,
    color: vars.color.errorText,
  },
  publishing: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.sm,
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.surface,
    padding: `${vars.spacing.xs} ${vars.spacing['md-lg']}`,
    fontSize: vars.fontSize['2xs'],
    fontWeight: 500,
    color: vars.color.textMuted,
  },
});

export const externalLink = style({
  display: 'inline-flex',
  height: '36px',
  width: '36px',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  color: vars.color.accent,
  transition: 'border-color 150ms, background-color 150ms',
  textDecoration: 'none',
  ':hover': {
    borderColor: vars.color.borderStrong,
    background: vars.color.surface,
  },
});

export const loadingWrap = style({
  display: 'grid',
  gap: vars.spacing.lg,
  '@media': {
    'screen and (min-width: 640px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  },
});

export const loadingCard = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.lg,
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: `${vars.spacing.lg} ${vars.spacing.xl}`,
});

export const loadingText = style({
  fontSize: vars.fontSize.md,
  color: vars.color.textMuted,
});

export const loadingPlaceholder = style({
  borderRadius: vars.radius.xl,
  border: `1px dashed ${vars.color.borderStrong}`,
  background: vars.color.bgElevated,
  padding: `${vars.spacing.lg} ${vars.spacing.xl}`,
  fontSize: vars.fontSize.md,
  lineHeight: 1.5,
  color: vars.color.textMuted,
});

export const previewPanel = style({
  display: 'grid',
  gap: vars.spacing.xl,
});

export const previewHeader = style({
  display: 'grid',
  gap: vars.spacing.xs,
});

export const previewTitle = style({
  margin: 0,
  fontFamily: vars.font.serif,
  fontSize: vars.fontSize['2xl'],
  lineHeight: 1.3,
  color: vars.color.text,
});

export const previewGrid = style({
  display: 'grid',
  gap: vars.spacing.lg,
  '@media': {
    'screen and (min-width: 900px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
});

export const previewCard = style({
  display: 'grid',
  gap: vars.spacing.lg,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: vars.spacing['lg-xl'],
  // 统一卡片高度上限，避免 Thread 等长内容撑开整行
  alignContent: 'start',
});

export const previewMeta = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.spacing.md,
});

export const previewPlatform = style({
  margin: 0,
  fontSize: vars.fontSize.base,
  fontWeight: 700,
  color: vars.color.text,
});

export const previewState = style({
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '4px 9px',
  fontSize: vars.fontSize.xs,
  fontWeight: 600,
  color: vars.color.signal,
});

export const previewStateNotReady = style({
  borderColor: vars.color.errorText,
  background: vars.color.errorBg,
  color: vars.color.errorText,
});

export const previewBody = style({
  margin: 0,
  color: vars.color.textMuted,
  fontSize: vars.fontSize.sm,
  lineHeight: 1.7,
});

// 小红书首图缩略图
export const previewImage = style({
  width: '100%',
  height: '120px',
  objectFit: 'cover',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  display: 'block',
});

export const previewWarningList = style({
  margin: 0,
  paddingLeft: vars.spacing['xl-2xl'],
  color: vars.color.errorText,
  fontSize: vars.fontSize.xs,
  lineHeight: 1.7,
});

export const previewTagList = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.spacing.sm,
  color: vars.color.signal,
  fontSize: vars.fontSize.xs,
  fontWeight: 600,
});

export const previewThreadList = style({
  display: 'grid',
  gap: vars.spacing.sm,
  margin: 0,
  paddingLeft: vars.spacing['xl-2xl'],
  color: vars.color.textMuted,
  fontSize: vars.fontSize.xs,
  lineHeight: 1.7,
  maxHeight: '160px',
  overflowY: 'auto',
  overscrollBehavior: 'contain',
});

// 右侧面板区块容器
export const rightPanelSection = style({
  borderRadius: vars.radius.xl,
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  boxShadow: vars.shadow.sm,
  padding: `${vars.spacing['lg-xl']} ${vars.spacing.xl}`,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing['md-lg'],
});

export const rightPanelSectionTitle = style({
  fontSize: vars.fontSize['2xs'],
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.32em',
  color: vars.color.accent,
});

// 折叠区域：发布配置
export const collapseToggle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  gap: vars.spacing.sm,
});

export const collapseContent = style({
  overflow: 'hidden',
  transition: 'max-height 220ms cubic-bezier(0.4, 0, 0.2, 1)',
});

export const collapseChevron = style({
  transition: 'transform 220ms',
  flexShrink: 0,
  color: vars.color.textMuted,
});

export const collapseChevronOpen = style({
  transform: 'rotate(180deg)',
});

// AI 适配按钮
export const adaptButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  borderRadius: vars.radius.xs,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: '2px 7px',
  fontSize: vars.fontSize['2xs'],
  color: vars.color.accent,
  cursor: 'pointer',
  transition: 'all 150ms',
  ':hover': {
    background: vars.color.accentSoft,
    borderColor: vars.color.accent,
  },
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

export const adaptButtonRevert = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  borderRadius: vars.radius.xs,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.canvasDeep,
  padding: '2px 7px',
  fontSize: vars.fontSize['2xs'],
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'all 150ms',
  ':hover': {
    borderColor: vars.color.borderStrong,
    color: vars.color.text,
  },
});

export const spinIcon = style({
  animation: `${spin} 1s linear infinite`,
});

// ─── WeChat Article Preview ───

export const wechatPreviewFrame = style({
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: '#ffffff',
  overflow: 'hidden',
  maxHeight: 420,
  overflowY: 'auto',
});

export const wechatHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.spacing.lg} ${vars.spacing.xl}`,
  borderBottom: '1px solid #f0f0f0',
});

export const wechatHeaderLeft = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing['md-lg'],
});

export const wechatAvatar = style({
  width: 32,
  height: 32,
  borderRadius: '50%',
  background: '#e0e0e0',
  flexShrink: 0,
});

export const wechatAuthor = style({
  margin: 0,
  fontSize: vars.fontSize.md,
  fontWeight: 500,
  color: '#333',
  lineHeight: 1.3,
});

export const wechatDate = style({
  margin: 0,
  fontSize: vars.fontSize.xs,
  color: '#999',
  lineHeight: 1.3,
});

export const wechatBody = style({
  padding: '0',
  fontSize: vars.fontSize.base,
  lineHeight: 1.8,
  color: '#333',
});

globalStyle(`${wechatBody} img`, {
  maxWidth: '100%',
  height: 'auto',
});

export const wechatFooter = style({
  display: 'flex',
  justifyContent: 'space-around',
  padding: `${vars.spacing.lg} ${vars.spacing.xl}`,
  borderTop: '1px solid #f0f0f0',
});

export const wechatFooterAction = style({
  fontSize: vars.fontSize.sm,
  color: '#999',
});

// ─── XHS Note Preview ───

export const xhsCard = style({
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: '#ffffff',
  overflow: 'hidden',
});

export const xhsImageGrid = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: vars.spacing['2xs'],
});

export const xhsImage = style({
  width: '100%',
  aspectRatio: '1',
  objectFit: 'cover',
  background: '#f5f5f5',
});

export const xhsContent = style({
  padding: `${vars.spacing['md-lg']} ${vars.spacing.lg}`,
});

export const xhsTitle = style({
  margin: '0 0 6px',
  fontSize: vars.fontSize.md,
  fontWeight: 600,
  color: '#333',
  lineHeight: 1.4,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

export const xhsText = style({
  margin: '0 0 8px',
  fontSize: vars.fontSize.sm,
  color: '#666',
  lineHeight: 1.6,
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

export const xhsTags = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.spacing.sm,
  marginBottom: vars.spacing.md,
});

export const xhsTag = style({
  fontSize: vars.fontSize.xs,
  color: '#ff4757',
  background: '#fff0f0',
  padding: `${vars.spacing['2xs']} ${vars.spacing.sm}`,
  borderRadius: vars.radius.xs,
});

export const xhsFooter = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: vars.spacing.md,
  borderTop: '1px solid #f5f5f5',
});

export const xhsAuthorRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
});

export const xhsAuthorAvatar = style({
  width: 20,
  height: 20,
  borderRadius: '50%',
  background: '#e0e0e0',
});

export const xhsAuthorName = style({
  fontSize: vars.fontSize.xs,
  color: '#999',
});

export const xhsActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
});

export const xhsActionIcon = style({
  fontSize: vars.fontSize.xs,
  color: '#999',
});

// ─── Moderation Warning Dialog ───

export const moderationOverlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0, 0, 0, 0.4)',
  backdropFilter: 'blur(4px)',
});

export const moderationDialog = style({
  width: '90%',
  maxWidth: '440px',
  borderRadius: vars.radius.xl,
  background: vars.color.surface,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.16)',
  overflow: 'hidden',
});

export const moderationHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  padding: `${vars.spacing.xl} ${vars.spacing['2xl']}`,
  borderBottom: `1px solid ${vars.color.border}`,
  color: vars.color.warningText,
  fontWeight: 600,
  fontSize: vars.fontSize.base,
});

export const moderationClose = style({
  marginLeft: 'auto',
  background: 'none',
  border: 'none',
  padding: vars.spacing.xs,
  cursor: 'pointer',
  color: vars.color.textMuted,
  borderRadius: vars.radius.sm,
  transition: 'color 150ms',
  ':hover': { color: vars.color.text },
});

export const moderationBody = style({
  padding: `${vars.spacing.xl} ${vars.spacing['2xl']}`,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.lg,
});

export const moderationSummary = style({
  margin: 0,
  fontSize: vars.fontSize.md,
  color: vars.color.text,
  lineHeight: 1.5,
});

export const moderationCategory = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.sm,
});

export const moderationCategoryLabel = style({
  fontSize: vars.fontSize['2xs'],
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  color: vars.color.textMuted,
});

export const moderationWords = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.spacing.sm,
});

export const moderationWord = style({
  display: 'inline-block',
  borderRadius: vars.radius.sm,
  background: vars.color.warningBg,
  border: `1px solid ${vars.color.warningBorder}`,
  padding: `${vars.spacing['2xs']} ${vars.spacing.md}`,
  fontSize: vars.fontSize.sm,
  color: vars.color.warningText,
  fontWeight: 500,
});

export const moderationHint = style({
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  fontSize: vars.fontSize.sm,
  color: vars.color.warningText,
  lineHeight: 1.5,
});

export const moderationActions = style({
  display: 'flex',
  gap: vars.spacing.lg,
  padding: `${vars.spacing.lg} ${vars.spacing['2xl']}`,
  borderTop: `1px solid ${vars.color.border}`,
  justifyContent: 'flex-end',
});

export const moderationCancelBtn = style({
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: `${vars.spacing.md} ${vars.spacing.xl}`,
  fontSize: vars.fontSize.md,
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'all 150ms',
  ':hover': {
    borderColor: vars.color.borderStrong,
    color: vars.color.text,
  },
});

export const moderationContinueBtn = style({
  borderRadius: vars.radius.lg,
  border: '1px solid transparent',
  background: vars.color.warningText,
  padding: `${vars.spacing.md} ${vars.spacing.xl}`,
  fontSize: vars.fontSize.md,
  fontWeight: 500,
  color: vars.color.surfaceDarkText,
  cursor: 'pointer',
  transition: 'filter 150ms',
  ':hover': { filter: 'brightness(1.1)' },
});
