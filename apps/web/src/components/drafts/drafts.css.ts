import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/app/styles/tokens.css';

export const draftList = style({
  display: 'flex',
  flexDirection: 'column',
});

export const draftCard = style({
  display: 'grid',
  gap: vars.spacing['xl-2xl'],
  borderBottom: `1px solid ${vars.color.borderFaint}`,
  padding: `${vars.spacing.xl} ${vars.spacing.md}`,
  transition: 'background-color 150ms',
  ':hover': {
    background: vars.color.bgElevated,
  },
  '@media': {
    'screen and (min-width: 760px)': {
      gridTemplateColumns: 'minmax(0, 1fr) auto',
      alignItems: 'center',
    },
  },
});

export const draftMetaRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: vars.spacing.md,
  '@media': {
    'screen and (min-width: 760px)': {
      gridColumn: '1 / -1',
    },
  },
});

export const statusBadge = style({
  borderRadius: vars.radius.full,
  border: 'none',
  background: vars.color.bgElevated,
  padding: `${vars.spacing.xs} ${vars.spacing['md-lg']}`,
  fontSize: vars.fontSize['2xs'],
  fontWeight: 600,
  color: vars.color.textMuted,
});

export const sourceBadge = style({
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: '5px 10px',
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
});

export const updatedTime = style({
  marginLeft: 'auto',
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
});

export const draftTitle = style({
  margin: 0,
  fontSize: vars.fontSize['2xl'],
  fontWeight: 600,
  lineHeight: 1.35,
  color: vars.color.text,
});

export const draftExcerpt = style({
  margin: 0,
  marginTop: vars.spacing.md,
  maxWidth: '64ch',
  fontSize: vars.fontSize.md,
  lineHeight: 1.8,
  color: vars.color.textMuted,
});

export const syncSummary = style({
  display: 'inline-flex',
  flexDirection: 'column',
  gap: vars.spacing.xs,
  marginTop: vars.spacing['lg-xl'],
  padding: `${vars.spacing['md-lg']} ${vars.spacing.lg}`,
});

export const syncTitle = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  fontWeight: 600,
  color: vars.color.text,
});

export const syncText = style({
  margin: 0,
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
});

export const syncDetailLink = style({
  width: 'fit-content',
  fontSize: vars.fontSize.xs,
  fontWeight: 600,
  color: vars.color.accent,
  textDecoration: 'none',
  ':hover': {
    color: vars.color.signal,
  },
});

export const editLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.spacing.md,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: `${vars.spacing['md-lg']} ${vars.spacing['lg-xl']}`,
  fontSize: vars.fontSize.md,
  fontWeight: 500,
  color: vars.color.accent,
  textDecoration: 'none',
  transition: 'border-color 150ms, background-color 150ms',
  ':hover': {
    borderColor: vars.color.borderStrong,
    background: vars.color.surface,
  },
});

export const statePanel = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing['md-lg'],
  padding: vars.spacing['xl-2xl'],
  color: vars.color.textMuted,
});

export const emptyState = style({
  display: 'flex',
  minHeight: '320px',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.spacing.lg,
  padding: vars.spacing['4xl'],
  textAlign: 'center',
});

export const emptyIcon = style({
  display: 'flex',
  height: '52px',
  width: '52px',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.xl,
  background: vars.color.accentSoft,
  color: vars.color.accent,
});

export const stateTitle = style({
  margin: 0,
  fontFamily: vars.font.serif,
  fontSize: '22px',
  lineHeight: 1.35,
  color: vars.color.text,
});

export const stateText = style({
  margin: 0,
  maxWidth: '30rem',
  fontSize: vars.fontSize.md,
  lineHeight: 1.8,
  color: vars.color.textMuted,
});

export const primaryLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  borderRadius: vars.radius.lg,
  background: vars.color.accent,
  padding: `${vars.spacing['md-lg']} ${vars.spacing.xl}`,
  fontSize: vars.fontSize.md,
  fontWeight: 500,
  color: vars.color.surfaceDarkText,
  textDecoration: 'none',
});

export const pageContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing['xl-2xl'],
});

export const deleteErrorText = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.errorText,
});

// Edit mode toolbar
export const editModeBar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.spacing.lg,
  padding: `${vars.spacing['md-lg']} ${vars.spacing['lg-xl']}`,
});

export const editModeBarLeft = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing['md-lg'],
});

export const editModeBarRight = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
});

export const editModeCount = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.textMuted,
});

export const editModeDeleteButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.errorBorder}`,
  background: vars.color.errorBg,
  padding: `${vars.spacing.sm} ${vars.spacing.lg}`,
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
  color: vars.color.errorText,
  cursor: 'pointer',
  transition: 'opacity 150ms',
  selectors: {
    '&:disabled': {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  },
});

export const editModeCancelButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: `${vars.spacing.sm} ${vars.spacing.lg}`,
  fontSize: vars.fontSize.sm,
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'color 150ms, border-color 150ms',
  ':hover': {
    color: vars.color.text,
    borderColor: vars.color.borderStrong,
  },
});

export const draftCardSelectable = recipe({
  base: {
    display: 'grid',
    gap: vars.spacing['xl-2xl'],
    borderBottom: `1px solid ${vars.color.borderFaint}`,
    padding: `${vars.spacing.xl} ${vars.spacing.md}`,
    cursor: 'pointer',
    transition: 'background-color 150ms',
    '@media': {
      'screen and (min-width: 760px)': {
        gridTemplateColumns: 'auto minmax(0, 1fr) auto',
        alignItems: 'center',
      },
    },
  },
  variants: {
    selected: {
      true: {
        background: vars.color.accentSoft,
      },
      false: {
        ':hover': {
          background: vars.color.bgElevated,
        },
      },
    },
  },
  defaultVariants: { selected: false },
});

export const draftCardCheckbox = style({
  flexShrink: 0,
  width: '18px',
  height: '18px',
  borderRadius: vars.radius.xs,
  border: `2px solid ${vars.color.borderStrong}`,
  background: vars.color.bgElevated,
  appearance: 'none',
  cursor: 'pointer',
  position: 'relative',
  selectors: {
    '&:checked': {
      background: vars.color.accent,
      borderColor: vars.color.accent,
    },
    '&:checked::after': {
      content: '""',
      position: 'absolute',
      left: '3px',
      top: '1px',
      width: '8px',
      height: '5px',
      borderLeft: `2px solid #ffffff`,
      borderBottom: `2px solid #ffffff`,
      transform: 'rotate(-45deg)',
    },
  },
});

export const listHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.spacing.md,
});

// 分发状态步骤变体（按状态显示不同颜色徽标）
export const syncStatusStepVariants = styleVariants({
  default: {
    display: 'flex',
    alignItems: 'center',
    gap: vars.spacing.md,
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.bgElevated,
    padding: `${vars.spacing.md} ${vars.spacing.lg}`,
    minWidth: '120px',
  },
  syncing: {
    display: 'flex',
    alignItems: 'center',
    gap: vars.spacing.md,
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.warningBorder}`,
    background: vars.color.warningBg,
    padding: `${vars.spacing.md} ${vars.spacing.lg}`,
    minWidth: '120px',
  },
  completed: {
    display: 'flex',
    alignItems: 'center',
    gap: vars.spacing.md,
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.successBorder}`,
    background: vars.color.successBg,
    padding: `${vars.spacing.md} ${vars.spacing.lg}`,
    minWidth: '120px',
  },
  failed: {
    display: 'flex',
    alignItems: 'center',
    gap: vars.spacing.md,
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.errorBorder}`,
    background: vars.color.errorBg,
    padding: `${vars.spacing.md} ${vars.spacing.lg}`,
    minWidth: '120px',
  },
  'needs-action': {
    display: 'flex',
    alignItems: 'center',
    gap: vars.spacing.md,
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.warningBorder}`,
    background: vars.color.warningBg,
    padding: `${vars.spacing.md} ${vars.spacing.lg}`,
    minWidth: '120px',
  },
  partial: {
    display: 'flex',
    alignItems: 'center',
    gap: vars.spacing.md,
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.warningBorder}`,
    background: vars.color.warningBg,
    padding: `${vars.spacing.md} ${vars.spacing.lg}`,
    minWidth: '120px',
  },
});

export const syncStatusLabelVariants = styleVariants({
  default: {
    fontSize: vars.fontSize.sm,
    fontWeight: 500,
    color: vars.color.text,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  syncing: {
    fontSize: vars.fontSize.sm,
    fontWeight: 500,
    color: vars.color.warningText,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  completed: {
    fontSize: vars.fontSize.sm,
    fontWeight: 500,
    color: vars.color.successText,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  failed: {
    fontSize: vars.fontSize.sm,
    fontWeight: 500,
    color: vars.color.errorText,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  'needs-action': {
    fontSize: vars.fontSize.sm,
    fontWeight: 500,
    color: vars.color.warningText,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  partial: {
    fontSize: vars.fontSize.sm,
    fontWeight: 500,
    color: vars.color.warningText,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

// 搜索栏 + 筛选栏
export const headerToolbar = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
});

export const searchWrap = style({
  position: 'relative',
  width: 240,
  minWidth: 0,
  height: 36,
  '@media': {
    'screen and (max-width: 899px)': {
      display: 'none',
    },
  },
});

export const searchIcon = style({
  position: 'absolute',
  top: '50%',
  left: vars.spacing['lg-xl'],
  transform: 'translateY(-50%)',
  color: vars.color.textMuted,
  pointerEvents: 'none',
});

export const searchInput = style({
  boxSizing: 'border-box',
  width: '100%',
  height: '100%',
  padding: `0 ${vars.spacing['lg-xl']} 0 calc(${vars.spacing['lg-xl']} + 22px)`,
  fontSize: 13,
  border: '1px solid transparent',
  borderRadius: vars.radius.lg,
  background: vars.color.glassInput,
  color: vars.color.text,
  outline: 'none',
  transition: 'border-color 150ms, background-color 150ms',
  ':focus': {
    borderColor: vars.color.glassInputFocus,
    background: vars.color.surface,
  },
  '::placeholder': {
    color: vars.color.textMuted,
  },
});

export const tagBar = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.spacing.sm,
});

export const tagChip = recipe({
  base: {
    borderRadius: 999,
    padding: `${vars.spacing['2xs']} ${vars.spacing.md}`,
    fontSize: 11,
    cursor: 'default',
    transition: 'background-color 150ms',
  },
  variants: {
    active: {
      true: {
        background: vars.color.accentSoft,
        color: vars.color.signal,
      },
      false: {
        background: vars.color.bgElevated,
        color: vars.color.textMuted,
      },
    },
    clickable: {
      true: {
        cursor: 'pointer',
        ':hover': {
          opacity: 0.8,
        },
      },
    },
  },
  defaultVariants: { active: false, clickable: false },
});

// 状态筛选栏
export const filterPopoverWrap = style({
  position: 'relative',
});

export const filterPopover = style({
  display: 'none',
  '@media': {
    'screen and (min-width: 900px)': {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      right: 0,
      zIndex: 30,
      display: 'grid',
      gap: vars.spacing.md,
      minWidth: 320,
      maxWidth: 420,
      padding: vars.spacing['lg-xl'],
      borderRadius: vars.radius.xl,
      border: `1px solid ${vars.color.border}`,
      background: vars.color.surface,
      boxShadow: vars.shadow.lg,
    },
  },
});

export const filterPopoverTitle = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  fontWeight: 600,
  color: vars.color.text,
});

export const filterBar = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.spacing.sm,
});

export const filterChip = recipe({
  base: {
    borderRadius: vars.radius.full,
    border: `1px solid ${vars.color.border}`,
    padding: `${vars.spacing.xs} ${vars.spacing.lg}`,
    fontSize: vars.fontSize.xs,
    cursor: 'pointer',
    transition: 'background-color 150ms, color 150ms, border-color 150ms',
  },
  variants: {
    active: {
      true: {
        background: vars.color.accent,
        borderColor: vars.color.accent,
        color: vars.color.surfaceDarkText,
        fontWeight: 500,
      },
      false: {
        background: 'transparent',
        color: vars.color.textMuted,
        ':hover': {
          borderColor: vars.color.borderStrong,
          color: vars.color.text,
        },
      },
    },
  },
  defaultVariants: { active: false },
});

// 筛选按钮：未选中与已选中（高亮）两态
export const filterButton = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vars.spacing.sm,
    height: 36,
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.border}`,
    background: 'transparent',
    padding: `0 ${vars.spacing['lg-xl']}`,
    fontSize: vars.fontSize.sm,
    color: vars.color.textMuted,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background-color 150ms, color 150ms, border-color 150ms',
    ':hover': {
      background: vars.color.canvasDeep,
      color: vars.color.text,
      borderColor: vars.color.borderStrong,
    },
  },
  variants: {
    active: {
      true: {
        background: vars.color.accent,
        borderColor: vars.color.accent,
        color: vars.color.surfaceDarkText,
        fontWeight: 500,
        ':hover': {
          background: vars.color.accentHover,
          borderColor: vars.color.accentHover,
          color: vars.color.surfaceDarkText,
        },
      },
    },
  },
  defaultVariants: { active: false },
});

export const filterClear = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: vars.spacing['2xs'],
  marginRight: `calc(-1 * ${vars.spacing.xs})`,
  borderRadius: vars.radius.full,
  opacity: 0.7,
  cursor: 'pointer',
  transition: 'opacity 150ms',
  ':hover': {
    opacity: 1,
  },
});

export const batchActionButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: `${vars.spacing.sm} ${vars.spacing['md-lg']}`,
  fontSize: vars.fontSize.sm,
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'all 150ms',
  ':hover': {
    background: vars.color.canvasDeep,
    color: vars.color.text,
    borderColor: vars.color.borderStrong,
  },
  ':disabled': {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
});

// Unified list view
export const compactList = style({
  display: 'flex',
  flexDirection: 'column',
});

export const compactRow = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.spacing.lg,
  position: 'relative',
  padding: `${vars.spacing['xl-2xl']} ${vars.spacing['lg-xl']}`,
  borderRadius: vars.radius.md,
  // 分割线用 ::after 伪元素绘制，左右内缩到与文字内容齐宽（扣除 row 的左右 padding）
  selectors: {
    '&::after': {
      content: '""',
      position: 'absolute',
      left: vars.spacing['lg-xl'],
      right: vars.spacing['lg-xl'],
      bottom: 0,
      height: '1px',
      background: vars.color.borderFaint,
    },
  },
  cursor: 'pointer',
  color: 'inherit',
  textDecoration: 'none',
  transition: 'background-color 150ms',
  ':hover': {
    background: vars.color.bgElevated,
  },
});

export const compactBody = style({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.md,
});

export const compactTitle = style({
  display: 'block',
  fontFamily: vars.font.serif,
  fontSize: vars.fontSize.xl,
  fontWeight: 600,
  lineHeight: 1.4,
  color: vars.color.text,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  textDecoration: 'none',
  transition: 'color 150ms',
});

globalStyle(`${compactRow}:hover ${compactTitle}`, {
  color: vars.color.accent,
});

export const compactExcerpt = style({
  margin: 0,
  fontSize: vars.fontSize.md,
  lineHeight: 1.7,
  color: vars.color.textMuted,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

export const compactExcerptEmpty = style({
  margin: 0,
  fontSize: vars.fontSize.md,
  lineHeight: 1.7,
  color: vars.color.borderStrong,
  fontStyle: 'italic',
});

export const compactMetaRow = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: vars.spacing.md,
  marginTop: vars.spacing.xs,
});

export const compactMeta = style({
  width: 'fit-content',
  borderRadius: vars.radius.full,
  background: vars.color.bgElevated,
  padding: `${vars.spacing['2xs']} ${vars.spacing.md}`,
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
});

export const compactStatus = style({
  width: 'fit-content',
  borderRadius: vars.radius.full,
  background: vars.color.accentSoft,
  padding: `${vars.spacing['2xs']} ${vars.spacing.md}`,
  fontSize: vars.fontSize.xs,
  color: vars.color.text,
});

export const compactSyncStatus = style({
  width: 'fit-content',
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
});

export const compactTime = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
  whiteSpace: 'nowrap',
});

// Load more
export const loadMoreWrap = style({
  display: 'flex',
  justifyContent: 'center',
  padding: '16px 0',
});

export const loadMoreButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: `${vars.spacing.md} ${vars.spacing['2xl']}`,
  fontSize: vars.fontSize.sm,
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'border-color 150ms, color 150ms',
  ':hover': {
    borderColor: vars.color.borderStrong,
    color: vars.color.text,
  },
});

export const loadMoreCount = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
  textAlign: 'center',
  paddingTop: vars.spacing.xs,
});

// Mobile filter sheet
export const mobileFilterOverlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: 200,
  background: 'rgba(0, 0, 0, 0.4)',
  display: 'none',
  alignItems: 'flex-end',
  justifyContent: 'center',
  '@media': {
    'screen and (max-width: 899px)': {
      display: 'flex',
    },
  },
});

export const mobileFilterSheet = style({
  width: '100%',
  background: vars.color.surface,
  borderRadius: `${vars.radius.xl} ${vars.radius.xl} 0 0`,
  padding: `${vars.spacing['2xl']} ${vars.spacing.xl}`,
  paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
});

export const mobileFilterHandle = style({
  width: '36px',
  height: vars.spacing.xs,
  borderRadius: vars.spacing['2xs'],
  background: vars.color.borderStrong,
  margin: `0 auto ${vars.spacing.xl}`,
});

export const mobileFilterTitle = style({
  margin: `0 0 ${vars.spacing.xl}`,
  fontSize: vars.fontSize.lg,
  fontWeight: 600,
  color: vars.color.text,
});
