"use client";

import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import type { DeviceTier } from "@/hooks/useDeviceProfile";

type PostProcessingProps = {
  tier: DeviceTier;
  reducedMotion: boolean;
};

export function PostProcessing({ tier, reducedMotion }: PostProcessingProps) {
  if (tier === "mobile") {
    return (
      <EffectComposer multisampling={0}>
        <Vignette eskil={false} offset={0.2} darkness={0.72} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={tier === "desktop" ? 4 : 0}>
      <Bloom intensity={tier === "desktop" ? 0.19 : 0.11} luminanceThreshold={0.92} luminanceSmoothing={0.12} mipmapBlur />
      <Vignette eskil={false} offset={0.17} darkness={0.76} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={reducedMotion ? 0.012 : 0.018} />
    </EffectComposer>
  );
}
