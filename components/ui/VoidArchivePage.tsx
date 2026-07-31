"use client";

import { useCallback, useEffect, useState } from "react";
import { ArchiveCanvas } from "../three/ArchiveCanvas";
import { ArchiveHUD } from "./ArchiveHUD";
import { ArtifactRecord } from "./ArtifactRecord";
import { LoaderOverlay } from "./LoaderOverlay";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDeviceProfile } from "@/hooks/useDeviceProfile";
import { useArchiveScroll } from "@/hooks/useArchiveScroll";
import { JourneyUI } from "./JourneyUI";
import { gravityCoreArtifact, liquidMirrorArtifact, memoryCrystalArtifact, neuralRelicArtifact, temporalRingArtifact, voidArtifact } from "@/artifacts/registry";

export function VoidArchivePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const reducedMotion = useReducedMotion();
  const { tier, hasFinePointer } = useDeviceProfile();
  const { progressRef, hasEnteredArtifact, journeyStage } = useArchiveScroll();

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
  const gravityRecordVisible = showInfo && (journeyStage === "observation" || journeyStage === "approach");
  const mirrorRecordVisible = journeyStage === "object-two-activation" || journeyStage === "object-two-inspection";
  const temporalRecordVisible = journeyStage === "object-three-activation" || journeyStage === "object-three-inspection";
  const neuralRecordVisible = journeyStage === "object-four-activation" || journeyStage === "object-four-inspection";
  const voidRecordVisible = journeyStage === "object-five-activation" || journeyStage === "object-five-inspection";
  const memoryRecordVisible = journeyStage === "object-six-activation" || journeyStage === "object-six-inspection";

  return (
    <div className="journey-scroll-space relative overflow-x-hidden bg-[#030303] text-white">
      <ArchiveHUD active={introComplete} stage={journeyStage} />
      <ArtifactRecord artifact={gravityCoreArtifact} isVisible={gravityRecordVisible} reducedMotion={reducedMotion} anomalyActive={hasEnteredArtifact} />
      <ArtifactRecord artifact={liquidMirrorArtifact} isVisible={mirrorRecordVisible} reducedMotion={reducedMotion} anomalyActive={journeyStage === "object-two-inspection"} />
      <ArtifactRecord artifact={temporalRingArtifact} isVisible={temporalRecordVisible} reducedMotion={reducedMotion} anomalyActive={journeyStage === "object-three-inspection"} />
      <ArtifactRecord artifact={neuralRelicArtifact} isVisible={neuralRecordVisible} reducedMotion={reducedMotion} anomalyActive={journeyStage === "object-four-inspection"} />
      <ArtifactRecord artifact={voidArtifact} isVisible={voidRecordVisible} reducedMotion={reducedMotion} anomalyActive={journeyStage === "object-five-inspection"} />
      <ArtifactRecord artifact={memoryCrystalArtifact} isVisible={memoryRecordVisible} reducedMotion={reducedMotion} anomalyActive={journeyStage === "object-six-inspection"} />
      <JourneyUI stage={journeyStage} />
      <LoaderOverlay isVisible={isLoading} reducedMotion={reducedMotion} />
      <ArchiveCanvas isSceneReady={!isLoading} reducedMotion={reducedMotion} scrollProgress={progressRef} tier={tier} hasFinePointer={hasFinePointer} onIntroComplete={handleIntroComplete} />
    </div>
  );
}
