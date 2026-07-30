"use client";

import { Suspense, useState } from "react";
import type { MutableRefObject } from "react";
import { ArchiveChamber } from "./ArchiveChamber";
import { CameraRig } from "./CameraRig";
import { GravityCore } from "./gravity-core/GravityCore";
import { DustField } from "./DustField";
import { Environment } from "./Environment";
import { IntroCameraSequence } from "./IntroCameraSequence";
import { Lighting } from "./Lighting";
import { PostProcessing } from "./PostProcessing";
import type { DeviceTier } from "@/hooks/useDeviceProfile";

type ExperienceProps = {
  isSceneReady: boolean;
  reducedMotion: boolean;
  scrollProgress: MutableRefObject<number>;
  tier: DeviceTier;
  hasFinePointer: boolean;
  onIntroComplete: () => void;
};

export function Experience({ isSceneReady, reducedMotion, scrollProgress, tier, hasFinePointer, onIntroComplete }: ExperienceProps) {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <Suspense fallback={null}>
      <color attach="background" args={["#010202"]} />
      <fog attach="fog" args={["#010202", 8.5, 30]} />
      <ArchiveChamber />
      <GravityCore
        active={introComplete}
        reducedMotion={reducedMotion}
        scrollProgress={scrollProgress}
        tier={tier}
        hasFinePointer={hasFinePointer}
      />
      <DustField reducedMotion={reducedMotion} />
      <CameraRig reducedMotion={reducedMotion} introComplete={introComplete} scrollProgress={scrollProgress} tier={tier} />
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
