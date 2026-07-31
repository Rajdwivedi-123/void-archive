"use client";

import { useEffect, useRef, useState } from "react";
import type { DeviceTier } from "./useDeviceProfile";

export type GraphicsQuality = "conserve" | "balanced" | "high";

export function useGraphicsQuality(tier: DeviceTier, reducedMotion: boolean) {
  const initial = tier === "mobile" ? "conserve" : tier === "tablet" ? "balanced" : "high";
  const [quality, setQuality] = useState<GraphicsQuality>(initial);
  const qualityRef = useRef<GraphicsQuality>(initial);

  useEffect(() => {
    const next = tier === "mobile" ? "conserve" : tier === "tablet" ? "balanced" : "high";
    const frame = requestAnimationFrame(() => { qualityRef.current = next; setQuality(next); });
    return () => cancelAnimationFrame(frame);
  }, [tier]);

  useEffect(() => {
    if (reducedMotion || qualityRef.current === "conserve") return;
    let frame = 0;
    let previous = 0;
    let samples = 0;
    let slow = 0;
    const sample = (now: number) => {
      if (previous) {
        const interval = now - previous;
        samples += 1;
        if (interval > 22) slow += 1;
      }
      previous = now;
      if (samples >= 240) {
        if (slow > 72) {
          const next = qualityRef.current === "high" ? "balanced" : "conserve";
          qualityRef.current = next;
          setQuality(next);
        }
        return;
      }
      frame = requestAnimationFrame(sample);
    };
    const timer = window.setTimeout(() => { frame = requestAnimationFrame(sample); }, 3500);
    return () => { clearTimeout(timer); cancelAnimationFrame(frame); };
  }, [reducedMotion, tier]);

  return { quality, qualityRef };
}
