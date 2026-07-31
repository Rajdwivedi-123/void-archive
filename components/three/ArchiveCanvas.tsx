"use client";

import { Canvas } from "@react-three/fiber";
import { Experience } from "./Experience";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { WebGLFallback } from "../ui/WebGLFallback";
import type { InspectionControlRef } from "@/artifacts/inspection";

type ArchiveCanvasProps = {
  isSceneReady: boolean;
  reducedMotion: boolean;
  scrollProgress: MutableRefObject<number>;
  inspection: InspectionControlRef;
  tier: DeviceTier;
  hasFinePointer: boolean;
  onIntroComplete: () => void;
};

export function ArchiveCanvas({
  isSceneReady,
  reducedMotion,
  scrollProgress,
  inspection,
  tier,
  hasFinePointer,
  onIntroComplete,
}: ArchiveCanvasProps) {
  return (
    <div className="fixed inset-0 z-10 h-[100svh] w-screen overflow-hidden">
      <p className="sr-only">A cinematic rendering of six impossible objects in the VOID ARCHIVE.</p>
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
        >
          <Experience
            isSceneReady={isSceneReady}
            reducedMotion={reducedMotion}
            scrollProgress={scrollProgress}
            inspection={inspection}
            tier={tier}
            hasFinePointer={hasFinePointer}
            onIntroComplete={onIntroComplete}
          />
        </Canvas>
      </div>
    </div>
  );
}
