import { style } from '@vanilla-extract/css';
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
