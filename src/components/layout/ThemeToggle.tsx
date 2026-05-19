'use client';

import { useCallback, useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { darkTheme } from '@/styles/tokens.css';
import * as css from './ThemeToggle.css';

const STORAGE_KEY = 'publio-theme';

type ThemeMode = 'light' | 'dark' | 'system';

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveEffectiveTheme(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? getSystemPreference() : mode;
}

function applyTheme(effective: 'light' | 'dark') {
  if (effective === 'dark') {
    document.documentElement.classList.add(darkTheme);
  } else {
    document.documentElement.classList.remove(darkTheme);
  }
}

const modes: ThemeMode[] = ['light', 'dark', 'system'];

const modeConfig: Record<ThemeMode, { icon: typeof Sun; label: string; color: string }> = {
  light: { icon: Sun, label: '亮色', color: '#F59E0B' },
  dark: { icon: Moon, label: '暗色', color: '#818CF8' },
  system: { icon: Monitor, label: '系统', color: '#34D399' },
};

export default function ThemeToggle({ expanded = false }: { expanded?: boolean }) {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const initialMode: ThemeMode = stored && modes.includes(stored) ? stored : 'dark';
    setMode(initialMode);
    applyTheme(resolveEffectiveTheme(initialMode));

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (localStorage.getItem(STORAGE_KEY) === 'system' || !localStorage.getItem(STORAGE_KEY)) {
        applyTheme(getSystemPreference());
      }
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const select = useCallback((next: ThemeMode) => {
    setMode(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(resolveEffectiveTheme(next));
  }, []);

  const cycle = useCallback(() => {
    setMode((prev) => {
      const idx = modes.indexOf(prev);
      const next = modes[(idx + 1) % modes.length];
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(resolveEffectiveTheme(next));
      return next;
    });
  }, []);

  if (expanded) {
    return (
      <div className={css.segmented} role="radiogroup" aria-label="主题切换">
        {modes.map((m) => {
          const cfg = modeConfig[m];
          const Icon = cfg.icon;
          const active = m === mode;
          return (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={active}
              className={`${css.segItem} ${active ? css.segItemActive : ''}`}
              onClick={() => select(m)}
              title={cfg.label}
            >
              <Icon size={15} color={cfg.color} />
            </button>
          );
        })}
      </div>
    );
  }

  const current = modeConfig[mode];
  const Icon = current.icon;

  return (
    <button
      type="button"
      className={css.toggle}
      onClick={cycle}
      aria-label={`当前：${current.label}，点击切换`}
      title={`当前：${current.label}，点击切换`}
    >
      <Icon size={16} color={current.color} />
    </button>
  );
}
