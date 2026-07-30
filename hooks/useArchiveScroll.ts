"use client";

import { useEffect, useRef, useState } from "react";
import { getJourneyStage, type JourneyStage } from "@/utils/journey";

export function useArchiveScroll() {
  const progressRef = useRef(0);
  const [hasEnteredArtifact, setHasEnteredArtifact] = useState(false);
  const [journeyStage, setJourneyStage] = useState<JourneyStage>("observation");

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const range = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(window.scrollY / range, 1);
      progressRef.current = progress;
      setJourneyStage((current) => {
        const next = getJourneyStage(progress);
        return current === next ? current : next;
      });
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

  return { progressRef, hasEnteredArtifact, journeyStage };
}
