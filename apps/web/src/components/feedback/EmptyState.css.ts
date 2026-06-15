import { style } from '@vanilla-extract/css';
import { vars } from '@/app/styles/tokens.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.spacing['lg-xl'],
  minHeight: 280,
  borderRadius: vars.radius.xl,
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  padding: `${vars.spacing['5xl']} ${vars.spacing['4xl']}`,
  textAlign: 'center',
});

export const icon = style({
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  background: vars.color.bgElevated,
  color: vars.color.textMuted,
});

export const title = style({
  margin: 0,
  fontSize: vars.fontSize.lg,
  fontWeight: 500,
  lineHeight: 1.35,
  color: vars.color.text,
});

export const description = style({
  margin: 0,
  maxWidth: '30rem',
  fontSize: vars.fontSize.sm,
  lineHeight: 1.75,
  color: vars.color.textMuted,
});

export const actions = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.lg,
  marginTop: vars.spacing.md,
});
