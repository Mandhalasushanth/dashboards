import { useEffect, useState } from "react";
import { secondsUntil } from "../services/lockoutPolicy";

/**
 * Seconds left until `untilMs` (epoch ms). The value is derived from the absolute end time on
 * every render and a one-second tick re-renders until the deadline passes, so it stays correct
 * after the app was backgrounded or the JS timer was throttled. Returns 0 when there is no
 * deadline or it has passed.
 */
export function useCountdown(untilMs: number | null | undefined): number {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!untilMs || secondsUntil(untilMs) <= 0) return undefined;
    const id = setInterval(() => {
      setTick((t) => t + 1);
      if (secondsUntil(untilMs) <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [untilMs]);

  return untilMs ? secondsUntil(untilMs) : 0;
}

export default useCountdown;
