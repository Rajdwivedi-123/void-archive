"use client";

import type { MutableRefObject } from "react";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import { LiquidMirror } from "../liquid-mirror/LiquidMirror";
import { LiquidMirrorChamber } from "../liquid-mirror/LiquidMirrorChamber";
import { ArchiveCorridor } from "./ArchiveCorridor";
import { DeepArchive } from "./DeepArchive";
import { SectorTransition } from "./SectorTransition";

type ArchiveJourneyProps = {
  tier: DeviceTier;
  reducedMotion: boolean;
  hasFinePointer: boolean;
  scrollProgress: MutableRefObject<number>;
};

export function ArchiveJourney({ tier, reducedMotion, hasFinePointer, scrollProgress }: ArchiveJourneyProps) {
  return (
    <group>
      <ArchiveCorridor tier={tier} />
      <SectorTransition />
      <DeepArchive tier={tier} />
      <LiquidMirrorChamber tier={tier} scrollProgress={scrollProgress} />
      <LiquidMirror tier={tier} reducedMotion={reducedMotion} hasFinePointer={hasFinePointer} scrollProgress={scrollProgress} />
    </group>
  );
}
