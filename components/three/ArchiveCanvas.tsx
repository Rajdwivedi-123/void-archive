"use client";

import { Canvas } from "@react-three/fiber";
import { Experience } from "./Experience";

type ArchiveCanvasProps = {
  isSceneReady: boolean;
  reducedMotion: boolean;
};

export function ArchiveCanvas({
  isSceneReady,
  reducedMotion,
}: ArchiveCanvasProps) {
  return (
    <div className="absolute inset-0 z-10 h-screen w-screen overflow-hidden">
      <Canvas
        dpr={[1, 1.7]}
        shadows={false}
        camera={{ position: [0, 0.6, 8], fov: 42, near: 0.1, far: 80 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          outputColorSpace: "srgb",
        }}
        className="h-full w-full"
      >
        <Experience isSceneReady={isSceneReady} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
