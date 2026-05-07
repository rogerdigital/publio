import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  minHeight: 280,
  borderRadius: vars.radius.xl,
  border: `1px dashed ${vars.color.borderStrong}`,
  background: vars.color.surface,
  padding: '32px',
  textAlign: 'center',
});

export const icon = style({
  width: 40,
  height: 40,
  color: vars.color.textMuted,
  opacity: 0.6,
});

export const title = style({
  margin: 0,
  fontFamily: vars.font.serif,
  fontSize: 20,
  lineHeight: 1.35,
  color: vars.color.text,
});

export const description = style({
  margin: 0,
  maxWidth: '30rem',
  fontSize: 14,
  lineHeight: 1.75,
  color: vars.color.textMuted,
});
