import { style, keyframes } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/tokens.css';

export const inboxContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const filterRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
});

export const filterChip = recipe({
  base: {
    fontSize: '13px',
    padding: '4px 10px',
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.surface,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
    ':hover': {
      borderColor: vars.color.borderStrong,
      background: vars.color.bgElevated,
    },
  },
  variants: {
    active: {
      true: {
        background: vars.color.accentSoft,
        borderColor: vars.color.accent,
        color: vars.color.signal,
        fontWeight: '500',
      },
    },
  },
});

export const signalList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const signalCard = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '14px 16px',
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  transition: 'border-color 0.15s ease',
  ':hover': {
    borderColor: vars.color.borderStrong,
  },
});

export const signalHeader = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '12px',
});

export const signalTitle = style({
  fontSize: '15px',
  fontWeight: '500',
  lineHeight: '1.4',
  color: vars.color.text,
  margin: 0,
});

export const signalTitleLink = style({
  color: 'inherit',
  textDecoration: 'none',
  ':hover': {
    color: vars.color.accent,
  },
});

export const signalSummary = style({
  fontSize: '13px',
  lineHeight: '1.5',
  color: vars.color.textMuted,
  margin: 0,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

export const signalMeta = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '12px',
  color: vars.color.textMuted,
  flexWrap: 'wrap',
});

export const metaDot = style({
  width: '3px',
  height: '3px',
  borderRadius: '50%',
  background: vars.color.border,
  flexShrink: 0,
});

export const signalTags = style({
  display: 'flex',
  gap: '4px',
  flexWrap: 'wrap',
});

export const tagBadge = style({
  fontSize: '11px',
  padding: '2px 6px',
  borderRadius: vars.radius.sm,
  background: vars.color.bgElevated,
  color: vars.color.textMuted,
  border: `1px solid ${vars.color.borderFaint}`,
});

export const signalActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  flexWrap: 'wrap',
});

export const actionBtn = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    padding: '4px 8px',
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.surface,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    color: vars.color.textMuted,
    ':hover': {
      borderColor: vars.color.borderStrong,
      background: vars.color.bgElevated,
      color: vars.color.text,
    },
  },
  variants: {
    variant: {
      save: {},
      dismiss: {},
      topic: {
        borderColor: vars.color.accent,
        color: vars.color.accent,
        ':hover': {
          background: vars.color.accentSoft,
          borderColor: vars.color.accent,
          color: vars.color.signal,
        },
      },
    },
  },
});

export const statusBadge = recipe({
  base: {
    fontSize: '11px',
    padding: '2px 6px',
    borderRadius: vars.radius.sm,
    fontWeight: '500',
  },
  variants: {
    status: {
      new: {
        background: `${vars.color.accent}15`,
        color: vars.color.accent,
      },
      saved: {
        background: vars.color.successBg,
        color: vars.color.successText,
      },
      dismissed: {
        background: vars.color.bgElevated,
        color: vars.color.textMuted,
      },
      converted: {
        background: vars.color.successBg,
        color: vars.color.successText,
      },
    },
  },
});

export const emptyBox = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
  padding: '40px 20px',
  textAlign: 'center',
});

export const emptyTitle = style({
  fontSize: '15px',
  fontWeight: '500',
  color: vars.color.text,
});

export const emptyDesc = style({
  fontSize: '13px',
  color: vars.color.textMuted,
  lineHeight: '1.5',
});

export const errorMsg = style({
  fontSize: '13px',
  color: vars.color.errorText,
  padding: '8px 12px',
  borderRadius: vars.radius.lg,
  background: vars.color.errorBg,
  border: `1px solid ${vars.color.errorBorder}`,
});

const pulse = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 },
});

export const loadingState = style({
  padding: '20px',
  textAlign: 'center',
  fontSize: '13px',
  color: vars.color.textMuted,
  animation: `${pulse} 1.5s ease-in-out infinite`,
});

export const scoreBar = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '11px',
  color: vars.color.textMuted,
});

export const scoreFill = style({
  height: '4px',
  borderRadius: '2px',
  background: vars.color.accent,
  transition: 'width 0.2s ease',
});

export const scoreTrack = style({
  width: '32px',
  height: '4px',
  borderRadius: '2px',
  background: vars.color.canvasDeep,
});
