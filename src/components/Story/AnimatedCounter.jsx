import { useEffect, useRef, useState } from 'react';

// Ease-out cubic for a natural-feeling deceleration
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export default function AnimatedCounter({
  value,
  active = true,
  duration = 1100,
  prefix = '',
  suffix = '',
  className = '',
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const startValueRef = useRef(value);
  const rafRef = useRef(null);

  useEffect(() => {
    // Only animate when this scene is actively on-screen
    if (!active) {
      setDisplayValue(value);
      startValueRef.current = value;
      return;
    }

    const startValue = startValueRef.current;
    const endValue = value;
    const delta = endValue - startValue;

    if (delta === 0) {
      setDisplayValue(value);
      return;
    }

    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(t);
      const current = Math.round(startValue + delta * eased);
      setDisplayValue(current);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        startValueRef.current = endValue;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, active, duration]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}
