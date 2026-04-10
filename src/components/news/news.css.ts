import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/tokens.css';

// TopicDeskHeader styles
export const refreshButton = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: vars.radius.lg,
    border: '1px solid transparent',
    background: vars.color.accent,
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#ffffff',
    transition: 'filter 150ms',
    ':disabled': {
      cursor: 'not-allowed',
      opacity: 0.6,
    },
    selectors: {
      '&:not(:disabled):hover': {
        filter: 'brightness(1.05)',
      },
    },
  },
  variants: {},
});

// AiNewsPageClient layout
export const pageWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

export const contentWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
});

// refresh error banner
export const refreshErrorBanner = style({
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: '16px 20px',
});

export const refreshErrorKicker = style({
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.28em',
  color: vars.color.accent,
});

export const refreshErrorText = style({
  marginTop: '8px',
  fontSize: '14px',
  lineHeight: 1.75,
  color: vars.color.textMuted,
});

// loading skeleton
export const skeletonList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
});

export const skeletonCard = style({
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '24px',
});

export const skeletonInner = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  animationName: 'pulse',
  animationDuration: '2s',
  animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
  animationIterationCount: 'infinite',
});

export const skeletonLineShort = style({
  height: '12px',
  width: '96px',
  borderRadius: '4px',
  background: vars.color.canvasDeep,
});

export const skeletonLineTall = style({
  height: '36px',
  width: '80%',
  borderRadius: '4px',
  background: vars.color.canvasDeep,
});

export const skeletonLineFull = style({
  height: '16px',
  width: '100%',
  borderRadius: '4px',
  background: vars.color.canvasDeep,
});

export const skeletonLineMid = style({
  height: '16px',
  width: '66%',
  borderRadius: '4px',
  background: vars.color.canvasDeep,
});

// empty/error states
export const stateCard = style({
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '32px',
});

export const stateCardCenter = style({
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '32px',
  textAlign: 'center',
});

export const stateTitle = style({
  fontSize: '18px',
  fontWeight: 500,
  color: vars.color.text,
});

export const stateText = style({
  marginTop: '12px',
  fontSize: '14px',
  lineHeight: 1.75,
  color: vars.color.textMuted,
});

// candidate sections
export const candidateSections = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
});

export const candidateSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
});

// TopicSignalCard styles
export const card = style({
  overflow: 'hidden',
});

export const cardInner = style({
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  '@media': {
    'screen and (min-width: 640px)': {
      padding: '24px',
    },
  },
});

export const metaRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '12px',
});

export const metaLeft = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: '12px',
  rowGap: '6px',
});

export const indexBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  borderRadius: vars.radius.lg,
  background: vars.color.accentSoft,
  padding: '4px 10px',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  color: vars.color.signal,
});

export const topicTag = style({
  fontSize: '13px',
  fontWeight: 500,
  color: vars.color.text,
});

export const metaDot = style({
  color: vars.color.borderStrong,
});

export const sourceLink = style({
  fontSize: '13px',
  color: vars.color.textMuted,
  textDecoration: 'none',
  transition: 'color 150ms',
  ':hover': {
    color: vars.color.accent,
  },
});

export const timeLabel = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '13px',
  color: vars.color.textMuted,
});

export const metricsLabel = style({
  display: 'none',
  flexShrink: 0,
  fontSize: '12px',
  color: vars.color.textMuted,
  '@media': {
    'screen and (min-width: 640px)': {
      display: 'block',
    },
  },
});

export const headlineBlock = style({
  minWidth: 0,
});

export const headline = style({
  fontFamily: vars.font.serif,
  fontSize: '20px',
  fontWeight: 600,
  lineHeight: 1.4,
  color: vars.color.text,
  '@media': {
    'screen and (min-width: 640px)': {
      fontSize: '22px',
    },
  },
});

export const whyNow = style({
  marginTop: '8px',
  maxWidth: '48rem',
  fontSize: '15px',
  lineHeight: 1.75,
  color: vars.color.textMuted,
});

export const editorialBar = style({
  borderLeft: `2px solid ${vars.color.accent}`,
  paddingLeft: '16px',
  paddingTop: '4px',
  paddingBottom: '4px',
});

export const editorialKicker = style({
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.24em',
  color: vars.color.accent,
});

export const editorialText = style({
  marginTop: '6px',
  fontSize: '14px',
  lineHeight: 1.75,
  color: vars.color.text,
});

export const actionsRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '8px',
  borderTop: `1px solid ${vars.color.borderFaint}`,
  paddingTop: '16px',
});

export const scoreRow = style({
  display: 'none',
  marginRight: 'auto',
  alignItems: 'center',
  gap: '12px',
  fontSize: '12px',
  color: vars.color.textMuted,
  '@media': {
    'screen and (min-width: 640px)': {
      display: 'flex',
    },
  },
});

export const scoreHighlight = style({
  fontWeight: 600,
  color: vars.color.accent,
});

export const actionButton = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: vars.radius.lg,
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    border: '1px solid transparent',
    textDecoration: 'none',
    transition: 'background-color 150ms, filter 150ms',
  },
  variants: {
    variant: {
      secondary: {
        borderColor: vars.color.border,
        background: vars.color.bgElevated,
        color: vars.color.text,
        ':hover': {
          background: vars.color.surface,
        },
      },
      primary: {
        background: vars.color.accent,
        color: '#ffffff',
        ':hover': {
          filter: 'brightness(1.05)',
        },
      },
    },
  },
  defaultVariants: {
    variant: 'secondary',
  },
});

export const briefSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  paddingTop: '4px',
});

export const briefBlock = style({
  borderLeft: `2px solid ${vars.color.borderStrong}`,
  paddingLeft: '16px',
  paddingTop: '2px',
  paddingBottom: '2px',
});

export const briefBlockAccent = style({
  borderLeft: `2px solid ${vars.color.accent}`,
  paddingLeft: '16px',
  paddingTop: '2px',
  paddingBottom: '2px',
});

export const briefBlockPlain = style({
  paddingLeft: '16px',
});

export const briefKicker = style({
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.24em',
  color: vars.color.textMuted,
});

export const briefKickerAccent = style({
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.24em',
  color: vars.color.accent,
});

export const briefText = style({
  marginTop: '6px',
  fontSize: '14px',
  lineHeight: 1.75,
  color: vars.color.textMuted,
});

export const briefTextDark = style({
  marginTop: '6px',
  fontSize: '14px',
  lineHeight: 1.75,
  color: vars.color.text,
});

export const angleList = style({
  marginTop: '8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const angleLabel = style({
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: 1.5,
  color: vars.color.text,
});

export const angleReason = style({
  fontSize: '14px',
  lineHeight: 1.75,
  color: vars.color.textMuted,
});

export const affectedList = style({
  marginTop: '8px',
  fontSize: '14px',
  color: vars.color.text,
});
