import { createGlobalTheme } from '@vanilla-extract/css';

export const vars = createGlobalTheme(':root', {
  color: {
    bg:            '#F5F4F0',
    bgElevated:    '#FAFAF7',
    surface:       '#FFFFFF',
    surfaceStrong: '#FFFFFF',
    border:        'rgba(19, 19, 20, 0.10)',
    borderStrong:  'rgba(19, 19, 20, 0.18)',
    borderFaint:   'rgba(19, 19, 20, 0.06)',
    text:          '#131314',
    textMuted:     '#6B6860',
    accent:        '#D97757',
    accentSoft:    '#F5DDD3',
    signal:        '#B85C36',
    canvasDeep:    '#ECEAE4',
    successBg:     '#f4fbf6',
    successBorder: '#bfe8cb',
    successText:   '#247a4b',
    errorBg:       '#fff4f4',
    errorBorder:   '#f4c1c1',
    errorText:     '#bf4b4b',
    warningBg:     '#fff8f0',
    warningBorder: '#fcd9a0',
    warningText:   '#b45309',
  },
  radius: {
    xl: '12px',
    lg: '8px',
  },
  font: {
    sans:  '"Source Han Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", sans-serif',
    serif: '"Source Han Serif SC", "Songti SC", "Iowan Old Style", "Palatino Linotype", serif',
  },
  tracking: {
    kicker: '0.30em',
  },
});
