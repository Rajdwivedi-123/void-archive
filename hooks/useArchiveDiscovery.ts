"use client";

import { useEffect, useState } from "react";
import type { JourneyStage } from "@/utils/journey";

const STORAGE_KEY = "void-archive.discovery.v1";

function countForStage(stage: JourneyStage) {
  if (stage === "session-complete" || stage === "archive-resolution" || stage.startsWith("object-six")) return 6;
  if (stage === "memory-recovery-passage" || stage === "object-five-departure" || stage.startsWith("object-five")) return 5;
  if (stage === "geometric-isolation-passage" || stage === "object-four-departure" || stage.startsWith("object-four")) return 4;
  if (stage === "bio-isolation-passage" || stage === "object-three-departure" || stage.startsWith("object-three")) return 3;
  if (stage === "measurement-passage" || stage === "object-two-departure" || stage.startsWith("object-two")) return 2;
  return 1;
}

export function useArchiveDiscovery(stage: JourneyStage) {
  const [discoveredCount, setDiscoveredCount] = useState(1);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = Number(window.localStorage.getItem(STORAGE_KEY));
      if (Number.isFinite(stored)) setDiscoveredCount(Math.min(6, Math.max(1, stored)));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const next = countForStage(stage);
      setDiscoveredCount((current) => {
        const resolved = Math.max(current, next);
        window.localStorage.setItem(STORAGE_KEY, String(resolved));
        return resolved;
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [stage]);

  return discoveredCount;
}
