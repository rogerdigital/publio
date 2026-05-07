import { createGlobalTheme, createTheme } from '@vanilla-extract/css';

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

export const darkTheme = createTheme(vars, {
  color: {
    bg:            '#1a1a1e',
    bgElevated:    '#222226',
    surface:       '#2a2a2e',
    surfaceStrong: '#323236',
    border:        'rgba(255, 255, 255, 0.10)',
    borderStrong:  'rgba(255, 255, 255, 0.18)',
    borderFaint:   'rgba(255, 255, 255, 0.06)',
    text:          '#e8e8e8',
    textMuted:     '#9a9a9a',
    accent:        '#E8956E',
    accentSoft:    '#3d2a22',
    signal:        '#E8956E',
    canvasDeep:    '#16161a',
    successBg:     '#1a2a20',
    successBorder: '#2a4a30',
    successText:   '#6aba8e',
    errorBg:       '#2a1a1a',
    errorBorder:   '#4a2a2a',
    errorText:     '#e88888',
    warningBg:     '#2a2218',
    warningBorder: '#4a3a20',
    warningText:   '#e8b060',
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
