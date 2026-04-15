import { style, styleVariants } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/tokens.css';

export const selectorWrap = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
});

export const selectorFooter = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: '8px',
  fontSize: '12px',
  color: vars.color.textMuted,
});

export const selectorToggleAll = style({
  background: 'none',
  border: 'none',
  padding: 0,
  fontSize: '12px',
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
    gap: '8px',
    borderRadius: vars.radius.lg,
    padding: '8px 12px',
    fontSize: '14px',
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
    gap: '8px',
    borderRadius: vars.radius.lg,
    border: '1px solid transparent',
    padding: '10px 20px',
    fontSize: '14px',
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
        color: '#ffffff',
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
  gap: '16px',
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '16px',
});

export const panelHeader = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  '@media': {
    'screen and (min-width: 640px)': {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },
  },
});

export const panelKicker = style({
  fontSize: '11px',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.32em',
  color: vars.color.accent,
});

export const panelTitle = style({
  fontFamily: vars.font.serif,
  marginTop: '4px',
  fontSize: '18px',
  lineHeight: 1.3,
  color: vars.color.text,
});

export const panelStats = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  fontSize: '12px',
  color: vars.color.textMuted,
});

export const statBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: '6px 12px',
});

export const resultList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const resultCardVariants = styleVariants({
  success: {
    display: 'grid',
    gap: '12px',
    borderRadius: vars.radius.xl,
    border: `1px solid ${vars.color.successBorder}`,
    background: vars.color.successBg,
    padding: '16px',
    '@media': {
      'screen and (min-width: 640px)': {
        gridTemplateColumns: 'auto minmax(0, 1fr) auto',
        alignItems: 'center',
      },
    },
  },
  error: {
    display: 'grid',
    gap: '12px',
    borderRadius: vars.radius.xl,
    border: `1px solid ${vars.color.errorBorder}`,
    background: vars.color.errorBg,
    padding: '16px',
    '@media': {
      'screen and (min-width: 640px)': {
        gridTemplateColumns: 'auto minmax(0, 1fr) auto',
        alignItems: 'center',
      },
    },
  },
  publishing: {
    display: 'grid',
    gap: '12px',
    borderRadius: vars.radius.xl,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.bgElevated,
    padding: '16px',
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
  gap: '12px',
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
  fontSize: '14px',
  fontWeight: 500,
  color: vars.color.text,
});

export const platformSubLabel = style({
  marginTop: '4px',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.24em',
  color: vars.color.textMuted,
});

export const resultMessage = style({
  minWidth: 0,
});

export const resultMessageTextVariants = styleVariants({
  success: {
    fontSize: '14px',
    lineHeight: 1.5,
    color: vars.color.successText,
  },
  error: {
    fontSize: '14px',
    lineHeight: 1.5,
    color: vars.color.errorText,
  },
  publishing: {
    fontSize: '14px',
    lineHeight: 1.5,
    color: vars.color.textMuted,
  },
});

export const resultActions = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
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
    gap: '6px',
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.successBorder}`,
    background: '#ffffff',
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: 500,
    color: vars.color.successText,
  },
  error: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.errorBorder}`,
    background: '#ffffff',
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: 500,
    color: vars.color.errorText,
  },
  publishing: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.border}`,
    background: '#ffffff',
    padding: '4px 10px',
    fontSize: '11px',
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
  gap: '12px',
  '@media': {
    'screen and (min-width: 640px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  },
});

export const loadingCard = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: '12px 16px',
});

export const loadingText = style({
  fontSize: '14px',
  color: vars.color.textMuted,
});

export const loadingPlaceholder = style({
  borderRadius: vars.radius.xl,
  border: `1px dashed ${vars.color.borderStrong}`,
  background: vars.color.bgElevated,
  padding: '12px 16px',
  fontSize: '14px',
  lineHeight: 1.5,
  color: vars.color.textMuted,
});

export const previewPanel = style({
  display: 'grid',
  gap: '16px',
});

export const previewHeader = style({
  display: 'grid',
  gap: '4px',
});

export const previewTitle = style({
  margin: 0,
  fontFamily: vars.font.serif,
  fontSize: '20px',
  lineHeight: 1.3,
  color: vars.color.text,
});

export const previewGrid = style({
  display: 'grid',
  gap: '12px',
  '@media': {
    'screen and (min-width: 900px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
});

export const previewCard = style({
  display: 'grid',
  gap: '12px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: '14px',
  // 统一卡片高度上限，避免 Thread 等长内容撑开整行
  alignContent: 'start',
});

export const previewMeta = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
});

export const previewPlatform = style({
  margin: 0,
  fontSize: '15px',
  fontWeight: 700,
  color: vars.color.text,
});

export const previewState = style({
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '4px 9px',
  fontSize: '12px',
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
  fontSize: '13px',
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
  paddingLeft: '18px',
  color: vars.color.errorText,
  fontSize: '12px',
  lineHeight: 1.7,
});

export const previewTagList = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
  color: vars.color.signal,
  fontSize: '12px',
  fontWeight: 600,
});

export const previewThreadList = style({
  display: 'grid',
  gap: '6px',
  margin: 0,
  paddingLeft: '18px',
  color: vars.color.textMuted,
  fontSize: '12px',
  lineHeight: 1.7,
  maxHeight: '160px',
  overflowY: 'auto',
  overscrollBehavior: 'contain',
});

// 右侧面板区块容器
export const rightPanelSection = style({
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '12px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
});

export const rightPanelSectionTitle = style({
  fontSize: '11px',
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
  gap: '6px',
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
