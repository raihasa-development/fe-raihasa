import React from 'react';

/**
 * Variant options for the section background color.
 * Uses flat color tokens from the ink palette — no gradients.
 */
export type EditorialSectionVariant =
  | 'paper'       // bg: var(--color-paper)
  | 'paper-warm'  // bg: var(--color-paper-warm)
  | 'ink'         // bg: var(--color-ink-900), text inverted to paper
  | 'accent'      // bg: var(--color-primary-orange) — use sparingly
  | 'bare';       // no background class, transparent

/** Vertical spacing scale for the section. */
export type EditorialSectionSpacing = 'sm' | 'md' | 'lg' | 'xl';

export interface EditorialSectionProps {
  /**
   * Background color variant using flat ink palette tokens.
   * @default 'paper'
   */
  variant?: EditorialSectionVariant;
  /**
   * Whether to apply the `.grain-overlay` noise texture via ::before pseudo-element.
   * @default true
   */
  grain?: boolean;
  /**
   * Vertical padding scale.
   * - sm → py-10 md:py-12
   * - md → py-14 md:py-20
   * - lg → py-20 md:py-28
   * - xl → py-28 md:py-40
   * @default 'lg'
   */
  spacing?: EditorialSectionSpacing;
  /**
   * HTML tag to render as. Supports any valid HTML element name.
   * @default 'section'
   */
  as?: React.ElementType;
  /** Additional Tailwind / CSS classes to merge onto the root element. */
  className?: string;
  children: React.ReactNode;
}

/**
 * `EditorialSection` is a stateless presentational wrapper that applies
 * the editorial ground color, optional grain texture, and consistent
 * vertical spacing to a page section.
 *
 * @example
 * // Hero section with warm paper background and grain
 * <EditorialSection variant="paper-warm" grain spacing="xl">
 *   <HeroContent />
 * </EditorialSection>
 *
 * @example
 * // Ink-ground emphasis band (e.g. auth visual panel, marquee)
 * <EditorialSection variant="ink" grain={false} spacing="md" as="div">
 *   <QuoteBlock />
 * </EditorialSection>
 *
 * @example
 * // Bare section — no background, just spacing
 * <EditorialSection variant="bare" grain={false} spacing="sm">
 *   <FooterContent />
 * </EditorialSection>
 */
export function EditorialSection({
  variant = 'paper',
  grain = true,
  spacing = 'lg',
  as: Tag = 'section',
  className,
  children,
}: EditorialSectionProps) {
  // Map variant to flat color token classes (NO bg-gradient-* utilities)
  const variantClasses: Record<EditorialSectionVariant, string> = {
    paper: 'bg-[var(--color-paper)]',
    'paper-warm': 'bg-[var(--color-paper-warm)]',
    ink: 'bg-[var(--color-ink-900)] text-[var(--color-paper)]',
    accent: 'bg-[var(--color-primary-orange)]',
    bare: '',
  };

  // Map spacing to vertical padding classes
  const spacingClasses: Record<EditorialSectionSpacing, string> = {
    sm: 'py-10 md:py-12',
    md: 'py-14 md:py-20',
    lg: 'py-20 md:py-28',
    xl: 'py-28 md:py-40',
  };

  const classes = [
    variantClasses[variant],
    spacingClasses[spacing],
    // Apply grain-overlay only when grain is not explicitly false
    grain !== false ? 'grain-overlay' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <Tag className={classes}>{children}</Tag>;
}

export default EditorialSection;
