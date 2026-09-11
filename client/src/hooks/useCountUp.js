import { useState, useEffect } from "react";

/**
 * Animate a number counting up from 0 to end value.
 * @param {{ end: number, duration?: number, decimals?: number, enabled?: boolean }} options
 * @returns {number}
 */
export function useCountUp({ end, duration = 1500, decimals = 0, enabled = true }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled || end === null || end === undefined || Number.isNaN(end)) {
      setValue(0);
      return;
    }

    const startTime = performance.now();
    const startVal = 0;
    const target = Number(end);

    let frameId;

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (target - startVal) * eased;
      setValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [end, duration, enabled]);

  return decimals > 0 ? Number(value.toFixed(decimals)) : Math.round(value);
}
