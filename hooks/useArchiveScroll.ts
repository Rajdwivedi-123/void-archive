"use client";

import { useEffect, useRef, useState } from "react";

export function useArchiveScroll() {
  const progressRef = useRef(0);
  const [hasEnteredArtifact, setHasEnteredArtifact] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const range = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(window.scrollY / range, 1);
      progressRef.current = progress;
      setHasEnteredArtifact((current) => {
        const next = progress > 0.16;
        return current === next ? current : next;
      });
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return { progressRef, hasEnteredArtifact };
}
