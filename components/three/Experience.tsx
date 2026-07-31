"use client";

import { Suspense, useState } from "react";
import type { MutableRefObject } from "react";
import { ArchiveChamber } from "./ArchiveChamber";
import { GravityCore } from "./gravity-core/GravityCore";
import { DustField } from "./DustField";
import { Environment } from "./Environment";
import { IntroCameraSequence } from "./IntroCameraSequence";
import { Lighting } from "./Lighting";
import { PostProcessing } from "./PostProcessing";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import { ArchiveJourney } from "./journey/ArchiveJourney";
import { JourneyCamera } from "./journey/JourneyCamera";
import type { InspectionControlRef } from "@/artifacts/inspection";

type ExperienceProps = {
  isSceneReady: boolean;
  reducedMotion: boolean;
  scrollProgress: MutableRefObject<number>;
  inspection: InspectionControlRef;
  tier: DeviceTier;
  hasFinePointer: boolean;
  onIntroComplete: () => void;
};

export function Experience({ isSceneReady, reducedMotion, scrollProgress, inspection, tier, hasFinePointer, onIntroComplete }: ExperienceProps) {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <Suspense fallback={null}>
      <color attach="background" args={["#010202"]} />
      <fog attach="fog" args={["#010202", 8.5, 30]} />
      <ArchiveChamber />
      <ArchiveJourney tier={tier} reducedMotion={reducedMotion} hasFinePointer={hasFinePointer} scrollProgress={scrollProgress} inspection={inspection} />
      <GravityCore
        active={introComplete}
        reducedMotion={reducedMotion}
        scrollProgress={scrollProgress}
        inspection={inspection}
        tier={tier}
        hasFinePointer={hasFinePointer}
      />
      <DustField reducedMotion={reducedMotion} />
      <JourneyCamera reducedMotion={reducedMotion} introComplete={introComplete} scrollProgress={scrollProgress} inspection={inspection} tier={tier} />
      <Lighting reducedMotion={reducedMotion} />
      <Environment />
      <IntroCameraSequence
        isSceneReady={isSceneReady}
        reducedMotion={reducedMotion}
        onIntroComplete={() => {
          setIntroComplete(true);
          onIntroComplete();
        }}
      />
      <PostProcessing tier={tier} reducedMotion={reducedMotion} />
    </Suspense>
  );
}
