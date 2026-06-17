import { useEffect, useRef, useState } from 'react';

export interface UseScrollParallaxOptions {
  /** Multiplier applied to the element's offset from viewport center.
   *  Negative value moves the element opposite to scroll direction.
   *  Default: -0.15 */
  speed?: number;
  /** Maximum absolute pixel offset (clamp). Default: 80 */
  max?: number;
}

export interface UseScrollParallaxResult {
  ref: React.RefObject<HTMLElement | null>;
  offset: number;
}

/**
 * Lightweight scroll parallax hook.
 *
 * - Respects `prefers-reduced-motion: reduce` — returns offset 0 when active.
 * - Uses `requestAnimationFrame` to throttle scroll calculations.
 * - Uses `IntersectionObserver` to skip calculations when the element is off-screen.
 * - Cleans up all listeners on unmount to prevent memory leaks.
 *
 * Usage:
 * ```tsx
 * const { ref, offset } = useScrollParallax({ speed: -0.15, max: 80 });
 * return <div ref={ref} style={{ transform: `translateY(${offset}px)` }} />;
 * ```
 */
export function useScrollParallax(
  options?: UseScrollParallaxOptions,
): UseScrollParallaxResult {
  const { speed = -0.15, max = 80 } = options ?? {};

  const ref = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    // 1. Check prefers-reduced-motion — bail out early if active.
    let prefersReducedMotion = false;
    try {
      prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
    } catch {
      // Defensive: if matchMedia is unavailable (SSR edge case), treat as false.
      prefersReducedMotion = false;
    }

    if (prefersReducedMotion) {
      setOffset(0);
      return;
    }

    // 2. Track element visibility via IntersectionObserver.
    let isVisible = false;
    let rafId: number | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? false;
      },
      { threshold: 0 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    // 3. Scroll handler — throttled via requestAnimationFrame.
    const handleScroll = () => {
      if (!isVisible || !ref.current) return;

      // Cancel any pending rAF to avoid stacking frames.
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const elementCenterY = rect.top + rect.height / 2;
        const viewportCenterY = window.innerHeight / 2;

        // offset = (elementCenterY - viewportCenterY) * speed, clamped to ±max
        const raw = (elementCenterY - viewportCenterY) * speed;
        const clamped = Math.max(-max, Math.min(max, raw));

        setOffset(clamped);
        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Run once on mount to set initial offset.
    handleScroll();

    // 4. Cleanup on unmount.
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [speed, max]);

  return { ref, offset };
}
