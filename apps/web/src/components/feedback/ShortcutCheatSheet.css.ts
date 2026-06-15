import { style } from '@vanilla-extract/css';
import { vars } from '@/app/styles/tokens.css';

export const overlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: 10000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0, 0, 0, 0.3)',
});

export const panel = style({
  background: vars.color.surface,
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  padding: '24px 28px',
  minWidth: 300,
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
});

export const title = style({
  margin: '0 0 16px',
  fontFamily: vars.font.serif,
  fontSize: 18,
  color: vars.color.text,
});

export const row = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 0',
  borderBottom: `1px solid ${vars.color.borderFaint}`,
  ':last-child': { borderBottom: 'none' },
});

export const label = style({
  fontSize: 14,
  color: vars.color.text,
});

export const kbd = style({
  display: 'inline-block',
  padding: `${vars.spacing['2xs']} ${vars.spacing.md}`,
  fontSize: 12,
  fontFamily: 'inherit',
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: 4,
  background: vars.color.bgElevated,
  color: vars.color.textMuted,
});
