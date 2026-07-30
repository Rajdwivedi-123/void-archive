"use client";

import { useEffect, useState } from "react";
import { ArchiveCanvas } from "../three/ArchiveCanvas";
import { ArchiveHUD } from "./ArchiveHUD";
import { LoaderOverlay } from "./LoaderOverlay";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function VoidArchivePage() {
  const [isLoading, setIsLoading] = useState(true);
  const reducedMotion = useReducedMotion();

  useLenisScroll();

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        setIsLoading(false);
      },
      reducedMotion ? 650 : 1600,
    );

    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
      <ArchiveHUD />
      <LoaderOverlay isVisible={isLoading} reducedMotion={reducedMotion} />
      <ArchiveCanvas isSceneReady={!isLoading} reducedMotion={reducedMotion} />
    </div>
  );
}
