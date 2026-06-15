import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import * as styles from '@/app/styles/layout.css';

type OptimisticPath = '/' | '/drafts' | '/settings';

interface NavigationContextValue {
  optimisticPath: OptimisticPath | null;
  navigateOptimistically: (href: string) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

function getOptimisticPath(pathname: string): OptimisticPath | null {
  if (pathname === '/') return '/';
  if (pathname.startsWith('/drafts')) return '/drafts';
  if (pathname.startsWith('/settings')) return '/settings';
  return null;
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const currentPath = getOptimisticPath(pathname);
  const [optimisticPath, setOptimisticPath] = useState<OptimisticPath | null>(null);

  useEffect(() => {
    if (optimisticPath === currentPath) {
      setOptimisticPath(null);
    }
  }, [currentPath, optimisticPath]);

  const value = useMemo<NavigationContextValue>(
    () => ({
      optimisticPath,
      navigateOptimistically: (href) => {
        const nextPath = getOptimisticPath(href);
        setOptimisticPath(nextPath && nextPath !== currentPath ? nextPath : null);
      },
    }),
    [currentPath, optimisticPath],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function NavigationContent({ children }: { children: ReactNode }) {
  const { optimisticPath } = useOptimisticNavigation();

  return (
    <>
      {children}
      {optimisticPath ? (
        <div className={styles.transitionCover} aria-hidden="true">
          <div className={styles.transitionSkeleton}>
            <div className={styles.transitionHeader} />
            <div className={styles.transitionBody} />
          </div>
        </div>
      ) : null}
    </>
  );
}

export function useOptimisticNavigation() {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useOptimisticNavigation must be used inside NavigationProvider');
  return context;
}
