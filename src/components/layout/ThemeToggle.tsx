'use client';

import { useCallback, useEffect, useState } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { darkTheme } from '@/styles/tokens.css';
import * as css from './ThemeToggle.css';

type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'publio-theme';
const DEFAULT_THEME: ThemeMode = 'dark';
const DISABLE_TRANSITION_CLASS = 'publio-disable-theme-transition';

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveEffectiveTheme(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? getSystemPreference() : mode;
}

function applyTheme(effective: 'light' | 'dark', disableTransition = false) {
  if (disableTransition) {
    document.documentElement.classList.add(DISABLE_TRANSITION_CLASS);
  }

  if (effective === 'dark') {
    document.documentElement.classList.add(darkTheme);
  } else {
    document.documentElement.classList.remove(darkTheme);
  }

  if (disableTransition) {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.documentElement.classList.remove(DISABLE_TRANSITION_CLASS);
      });
    });
  }
}

const modes: ThemeMode[] = ['light', 'dark', 'system'];

const modeConfig: Record<ThemeMode, { icon: typeof Sun; label: string }> = {
  light: { icon: Sun, label: 'Light' },
  dark: { icon: Moon, label: 'Dark' },
  system: { icon: Monitor, label: 'System' },
};

export default function ThemeToggle({ expanded = false }: { expanded?: boolean }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const initialMode: ThemeMode = stored && modes.includes(stored) ? stored : DEFAULT_THEME;
    setMode(initialMode);
    applyTheme(resolveEffectiveTheme(initialMode));

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (localStorage.getItem(STORAGE_KEY) === 'system') {
        applyTheme(getSystemPreference(), true);
      }
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const select = useCallback((next: ThemeMode) => {
    setMode(next);
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(resolveEffectiveTheme(next), true);
  }, []);

  const CurrentIcon = modeConfig[mode].icon;

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        className={css.toggle}
        onClick={() => setOpen((v) => !v)}
        aria-label={`主题：${modeConfig[mode].label}`}
        aria-expanded={open}
      >
        <CurrentIcon size={16} />
      </button>
      {open && (
        <>
          <div className={css.dropdownBackdrop} onClick={() => setOpen(false)} />
          <div className={css.dropdown} role="listbox" aria-label="选择主题">
            {modes.map((m) => {
              const cfg = modeConfig[m];
              const Icon = cfg.icon;
              const active = m === mode;
              return (
                <button
                  key={m}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`${css.dropdownItem} ${active ? css.dropdownItemActive : ''}`}
                  onClick={() => select(m)}
                >
                  <Icon size={16} />
                  {cfg.label}
                  {active && <Check size={14} className={css.checkMark} />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
