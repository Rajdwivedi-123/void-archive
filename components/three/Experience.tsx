"use client";

import { Suspense, useEffect, useState } from "react";
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
import type { GraphicsQuality } from "@/hooks/useGraphicsQuality";
import type { ExperienceMode, FacilityProgress, FacilityRoom, NexusInteractionId, PlayerPose } from "@/game/gameTypes";
import type { NexusControlStore } from "@/game/NexusControlStore";
import type { RealitySnapshot } from "@/reality/realityTypes";
import { ArchiveFacility } from "./game/FacilityRooms";
import { FirstPersonController } from "./game/FirstPersonController";

type ExperienceProps = {
  isSceneReady: boolean;
  reducedMotion: boolean;
  scrollProgress: MutableRefObject<number>;
  inspection: InspectionControlRef;
  tier: DeviceTier;
  quality: GraphicsQuality;
  hasFinePointer: boolean;
  onIntroComplete: () => void;
  mode: ExperienceMode;
  nexusActive: boolean;
  gateOpening: boolean;
  nexusControls: NexusControlStore;
  nexusPose: PlayerPose;
  discoveredCount: number;
  session: RealitySnapshot;
  facilityRoom: FacilityRoom;
  facilityProgress: FacilityProgress;
  facilityScanner: boolean;
  onNexusTarget: (target: NexusInteractionId | null) => void;
  onNexusInteract: (target: NexusInteractionId) => void;
  onNexusScanner: () => void;
  onNexusPose: (pose: PlayerPose) => void;
  onPointerLock: (locked: boolean) => void;
};

export function Experience({ isSceneReady, reducedMotion, scrollProgress, inspection, tier, quality, hasFinePointer, onIntroComplete, mode, nexusActive, gateOpening, nexusControls, nexusPose, discoveredCount, session, facilityRoom, facilityProgress, facilityScanner, onNexusTarget, onNexusInteract, onNexusScanner, onNexusPose, onPointerLock }: ExperienceProps) {
  const [introComplete, setIntroComplete] = useState(false);
  const observation = mode === "observation";

  useEffect(() => {
    if (!observation && isSceneReady) onIntroComplete();
  }, [isSceneReady, observation, onIntroComplete]);

  return (
    <Suspense fallback={null}>
      {observation ? <>
        <color attach="background" args={["#010202"]} />
        <fog attach="fog" args={["#010202", 8.5, 30]} />
        <ArchiveChamber />
        <ArchiveJourney tier={tier} quality={quality} reducedMotion={reducedMotion} hasFinePointer={hasFinePointer} scrollProgress={scrollProgress} inspection={inspection} />
        <GravityCore active={introComplete} reducedMotion={reducedMotion} scrollProgress={scrollProgress} inspection={inspection} tier={tier} quality={quality} hasFinePointer={hasFinePointer} />
        <DustField reducedMotion={reducedMotion} />
        <JourneyCamera reducedMotion={reducedMotion} introComplete={introComplete} scrollProgress={scrollProgress} inspection={inspection} tier={tier} />
        <Lighting reducedMotion={reducedMotion} />
        <Environment />
        <IntroCameraSequence key="observation-intro" isSceneReady={isSceneReady} reducedMotion={reducedMotion} onIntroComplete={() => { setIntroComplete(true); onIntroComplete(); }} />
      </> : <>
        <ArchiveFacility room={facilityRoom} progress={facilityProgress} reducedMotion={reducedMotion} discoveredCount={discoveredCount} session={session} gateOpening={gateOpening} scanner={facilityScanner} />
        <FirstPersonController active={nexusActive} tier={tier} reducedMotion={reducedMotion} controls={nexusControls} initialPose={nexusPose} room={facilityRoom} onTarget={onNexusTarget} onInteract={onNexusInteract} onScannerToggle={onNexusScanner} onPose={onNexusPose} onPointerLock={onPointerLock} />
      </>}
      <PostProcessing tier={tier} reducedMotion={reducedMotion} />
    </Suspense>
  );
}
