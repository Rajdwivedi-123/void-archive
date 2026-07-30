"use client";

import { Suspense } from "react";
import { Scene } from "./Scene";
import { CameraRig } from "./CameraRig";
import { Lighting } from "./Lighting";
import { Environment } from "./Environment";

type ExperienceProps = {
  isSceneReady: boolean;
  reducedMotion: boolean;
};

export function Experience({ isSceneReady, reducedMotion }: ExperienceProps) {
  return (
    <Suspense fallback={null}>
      <Scene isSceneReady={isSceneReady} reducedMotion={reducedMotion} />
      <CameraRig reducedMotion={reducedMotion} />
      <Lighting reducedMotion={reducedMotion} />
      <Environment />
    </Suspense>
  );
}
