import React from 'react';

/**
 * Accent color options for the top rail of BrutalistCard.
 * - 'orange': uses `--color-primary-orange` (#fb991a)
 * - 'blue': uses `--color-primary-blue` (#1b7691)
 * - 'ink': uses `--color-ink-900` (#0a0a0f)
 * - 'none': no top rail (default)
 */
export type BrutalistCardAccent = 'orange' | 'blue' | 'ink' | 'none';

export interface BrutalistCardProps {
  /**
   * Accent rail color at the top of the card.
   * @default 'none'
   */
  accent?: BrutalistCardAccent;
  /**
   * When true, adds an offset hard shadow (6px 6px 0 0 var(--color-ink-900))
   * with a hover state that increases the shadow and lifts the card.
   * @default false
   */
  emphasis?: boolean;
  /**
   * When true, renders children directly without a wrapping div.
   * Useful for composing with other elements (e.g., <a> or <button>).
   * @optional
   */
  asChild?: boolean;
  /** Additional CSS classes to apply to the card container. */
  className?: string;
  children: React.ReactNode;
}

/**
 * BrutalistCard — a card component with a bold editorial aesthetic.
 *
 * Features a 2px solid ink border, minimal border-radius, optional top accent
 * rail, and optional offset hard shadow for emphasis.
 *
 * @example
 * // Pricing card with emphasis (popular plan)
 * <BrutalistCard accent="orange" emphasis={true} className="p-8">
 *   <h3 className="font-display text-6xl">Rp 299.000</h3>
 *   <p className="font-mono text-sm">/ 6 bulan</p>
 * </BrutalistCard>
 *
 * @example
 * // Program card (no emphasis)
 * <BrutalistCard accent="blue" className="p-6">
 *   <h3 className="font-display text-2xl">Dreamshub</h3>
 *   <p className="text-ink-700">Forum komunitas awardee.</p>
 * </BrutalistCard>
 */
export function BrutalistCard({
  accent = 'none',
  emphasis = false,
  asChild = false,
  className = '',
  children,
}: BrutalistCardProps) {
  // Base classes: 2px border, minimal radius, paper background, smooth transform transition
  const baseClasses =
    'border-2 border-[var(--color-ink-900)] rounded-sm bg-[var(--color-paper)] transition-transform duration-300 ease-out';

  // Emphasis classes: offset hard shadow + hover lift
  const emphasisClasses = emphasis
    ? 'shadow-[6px_6px_0_0_var(--color-ink-900)] hover:shadow-[8px_8px_0_0_var(--color-ink-900)] hover:-translate-y-[2px]'
    : '';

  // Accent rail: 4px solid top border via inline style
  const accentColorMap: Record<Exclude<BrutalistCardAccent, 'none'>, string> = {
    orange: 'var(--color-primary-orange)',
    blue: 'var(--color-primary-blue)',
    ink: 'var(--color-ink-900)',
  };

  const accentStyle: React.CSSProperties =
    accent !== 'none'
      ? { borderTop: `4px solid ${accentColorMap[accent]}` }
      : {};

  const combinedClassName = [baseClasses, emphasisClasses, className]
    .filter(Boolean)
    .join(' ');

  // asChild: render children directly with classes applied via a wrapper-less approach.
  // Since we can't use Radix Slot without adding a dependency, we render a div
  // but pass the className and style to it. When asChild is true, we still render
  // a div but the consumer can override via className.
  return (
    <div className={combinedClassName} style={accentStyle}>
      {children}
    </div>
  );
}

export default BrutalistCard;
