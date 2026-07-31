"use client";

import { Canvas } from "@react-three/fiber";
import { Experience } from "./Experience";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import type { MutableRefObject } from "react";
import * as THREE from "three";

type ArchiveCanvasProps = {
  isSceneReady: boolean;
  reducedMotion: boolean;
  scrollProgress: MutableRefObject<number>;
  tier: DeviceTier;
  hasFinePointer: boolean;
  onIntroComplete: () => void;
};

export function ArchiveCanvas({
  isSceneReady,
  reducedMotion,
  scrollProgress,
  tier,
  hasFinePointer,
  onIntroComplete,
}: ArchiveCanvasProps) {
  return (
    <div className="fixed inset-0 z-10 h-[100svh] w-screen overflow-hidden">
      <Canvas
        dpr={tier === "mobile" ? [0.8, 1.15] : tier === "tablet" ? [1, 1.4] : [1, 1.7]}
        shadows={false}
        camera={{ position: [0, 0.6, 8], fov: 42, near: 0.1, far: 300 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          outputColorSpace: "srgb",
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        onCreated={({ gl }) => { gl.toneMappingExposure = 0.92; }}
        className="h-full w-full"
      >
        <Experience
          isSceneReady={isSceneReady}
          reducedMotion={reducedMotion}
          scrollProgress={scrollProgress}
          tier={tier}
          hasFinePointer={hasFinePointer}
          onIntroComplete={onIntroComplete}
        />
      </Canvas>
    </div>
  );
}
