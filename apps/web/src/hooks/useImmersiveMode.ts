import { useCallback, useEffect, useState } from 'react';

export function useImmersiveMode() {
  const [active, setActive] = useState(false);

  const enter = useCallback(() => setActive(true), []);
  const exit = useCallback(() => setActive(false), []);

  useEffect(() => {
    if (!active) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        exit();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [active, exit]);

  return { active, enter, exit };
}
