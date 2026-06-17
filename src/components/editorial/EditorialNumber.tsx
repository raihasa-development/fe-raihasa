import React from 'react';

export interface EditorialNumberProps {
  /**
   * The number to display. Will be zero-padded to two digits.
   * e.g. `1` → `"01"`, `12` → `"12"`
   */
  n: number;
  /**
   * Optional mono-uppercase label rendered beside or below the number.
   * Only rendered when provided.
   */
  label?: string;
  /**
   * Color tone for the number.
   * - `'ink'`    → `text-[var(--color-ink-900)]`
   * - `'accent'` → `text-[var(--color-primary-orange)]`
   * @default 'ink'
   */
  tone?: 'ink' | 'accent';
  /**
   * Size scale for the number.
   * - `'sm'` → `text-3xl md:text-4xl`
   * - `'md'` → `text-5xl md:text-6xl`
   * - `'lg'` → `text-7xl md:text-8xl`
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /** Additional Tailwind / CSS classes to merge onto the root element. */
  className?: string;
}

/**
 * `EditorialNumber` renders a zero-padded two-digit number in Fraunces italic
 * light, with an optional mono-uppercase label beside or below it.
 *
 * Use this component as a numbered section marker or step indicator to replace
 * generic pill badges and SVG star icons.
 *
 * @example
 * // Accent-toned large number with a label
 * <EditorialNumber n={1} label="Raih Asa Edition 2026" tone="accent" size="sm" />
 *
 * @example
 * // Ink-toned medium number without a label
 * <EditorialNumber n={3} size="md" />
 *
 * @example
 * // Step marker in a flow
 * <EditorialNumber n={step} label="STEP" size="sm" tone="ink" />
 */
export function EditorialNumber({
  n,
  label,
  tone = 'ink',
  size = 'md',
  className,
}: EditorialNumberProps) {
  // Zero-pad to two digits: 1 → "01", 12 → "12"
  const formatted = String(n).padStart(2, '0');

  // Map size to responsive text size classes
  const sizeClasses: Record<NonNullable<EditorialNumberProps['size']>, string> = {
    sm: 'text-3xl md:text-4xl',
    md: 'text-5xl md:text-6xl',
    lg: 'text-7xl md:text-8xl',
  };

  // Map tone to color classes
  const toneClasses: Record<NonNullable<EditorialNumberProps['tone']>, string> = {
    ink: 'text-[var(--color-ink-900)]',
    accent: 'text-[var(--color-primary-orange)]',
  };

  const rootClasses = ['flex flex-col items-start gap-1', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClasses}>
      {/* Zero-padded number in Fraunces italic light */}
      <span
        className={[
          'editorial-number',
          sizeClasses[size],
          toneClasses[tone],
        ].join(' ')}
      >
        {formatted}
      </span>

      {/* Optional mono-uppercase label — only rendered when label is provided */}
      {label && (
        <span className="eyebrow-mono text-[var(--color-ink-500)]">{label}</span>
      )}
    </div>
  );
}

export default EditorialNumber;
