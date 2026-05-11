import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/tokens.css';

export const container = style({
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

export const topicList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const topicCard = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  padding: '16px',
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  transition: 'border-color 0.15s ease',
  ':hover': {
    borderColor: vars.color.borderStrong,
  },
});

export const topicHeader = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '12px',
});

export const topicTitle = style({
  fontSize: '15px',
  fontWeight: '500',
  lineHeight: '1.4',
  color: vars.color.text,
  margin: 0,
});

export const topicAngle = style({
  fontSize: '13px',
  color: vars.color.textMuted,
  lineHeight: '1.5',
  margin: 0,
});

export const topicMeta = style({
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

export const topicTags = style({
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

export const platformBadge = style({
  fontSize: '11px',
  padding: '2px 6px',
  borderRadius: vars.radius.sm,
  background: `${vars.color.accent}10`,
  color: vars.color.accent,
  border: `1px solid ${vars.color.accent}30`,
});

export const statusBadge = recipe({
  base: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: vars.radius.sm,
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  variants: {
    status: {
      idea: {
        background: `${vars.color.accent}12`,
        color: vars.color.accent,
      },
      researching: {
        background: vars.color.warningBg,
        color: vars.color.warningText,
      },
      briefed: {
        background: vars.color.successBg,
        color: vars.color.successText,
      },
      drafting: {
        background: `${vars.color.accent}15`,
        color: vars.color.signal,
      },
      published: {
        background: vars.color.successBg,
        color: vars.color.successText,
      },
      archived: {
        background: vars.color.bgElevated,
        color: vars.color.textMuted,
      },
    },
  },
});

export const topicActions = style({
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
      primary: {
        borderColor: vars.color.accent,
        color: vars.color.accent,
        ':hover': {
          background: vars.color.accentSoft,
          borderColor: vars.color.accent,
          color: vars.color.signal,
        },
      },
      danger: {
        ':hover': {
          borderColor: vars.color.errorBorder,
          color: vars.color.errorText,
        },
      },
      default: {},
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

export const loadingState = style({
  padding: '20px',
  textAlign: 'center',
  fontSize: '13px',
  color: vars.color.textMuted,
});
