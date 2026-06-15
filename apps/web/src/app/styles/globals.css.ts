import { globalKeyframes, globalStyle } from '@vanilla-extract/css';
import { vars, darkTheme } from './tokens.css';

globalKeyframes('spin', {
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

globalKeyframes('pulse', {
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.4 },
});

globalKeyframes('fadeIn', {
  from: { opacity: 0 },
  to: { opacity: 1 },
});

globalKeyframes('shimmer', {
  '0%': { backgroundPosition: '-200% 0' },
  '100%': { backgroundPosition: '200% 0' },
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
  colorScheme: 'light',
  transition: `background ${vars.transition.slow}, color ${vars.transition.base}`,
});

globalStyle(`html.${darkTheme}`, {
  colorScheme: 'dark',
});

globalStyle('.publio-disable-theme-transition, .publio-disable-theme-transition *', {
  transition: 'none !important',
});

globalStyle('body', {
  minHeight: '100vh',
  margin: 0,
  color: vars.color.text,
  fontFamily: vars.font.sans,
  background: `
    radial-gradient(ellipse at 20% 50%, rgba(200, 220, 240, 0.4) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(240, 220, 200, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 60% 80%, rgba(220, 230, 240, 0.3) 0%, transparent 50%),
    ${vars.color.bg}
  `,
  backgroundAttachment: 'fixed',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
});

globalStyle(`.${darkTheme} body, html.${darkTheme} body`, {
  background: `
    radial-gradient(ellipse at 20% 50%, rgba(60, 60, 80, 0.2) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(80, 60, 60, 0.15) 0%, transparent 50%),
    #141414
  `,
});

globalStyle('::selection', {
  color: vars.color.text,
  background: vars.color.accentSoft,
});

globalStyle(':focus-visible:not(input):not(textarea):not(select)', {
  outline: `2px solid ${vars.color.borderStrong}`,
  outlineOffset: '2px',
});

globalStyle('input:focus-visible, textarea:focus-visible, select:focus-visible', {
  outline: 'none',
});

globalStyle('button, input, textarea, select', {
  font: 'inherit',
});

globalStyle('::-webkit-scrollbar', {
  width: '6px',
  height: '6px',
});

globalStyle('::-webkit-scrollbar-track', {
  background: 'transparent',
});

globalStyle('::-webkit-scrollbar-thumb', {
  background: 'rgba(0, 0, 0, 0.12)',
  borderRadius: '3px',
});

globalStyle('::-webkit-scrollbar-thumb:hover', {
  background: 'rgba(0, 0, 0, 0.20)',
});
