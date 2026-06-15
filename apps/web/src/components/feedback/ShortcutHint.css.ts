import { style } from '@vanilla-extract/css';
import { vars } from '@/app/styles/tokens.css';

export const hint = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 11,
  color: vars.color.textMuted,
  marginLeft: 6,
  opacity: 0.7,
});

export const kbd = style({
  display: 'inline-block',
  padding: '1px 5px',
  fontSize: 11,
  fontFamily: 'inherit',
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: 4,
  background: vars.color.bgElevated,
  lineHeight: 1.4,
});
