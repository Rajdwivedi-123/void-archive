"use client";

import { Suspense, useState } from "react";
import { ArchiveChamber } from "./ArchiveChamber";
import { CameraRig } from "./CameraRig";
import { CentralInstallation } from "./CentralInstallation";
import { DustField } from "./DustField";
import { Environment } from "./Environment";
import { IntroCameraSequence } from "./IntroCameraSequence";
import { Lighting } from "./Lighting";

type ExperienceProps = {
  isSceneReady: boolean;
  reducedMotion: boolean;
};

export function Experience({ isSceneReady, reducedMotion }: ExperienceProps) {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <Suspense fallback={null}>
      <color attach="background" args={["#030303"]} />
      <fog attach="fog" args={["#030303", 18, 42]} />
      <ArchiveChamber />
      <CentralInstallation reducedMotion={reducedMotion} scrollProgress={0} />
      <DustField reducedMotion={reducedMotion} />
      <CameraRig reducedMotion={reducedMotion} introComplete={introComplete} />
      <Lighting reducedMotion={reducedMotion} />
      <Environment />
      <IntroCameraSequence
        isSceneReady={isSceneReady}
        reducedMotion={reducedMotion}
        onIntroComplete={() => setIntroComplete(true)}
      />
    </Suspense>
  );
}
