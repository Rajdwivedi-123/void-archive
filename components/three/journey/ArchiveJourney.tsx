"use client";

import type { MutableRefObject } from "react";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import { LiquidMirror } from "../liquid-mirror/LiquidMirror";
import { LiquidMirrorChamber } from "../liquid-mirror/LiquidMirrorChamber";
import { TemporalRing } from "../temporal-ring/TemporalRing";
import { TemporalRingChamber } from "../temporal-ring/TemporalRingChamber";
import { ArchiveCorridor } from "./ArchiveCorridor";
import { DeepArchive } from "./DeepArchive";
import { SectorTransition } from "./SectorTransition";
import { MeasurementPassage } from "./MeasurementPassage";
import { BioIsolationPassage } from "./BioIsolationPassage";
import { NeuralRelic } from "../neural-relic/NeuralRelic";
import { NeuralRelicChamber } from "../neural-relic/NeuralRelicChamber";

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
      <MeasurementPassage tier={tier} />
      <TemporalRingChamber tier={tier} scrollProgress={scrollProgress} />
      <TemporalRing tier={tier} reducedMotion={reducedMotion} hasFinePointer={hasFinePointer} scrollProgress={scrollProgress} />
      <BioIsolationPassage tier={tier} />
      <NeuralRelicChamber tier={tier} reducedMotion={reducedMotion} scrollProgress={scrollProgress} />
      <NeuralRelic tier={tier} reducedMotion={reducedMotion} hasFinePointer={hasFinePointer} scrollProgress={scrollProgress} />
    </group>
  );
}
