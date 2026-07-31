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
import { GeometricIsolationPassage } from "./GeometricIsolationPassage";
import { VoidArtifact } from "../void-artifact/VoidArtifact";
import { VoidChamber } from "../void-artifact/VoidChamber";
import { MemoryRecoveryPassage } from "./MemoryRecoveryPassage";
import { MemoryCrystal } from "../memory-crystal/MemoryCrystal";
import { MemoryCrystalChamber } from "../memory-crystal/MemoryCrystalChamber";
import type { InspectionControlRef } from "@/artifacts/inspection";
import type { GraphicsQuality } from "@/hooks/useGraphicsQuality";
import { SelectiveVolumetrics } from "../effects/SelectiveVolumetrics";
import { SignatureTransitions } from "./SignatureTransitions";

type ArchiveJourneyProps = {
  tier: DeviceTier;
  reducedMotion: boolean;
  hasFinePointer: boolean;
  scrollProgress: MutableRefObject<number>;
  inspection: InspectionControlRef;
  quality: GraphicsQuality;
};

export function ArchiveJourney({ tier, quality, reducedMotion, hasFinePointer, scrollProgress, inspection }: ArchiveJourneyProps) {
  return (
    <group>
      <ArchiveCorridor tier={tier} />
      <SectorTransition />
      <DeepArchive tier={tier} />
      <LiquidMirrorChamber tier={tier} scrollProgress={scrollProgress} />
      <LiquidMirror tier={tier} reducedMotion={reducedMotion} hasFinePointer={hasFinePointer} scrollProgress={scrollProgress} inspection={inspection} />
      <MeasurementPassage tier={tier} />
      <TemporalRingChamber tier={tier} scrollProgress={scrollProgress} />
      <TemporalRing tier={tier} reducedMotion={reducedMotion} hasFinePointer={hasFinePointer} scrollProgress={scrollProgress} inspection={inspection} />
      <BioIsolationPassage tier={tier} />
      <NeuralRelicChamber tier={tier} reducedMotion={reducedMotion} scrollProgress={scrollProgress} />
      <NeuralRelic tier={tier} reducedMotion={reducedMotion} hasFinePointer={hasFinePointer} scrollProgress={scrollProgress} inspection={inspection} />
      <GeometricIsolationPassage tier={tier} scrollProgress={scrollProgress} />
      <VoidChamber tier={tier} reducedMotion={reducedMotion} scrollProgress={scrollProgress} />
      <VoidArtifact tier={tier} quality={quality} reducedMotion={reducedMotion} hasFinePointer={hasFinePointer} scrollProgress={scrollProgress} inspection={inspection} />
      <MemoryRecoveryPassage tier={tier} />
      <MemoryCrystalChamber tier={tier} reducedMotion={reducedMotion} scrollProgress={scrollProgress} />
      <MemoryCrystal tier={tier} quality={quality} reducedMotion={reducedMotion} hasFinePointer={hasFinePointer} scrollProgress={scrollProgress} inspection={inspection} />
      <SelectiveVolumetrics scrollProgress={scrollProgress} quality={quality} reducedMotion={reducedMotion} />
      <SignatureTransitions scrollProgress={scrollProgress} reducedMotion={reducedMotion} />
    </group>
  );
}
