import { style, styleVariants } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/tokens.css';

export const draftList = style({
  display: 'grid',
  gap: '12px',
});

export const draftCard = style({
  display: 'grid',
  gap: '18px',
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '18px',
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
  gap: '8px',
  '@media': {
    'screen and (min-width: 760px)': {
      gridColumn: '1 / -1',
    },
  },
});

export const statusBadge = style({
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.accentSoft,
  padding: '5px 10px',
  fontSize: '12px',
  fontWeight: 500,
  color: vars.color.signal,
});

export const sourceBadge = style({
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: '5px 10px',
  fontSize: '12px',
  color: vars.color.textMuted,
});

export const updatedTime = style({
  marginLeft: 'auto',
  fontSize: '12px',
  color: vars.color.textMuted,
});

export const draftTitle = style({
  margin: 0,
  fontFamily: vars.font.serif,
  fontSize: '22px',
  lineHeight: 1.35,
  color: vars.color.text,
});

export const draftExcerpt = style({
  margin: 0,
  marginTop: '8px',
  maxWidth: '64ch',
  fontSize: '14px',
  lineHeight: 1.8,
  color: vars.color.textMuted,
});

export const syncSummary = style({
  display: 'inline-flex',
  flexDirection: 'column',
  gap: '4px',
  marginTop: '14px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: '10px 12px',
});

export const syncTitle = style({
  margin: 0,
  fontSize: '13px',
  fontWeight: 600,
  color: vars.color.text,
});

export const syncText = style({
  margin: 0,
  fontSize: '12px',
  color: vars.color.textMuted,
});

export const syncDetailLink = style({
  width: 'fit-content',
  fontSize: '12px',
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
  gap: '8px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: '10px 14px',
  fontSize: '14px',
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
  gap: '10px',
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '18px',
  color: vars.color.textMuted,
});

export const emptyState = style({
  display: 'flex',
  minHeight: '320px',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  borderRadius: vars.radius.xl,
  border: `1px dashed ${vars.color.borderStrong}`,
  background: vars.color.surface,
  padding: '32px',
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
  fontSize: '14px',
  lineHeight: 1.8,
  color: vars.color.textMuted,
});

export const primaryLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  borderRadius: vars.radius.lg,
  background: vars.color.accent,
  padding: '10px 16px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#ffffff',
  textDecoration: 'none',
});

// Pipeline view
export const pageContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

export const pipelineSection = style({
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const pipelineSectionTitle = style({
  margin: 0,
  fontSize: '14px',
  fontWeight: 600,
  color: vars.color.text,
  textTransform: 'uppercase',
  letterSpacing: vars.tracking.kicker,
});

export const pipelineSectionDesc = style({
  margin: 0,
  fontSize: '13px',
  color: vars.color.textMuted,
});

export const pipelineList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const pipelineRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
});

export const pipelineStep = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: '8px 12px',
  minWidth: '120px',
});

export const pipelineStepIcon = style({
  color: vars.color.accent,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
});

export const pipelineStepContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  minWidth: 0,
});

export const pipelineStepLabel = style({
  fontSize: '13px',
  fontWeight: 500,
  color: vars.color.text,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const pipelineStepLink = style({
  fontSize: '12px',
  color: vars.color.accent,
  textDecoration: 'none',
  ':hover': {
    color: vars.color.signal,
  },
});

export const pipelineArrow = style({
  color: vars.color.textMuted,
  flexShrink: 0,
});

export const deleteErrorText = style({
  fontSize: '13px',
  color: vars.color.errorText,
});

// Pipeline card (normal mode)
export const pipelineCard = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
  padding: '4px 0',
});

// Pipeline card (edit/selectable mode)
export const pipelineRowSelectable = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    borderRadius: vars.radius.lg,
    padding: '4px 6px',
    cursor: 'pointer',
    transition: 'background-color 150ms',
  },
  variants: {
    selected: {
      true: {
        background: vars.color.accentSoft,
      },
      false: {
        ':hover': {
          background: 'rgba(0,0,0,0.03)',
        },
      },
    },
  },
  defaultVariants: { selected: false },
});

// Edit mode toolbar
export const editModeBar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: '10px 14px',
});

export const editModeBarLeft = style({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
});

export const editModeBarRight = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const editModeCount = style({
  fontSize: '13px',
  color: vars.color.textMuted,
});

export const editModeDeleteButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.errorBorder}`,
  background: vars.color.errorBg,
  padding: '6px 12px',
  fontSize: '13px',
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
  gap: '6px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: '6px 12px',
  fontSize: '13px',
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
    gap: '18px',
    borderRadius: vars.radius.xl,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.surface,
    padding: '18px',
    cursor: 'pointer',
    transition: 'border-color 150ms, background-color 150ms',
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
        borderColor: vars.color.accent,
        background: vars.color.accentSoft,
      },
      false: {
        ':hover': {
          borderColor: vars.color.borderStrong,
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
  borderRadius: '4px',
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
  gap: '8px',
});

export const editToggleButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: '6px 10px',
  fontSize: '13px',
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'color 150ms, border-color 150ms',
  ':hover': {
    color: vars.color.text,
    borderColor: vars.color.borderStrong,
  },
});

// 分发状态步骤变体（按状态显示不同颜色徽标）
export const syncStatusStepVariants = styleVariants({
  default: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.bgElevated,
    padding: '8px 12px',
    minWidth: '120px',
  },
  syncing: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.warningBorder}`,
    background: vars.color.warningBg,
    padding: '8px 12px',
    minWidth: '120px',
  },
  completed: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.successBorder}`,
    background: vars.color.successBg,
    padding: '8px 12px',
    minWidth: '120px',
  },
  failed: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.errorBorder}`,
    background: vars.color.errorBg,
    padding: '8px 12px',
    minWidth: '120px',
  },
  'needs-action': {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.warningBorder}`,
    background: vars.color.warningBg,
    padding: '8px 12px',
    minWidth: '120px',
  },
  partial: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.warningBorder}`,
    background: vars.color.warningBg,
    padding: '8px 12px',
    minWidth: '120px',
  },
});

export const syncStatusLabelVariants = styleVariants({
  default: { fontSize: '13px', fontWeight: 500, color: vars.color.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  syncing: { fontSize: '13px', fontWeight: 500, color: vars.color.warningText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  completed: { fontSize: '13px', fontWeight: 500, color: vars.color.successText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  failed: { fontSize: '13px', fontWeight: 500, color: vars.color.errorText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  'needs-action': { fontSize: '13px', fontWeight: 500, color: vars.color.warningText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  partial: { fontSize: '13px', fontWeight: 500, color: vars.color.warningText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

// 状态筛选栏
export const filterBar = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
});

export const filterChip = recipe({
  base: {
    borderRadius: '999px',
    border: `1px solid ${vars.color.border}`,
    padding: '4px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'background-color 150ms, color 150ms, border-color 150ms',
  },
  variants: {
    active: {
      true: {
        background: vars.color.accent,
        borderColor: vars.color.accent,
        color: '#ffffff',
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
