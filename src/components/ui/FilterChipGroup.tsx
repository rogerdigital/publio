import { cn } from '@/lib/cn';
import * as styles from './FilterChipGroup.css';

export interface FilterOption<V extends string> {
  value: V;
  label: string;
}

interface FilterChipGroupProps<V extends string> {
  options: readonly FilterOption<V>[];
  value: V;
  onChange: (value: V) => void;
  className?: string;
}

export default function FilterChipGroup<V extends string>({
  options,
  value,
  onChange,
  className,
}: FilterChipGroupProps<V>) {
  return (
    <div className={cn(styles.filterBar, className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={styles.filterChip({ active: value === opt.value })}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
