import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const pageWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  padding: '0 0 48px',
});

export const calendarGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '1px',
  background: vars.color.borderFaint,
  borderRadius: vars.radius.xl,
  overflow: 'hidden',
  boxShadow: vars.shadow.sm,
});

export const dayHeader = style({
  padding: '10px 4px',
  textAlign: 'center',
  fontSize: vars.fontSize.xs,
  fontWeight: 600,
  color: vars.color.textMuted,
  background: vars.color.bgElevated,
});

export const dayCell = style({
  minHeight: '100px',
  padding: '4px',
  background: vars.color.surface,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  transition: `background ${vars.transition.fast}`,
  ':hover': {
    background: vars.color.bgElevated,
  },
  '@media': {
    'screen and (min-width: 768px)': {
      minHeight: '120px',
      padding: '6px',
    },
  },
});

export const dayCellToday = style({
  background: vars.color.accentSoft,
});

export const dayCellOutside = style({
  opacity: 0.4,
});

export const dayNumber = style({
  fontSize: vars.fontSize.xs,
  fontWeight: 500,
  color: vars.color.textMuted,
  padding: '2px 4px',
  alignSelf: 'flex-end',
});

export const dayNumberToday = style({
  borderRadius: '50%',
  background: vars.color.surfaceDark,
  color: vars.color.surfaceDarkText,
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
});

export const eventChip = style({
  borderRadius: vars.radius.sm,
  padding: '2px 6px',
  fontSize: '11px',
  lineHeight: 1.3,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  transition: `filter ${vars.transition.fast}`,
  ':hover': { filter: 'brightness(0.95)' },
});

export const eventScheduled = style({
  background: vars.color.surfaceDark,
  color: vars.color.surfaceDarkText,
});

export const eventDraft = style({
  background: vars.color.bgElevated,
  color: vars.color.textMuted,
});

export const eventPublished = style({
  background: vars.color.successBg,
  color: vars.color.successText,
});

export const eventFailed = style({
  background: vars.color.errorBg,
  color: vars.color.errorText,
});

export const navRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

export const navBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.md,
  border: 'none',
  background: 'transparent',
  width: '32px',
  height: '32px',
  cursor: 'pointer',
  color: vars.color.textMuted,
  transition: `all ${vars.transition.fast}`,
  ':hover': {
    color: vars.color.text,
    background: vars.color.bgElevated,
  },
});

export const monthLabel = style({
  fontSize: vars.fontSize.lg,
  fontWeight: 600,
  color: vars.color.text,
  minWidth: '140px',
  textAlign: 'center',
});

export const todayBtn = style({
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '4px 12px',
  fontSize: vars.fontSize.sm,
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: `all ${vars.transition.fast}`,
  ':hover': {
    color: vars.color.accent,
    borderColor: vars.color.accent,
  },
});

export const legend = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
});

export const legendItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

export const legendDot = style({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
});
