import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const pageWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

export const card = style({
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
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
  fontSize: '11px',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.32em',
  color: vars.color.accent,
});

export const cardCount = style({
  fontSize: '13px',
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
  gap: '4px',
  padding: '12px',
  borderRadius: vars.radius.lg,
  background: vars.color.bgElevated,
});

export const statIcon = style({
  color: vars.color.accent,
});

export const statValue = style({
  fontSize: '20px',
  fontWeight: 700,
  color: vars.color.text,
  lineHeight: 1.2,
});

export const statLabel = style({
  fontSize: '12px',
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
  fontSize: '14px',
  textAlign: 'center',
});

export const insightSection = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '16px',
});

export const insightBlock = style({
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const insightTitle = style({
  fontSize: '12px',
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
  background: vars.color.bgElevated,
});

export const insightItemTitle = style({
  fontSize: '13px',
  color: vars.color.text,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '200px',
});

export const insightItemMeta = style({
  fontSize: '12px',
  color: vars.color.textMuted,
  whiteSpace: 'nowrap',
});

export const table = style({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '13px',
});

export const topicIdCell = style({
  fontFamily: 'monospace',
  fontSize: '12px',
});
