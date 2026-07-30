"use client";

import { useCallback, useEffect, useState } from "react";
import { ArchiveCanvas } from "../three/ArchiveCanvas";
import { ArchiveHUD } from "./ArchiveHUD";
import { ArtifactInfo } from "./ArtifactInfo";
import { LoaderOverlay } from "./LoaderOverlay";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDeviceProfile } from "@/hooks/useDeviceProfile";
import { useArchiveScroll } from "@/hooks/useArchiveScroll";

export function VoidArchivePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const reducedMotion = useReducedMotion();
  const { tier, hasFinePointer } = useDeviceProfile();
  const { progressRef, hasEnteredArtifact } = useArchiveScroll();

  useLenisScroll();

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        setIsLoading(false);
      },
      reducedMotion ? 650 : 1600,
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (!introComplete) return;
    const timer = window.setTimeout(() => setShowInfo(true), reducedMotion ? 0 : 720);
    return () => window.clearTimeout(timer);
  }, [introComplete, reducedMotion]);

  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);

  return (
    <div className="relative min-h-[180svh] overflow-x-hidden bg-[#030303] text-white">
      <ArchiveHUD active={introComplete} />
      <ArtifactInfo isVisible={showInfo} reducedMotion={reducedMotion} isScrolled={hasEnteredArtifact} />
      <LoaderOverlay isVisible={isLoading} reducedMotion={reducedMotion} />
      <ArchiveCanvas isSceneReady={!isLoading} reducedMotion={reducedMotion} scrollProgress={progressRef} tier={tier} hasFinePointer={hasFinePointer} onIntroComplete={handleIntroComplete} />
    </div>
  );
}
