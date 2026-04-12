import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const detailPanel = style({
  display: 'grid',
  gap: '18px',
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '20px',
});

export const detailHeader = style({
  display: 'grid',
  gap: '8px',
});

export const detailEyebrow = style({
  margin: 0,
  color: vars.color.signal,
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: vars.tracking.kicker,
  textTransform: 'uppercase',
});

export const detailTitle = style({
  margin: 0,
  fontFamily: vars.font.serif,
  fontSize: '28px',
  lineHeight: 1.25,
  color: vars.color.text,
});

export const detailMeta = style({
  margin: 0,
  color: vars.color.textMuted,
  fontSize: '14px',
  lineHeight: 1.7,
});

export const receiptList = style({
  display: 'grid',
  gap: '12px',
});

export const receiptCard = style({
  display: 'grid',
  gap: '10px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: '14px',
});

export const receiptHeader = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '8px',
});

export const receiptPlatform = style({
  margin: 0,
  fontSize: '15px',
  fontWeight: 700,
  color: vars.color.text,
});

export const receiptStatus = style({
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '4px 9px',
  fontSize: '12px',
  fontWeight: 600,
  color: vars.color.signal,
});

export const receiptMessage = style({
  margin: 0,
  color: vars.color.textMuted,
  fontSize: '13px',
  lineHeight: 1.7,
});

export const receiptLink = style({
  width: 'fit-content',
  color: vars.color.accent,
  fontSize: '13px',
  fontWeight: 600,
  textDecoration: 'none',
  ':hover': {
    color: vars.color.signal,
  },
});

export const retryPanel = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '10px',
});

export const retryButton = style({
  border: 0,
  borderRadius: vars.radius.lg,
  background: vars.color.accent,
  padding: '10px 14px',
  color: '#ffffff',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 700,
  ':disabled': {
    cursor: 'not-allowed',
    opacity: 0.64,
  },
});

export const retryMessage = style({
  margin: 0,
  color: vars.color.textMuted,
  fontSize: '13px',
});

export const inlineActionButton = style({
  width: 'fit-content',
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  background: vars.color.surface,
  padding: '8px 11px',
  color: vars.color.accent,
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 700,
  ':hover': {
    borderColor: vars.color.borderStrong,
    color: vars.color.signal,
  },
  ':disabled': {
    cursor: 'not-allowed',
    opacity: 0.64,
  },
});

export const inlineActionMessage = style({
  margin: '8px 0 0',
  color: vars.color.textMuted,
  fontSize: '12px',
});
