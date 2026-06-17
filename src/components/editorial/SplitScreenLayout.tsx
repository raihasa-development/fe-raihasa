import React from 'react';

/**
 * Props for the `SplitScreenLayout` component.
 */
export interface SplitScreenLayoutProps {
  /**
   * Content for the visual panel.
   * - On md+ (≥ 768px): renders as the left column (or right when `reversed`)
   * - On mobile (< 768px): renders on top with `min-h-[40vh]`
   */
  visual: React.ReactNode;
  /**
   * Content for the form panel.
   * - On md+ (≥ 768px): renders as the right column (or left when `reversed`)
   * - On mobile (< 768px): renders below the visual panel
   */
  form: React.ReactNode;
  /**
   * When `true`, swaps the visual and form panel order on md+ viewports
   * (form appears on the left, visual on the right).
   * @default false
   */
  reversed?: boolean;
  /**
   * Additional Tailwind / CSS classes to merge onto the visual panel.
   */
  visualClassName?: string;
  /**
   * Additional Tailwind / CSS classes to merge onto the form panel.
   */
  formClassName?: string;
}

/**
 * `SplitScreenLayout` is a stateless presentational layout component that
 * renders a 50/50 two-column split on viewports ≥ 768px, and collapses to a
 * vertical stack on mobile (visual panel on top, form panel below).
 *
 * Designed for auth pages (login, register) following the editorial
 * split-screen pattern: ink-900 visual panel on one side, paper form panel
 * on the other.
 *
 * @example
 * // Auth login — visual left, form right (default)
 * <SplitScreenLayout
 *   visual={<LoginVisualPanel />}
 *   form={<LoginFormPanel />}
 * />
 *
 * @example
 * // Auth register — visual right, form left (reversed)
 * <SplitScreenLayout
 *   visual={<RegisterVisualPanel />}
 *   form={<RegisterFormPanel />}
 *   reversed
 * />
 *
 * @example
 * // With custom panel class overrides
 * <SplitScreenLayout
 *   visual={<VisualContent />}
 *   form={<FormContent />}
 *   visualClassName="bg-[var(--color-ink-900)] grain-overlay"
 *   formClassName="bg-[var(--color-paper)]"
 * />
 */
export function SplitScreenLayout({
  visual,
  form,
  reversed = false,
  visualClassName,
  formClassName,
}: SplitScreenLayoutProps) {
  // Visual panel: full height on md+, min-h-[40vh] on mobile
  // When reversed, shift to order-2 on md+ so it appears on the right
  const visualPanelClasses = [
    'relative overflow-hidden',
    'min-h-[40vh] md:min-h-screen',
    reversed ? 'md:order-2' : 'md:order-1',
    visualClassName,
  ]
    .filter(Boolean)
    .join(' ');

  // Form panel: centered content with editorial padding
  // When reversed, shift to order-1 on md+ so it appears on the left
  const formPanelClasses = [
    'flex items-center justify-center',
    'px-6 md:px-12 py-12',
    reversed ? 'md:order-1' : 'md:order-2',
    formClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className={visualPanelClasses}>{visual}</div>
      <div className={formPanelClasses}>{form}</div>
    </div>
  );
}

export default SplitScreenLayout;
