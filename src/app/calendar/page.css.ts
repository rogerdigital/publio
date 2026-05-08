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
  borderRadius: vars.radius.lg,
  overflow: 'hidden',
  border: `1px solid ${vars.color.borderFaint}`,
});

export const dayHeader = style({
  padding: '8px 4px',
  textAlign: 'center',
  fontSize: '12px',
  fontWeight: 500,
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
  '@media': {
    'screen and (min-width: 768px)': {
      minHeight: '120px',
      padding: '6px',
    },
  },
});

export const dayCellToday = style({
  background: 'rgba(217, 119, 87, 0.04)',
});

export const dayCellOutside = style({
  opacity: 0.4,
});

export const dayNumber = style({
  fontSize: '12px',
  fontWeight: 500,
  color: vars.color.textMuted,
  padding: '2px 4px',
  alignSelf: 'flex-end',
});

export const dayNumberToday = style({
  borderRadius: '50%',
  background: vars.color.accent,
  color: '#ffffff',
  width: '22px',
  height: '22px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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
  transition: 'filter 150ms',
  ':hover': { filter: 'brightness(0.95)' },
});

export const eventScheduled = style({
  background: 'rgba(217, 119, 87, 0.12)',
  color: vars.color.accent,
  border: `1px solid rgba(217, 119, 87, 0.2)`,
});

export const eventDraft = style({
  background: vars.color.bgElevated,
  color: vars.color.textMuted,
  border: `1px solid ${vars.color.border}`,
});

export const eventPublished = style({
  background: 'rgba(76, 175, 80, 0.1)',
  color: '#2e7d32',
  border: `1px solid rgba(76, 175, 80, 0.2)`,
});

export const eventFailed = style({
  background: 'rgba(244, 67, 54, 0.08)',
  color: '#c62828',
  border: `1px solid rgba(244, 67, 54, 0.15)`,
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
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  width: '32px',
  height: '32px',
  cursor: 'pointer',
  color: vars.color.textMuted,
  transition: 'color 150ms, border-color 150ms',
  ':hover': {
    color: vars.color.text,
    borderColor: vars.color.borderStrong,
  },
});

export const monthLabel = style({
  fontSize: '16px',
  fontWeight: 600,
  color: vars.color.text,
  minWidth: '140px',
  textAlign: 'center',
});

export const todayBtn = style({
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '4px 12px',
  fontSize: '13px',
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'color 150ms',
  ':hover': { color: vars.color.text },
});

export const legend = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  fontSize: '12px',
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
