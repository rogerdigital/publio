import { useEffect, type RefObject } from 'react';

type OutsideRef<T extends HTMLElement> = RefObject<T | null>;

export function useClickOutside<T extends HTMLElement>(
  refs: OutsideRef<T> | OutsideRef<T>[],
  active: boolean,
  onClickOutside: () => void,
) {
  useEffect(() => {
    if (!active) return;

    const refList = Array.isArray(refs) ? refs : [refs];

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (refList.some((ref) => ref.current?.contains(target))) return;
      onClickOutside();
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [active, onClickOutside, refs]);
}
