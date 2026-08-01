"use client";

import { Canvas } from "@react-three/fiber";
import { Experience } from "./Experience";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { WebGLFallback } from "../ui/WebGLFallback";
import type { InspectionControlRef } from "@/artifacts/inspection";
import type { GraphicsQuality } from "@/hooks/useGraphicsQuality";
import type { ExperienceMode, FacilityProgress, FacilityRoom, NexusInteractionId, PlayerPose } from "@/game/gameTypes";
import type { NexusControlStore } from "@/game/NexusControlStore";
import type { RealitySnapshot } from "@/reality/realityTypes";

type ArchiveCanvasProps = {
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
  nexusTarget: NexusInteractionId | null;
  onNexusTarget: (target: NexusInteractionId | null) => void;
  onNexusInteract: (target: NexusInteractionId) => void;
  onNexusScanner: () => void;
  onNexusPose: (pose: PlayerPose) => void;
  onPointerLock: (locked: boolean) => void;
};

export function ArchiveCanvas({
  isSceneReady,
  reducedMotion,
  scrollProgress,
  inspection,
  tier,
  quality,
  hasFinePointer,
  onIntroComplete,
  mode,
  nexusActive,
  gateOpening,
  nexusControls,
  nexusPose,
  discoveredCount,
  session,
  facilityRoom,
  facilityProgress,
  facilityScanner,
  nexusTarget,
  onNexusTarget,
  onNexusInteract,
  onNexusScanner,
  onNexusPose,
  onPointerLock,
}: ArchiveCanvasProps) {
  return (
    <div className="fixed inset-0 z-10 h-[100svh] w-screen overflow-hidden">
      <p className="sr-only">A playable archive nexus and cinematic rendering of six impossible objects in the VOID ARCHIVE.</p>
      <div aria-hidden="true" className="h-full w-full">
        <Canvas
          dpr={tier === "mobile" ? [0.8, 1.15] : tier === "tablet" ? [0.9, 1.3] : [1, 1.5]}
          shadows={false}
          camera={{ position: [0, 0.6, 8], fov: 42, near: 0.1, far: 120 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            outputColorSpace: "srgb",
            toneMapping: THREE.ACESFilmicToneMapping,
          }}
          onCreated={({ gl }) => { gl.toneMappingExposure = 0.92; }}
          fallback={<WebGLFallback />}
          className="h-full w-full"
          style={{ touchAction: mode === "observation" ? "pan-y" : "none" }}
        >
          <Experience
            isSceneReady={isSceneReady}
            reducedMotion={reducedMotion}
            scrollProgress={scrollProgress}
            inspection={inspection}
            tier={tier}
            quality={quality}
            hasFinePointer={hasFinePointer}
            onIntroComplete={onIntroComplete}
            mode={mode}
            nexusActive={nexusActive}
            gateOpening={gateOpening}
            nexusControls={nexusControls}
            nexusPose={nexusPose}
            discoveredCount={discoveredCount}
            session={session}
            facilityRoom={facilityRoom}
            facilityProgress={facilityProgress}
            facilityScanner={facilityScanner}
            nexusTarget={nexusTarget}
            onNexusTarget={onNexusTarget}
            onNexusInteract={onNexusInteract}
            onNexusScanner={onNexusScanner}
            onNexusPose={onNexusPose}
            onPointerLock={onPointerLock}
          />
        </Canvas>
      </div>
    </div>
  );
}
