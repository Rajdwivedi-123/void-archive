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
        <Vignette eskil={false} offset={0.2} darkness={0.62} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={tier === "desktop" ? 2 : 0}>
      <Bloom intensity={tier === "desktop" ? 0.17 : 0.1} luminanceThreshold={0.94} luminanceSmoothing={0.12} mipmapBlur />
      <Vignette eskil={false} offset={0.18} darkness={tier === "desktop" ? 0.69 : 0.66} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={reducedMotion ? 0.008 : 0.012} />
    </EffectComposer>
  );
}
