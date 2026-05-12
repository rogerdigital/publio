import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const pageWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

export const card = style({
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  boxShadow: vars.shadow.sm,
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const cardHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const cardKicker = style({
  fontSize: vars.fontSize.xs,
  fontWeight: 500,
  letterSpacing: vars.tracking.kicker,
  color: vars.color.accent,
});

export const cardCount = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.textMuted,
});

export const statsGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '12px',
  '@media': {
    'screen and (max-width: 640px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  },
});

export const statItem = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '6px',
  padding: '16px 12px',
  borderRadius: vars.radius.lg,
  background: vars.color.surface,
});

export const statIcon = style({
  color: vars.color.accent,
});

export const statValue = style({
  fontSize: '32px',
  fontWeight: 300,
  color: vars.color.text,
  lineHeight: 1,
});

export const statLabel = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
});

export const emptyState = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  padding: '48px 24px',
  color: vars.color.textMuted,
  fontSize: vars.fontSize.sm,
  textAlign: 'center',
});

export const insightSection = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '16px',
});

export const insightBlock = style({
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const insightTitle = style({
  fontSize: vars.fontSize.xs,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: vars.color.textMuted,
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

export const insightList = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const insightItem = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 10px',
  borderRadius: vars.radius.md,
  background: vars.color.surface,
  border: `1px solid ${vars.color.borderFaint}`,
});

export const insightItemTitle = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.text,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '200px',
});

export const insightItemMeta = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
  whiteSpace: 'nowrap',
});

export const table = style({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: vars.fontSize.sm,
});

export const topicIdCell = style({
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.xs,
});
