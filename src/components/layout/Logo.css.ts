import { vars } from '@/styles/tokens.css';
import { style } from '@vanilla-extract/css';

export const logoSvg = style({
  display: 'block',
  color: vars.color.text,
  vars: {
    '--logo-letter': vars.color.surfaceDarkText,
  },
});
