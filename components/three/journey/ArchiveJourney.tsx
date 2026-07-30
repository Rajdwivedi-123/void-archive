"use client";

import type { MutableRefObject } from "react";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import { ArchiveCorridor } from "./ArchiveCorridor";
import { DeepArchive } from "./DeepArchive";
import { ObjectTwoTeaser } from "./ObjectTwoTeaser";
import { SectorTransition } from "./SectorTransition";

type ArchiveJourneyProps = {
  tier: DeviceTier;
  reducedMotion: boolean;
  scrollProgress: MutableRefObject<number>;
};

export function ArchiveJourney({ tier, reducedMotion, scrollProgress }: ArchiveJourneyProps) {
  return (
    <group>
      <ArchiveCorridor tier={tier} />
      <SectorTransition />
      <DeepArchive tier={tier} />
      <ObjectTwoTeaser reducedMotion={reducedMotion} scrollProgress={scrollProgress} />
    </group>
  );
}
