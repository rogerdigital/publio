import { globalKeyframes, globalStyle } from '@vanilla-extract/css';
import { vars } from './tokens.css';

globalKeyframes('spin', {
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

globalKeyframes('pulse', {
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.4 },
});

globalStyle('.animate-spin', {
  animationName: 'spin',
  animationDuration: '1s',
  animationTimingFunction: 'linear',
  animationIterationCount: 'infinite',
});

globalStyle('*', {
  boxSizing: 'border-box',
});

globalStyle('html', {
  minHeight: '100%',
  background: vars.color.bg,
  colorScheme: 'light',
});

globalStyle('body', {
  minHeight: '100vh',
  color: vars.color.text,
  fontFamily: vars.font.sans,
  background: vars.color.bg,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
});

globalStyle('::selection', {
  color: vars.color.text,
  background: 'rgba(217, 119, 87, 0.18)',
});

globalStyle(':focus-visible:not(input):not(textarea):not(select)', {
  outline: `2px solid ${vars.color.accent}`,
  outlineOffset: '2px',
  outlineColor: 'rgba(217, 119, 87, 0.6)',
});

globalStyle('input:focus-visible, textarea:focus-visible, select:focus-visible', {
  outline: 'none',
  boxShadow: `0 0 0 2px rgba(217, 119, 87, 0.4)`,
});

globalStyle('button, input, textarea, select', {
  font: 'inherit',
});
