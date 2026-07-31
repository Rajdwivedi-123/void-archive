"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import type { MutableRefObject } from "react";
import { liquidMirrorArtifact, memoryCrystalArtifact, neuralRelicArtifact, temporalRingArtifact, voidArtifact } from "@/artifacts/registry";

type JourneyCameraProps = {
  introComplete: boolean;
  reducedMotion: boolean;
  scrollProgress: MutableRefObject<number>;
  tier: DeviceTier;
};

type CameraKeyframe = {
  at: number;
  position: [number, number, number];
  target: [number, number, number];
  roll: number;
  fov: number;
};

const desktopFrames: CameraKeyframe[] = [
  { at: 0, position: [0.12, 2.2, 8.62], target: [0.18, 2.4, -0.16], roll: 0, fov: 42 },
  { at: 0.08, position: [0.28, 2.3, 7.05], target: [0.48, 2.55, 0], roll: 0, fov: 40.5 },
  { at: 0.15, position: [3.85, 2.65, 4.15], target: [0.48, 2.55, 0], roll: -0.012, fov: 42 },
  { at: 0.23, position: [6.45, 2.85, -2.6], target: [6.75, 2.7, -14], roll: -0.009, fov: 43 },
  { at: 0.33, position: [6.8, 2.72, -43], target: [6.8, 2.68, -58], roll: 0, fov: 46 },
  { at: 0.39, position: [6.35, 3.5, -78], target: [5.75, 3.05, -96], roll: 0.007, fov: 44.5 },
  { at: liquidMirrorArtifact.camera.entryAt, position: [5.15, 3.28, -100.5], target: [4.72, 3.1, -116], roll: 0, fov: 43 },
  { at: 0.5, position: [3.58, 3.35, -104], target: [4.66, 3.08, -116], roll: -0.006, fov: 41.5 },
  { at: liquidMirrorArtifact.camera.inspectionAt, position: [3.18, 3.05, -105.2], target: [4.74, 3.12, -116], roll: 0.004, fov: 40.5 },
  { at: 0.57, position: [5.86, 3.12, -106], target: [4.5, 3.06, -116], roll: 0, fov: 41 },
  { at: 0.585, position: [9.65, 3.05, -112.5], target: [11.45, 2.9, -130], roll: -0.008, fov: 44 },
  { at: 0.6, position: [11.45, 2.8, -140], target: [11.5, 2.9, -158], roll: 0, fov: 46 },
  { at: temporalRingArtifact.camera.entryAt, position: [10.25, 3.25, -156.2], target: [11.5, 3.35, -170], roll: 0.006, fov: 43 },
  { at: 0.645, position: [9.8, 3.15, -157], target: [11.5, 3.35, -170], roll: -0.004, fov: 41.5 },
  { at: temporalRingArtifact.camera.inspectionAt, position: [9.65, 3.05, -157.4], target: [11.5, 3.35, -170], roll: 0.003, fov: 40.5 },
  { at: 0.695, position: [13.25, 3.2, -158], target: [11.5, 3.32, -170], roll: 0, fov: 41 },
  { at: 0.705, position: [13.6, 3.1, -174], target: [9.8, 3.3, -190], roll: -0.004, fov: 44 },
  { at: 0.72, position: [7.8, 3.45, -194], target: [1.2, 3.8, -210], roll: 0, fov: 46 },
  { at: neuralRelicArtifact.camera.entryAt, position: [0.65, 4.75, -207.2], target: [-2.5, 4.05, -220], roll: 0.004, fov: 43.5 },
  { at: 0.77, position: [-0.15, 5.15, -207.8], target: [-2.75, 4.2, -220], roll: -0.003, fov: 41.5 },
  { at: neuralRelicArtifact.camera.inspectionAt, position: [-0.55, 4.85, -207.4], target: [-2.65, 4.12, -220], roll: 0, fov: 40.5 },
  { at: 0.812, position: [-5.4, 4.55, -207.1], target: [-2.45, 4.15, -220], roll: 0.003, fov: 41.5 },
  { at: 0.82, position: [-3.8, 4.25, -225], target: [1.1, 3.8, -242], roll: -0.003, fov: 44 },
  { at: 0.83, position: [1.4, 3.5, -249.5], target: [5.1, 4.0, -270], roll: 0, fov: 46 },
  { at: voidArtifact.camera.entryAt, position: [2.7, 4.15, -265.8], target: [5.3, 4.25, -282], roll: 0.004, fov: 43 },
  { at: 0.88, position: [1.45, 3.95, -266.4], target: [5.15, 4.15, -282], roll: -0.004, fov: 41 },
  { at: voidArtifact.camera.inspectionAt, position: [0.65, 4.05, -266.1], target: [5.28, 4.2, -282], roll: 0.002, fov: 40 },
  { at: 0.904, position: [1.8, 4.0, -267.2], target: [5.35, 4.2, -282], roll: -0.006, fov: 37.5 },
  { at: 0.912, position: [-0.2, 3.85, -266.3], target: [5.22, 4.15, -282], roll: 0.004, fov: 41.5 },
  { at: 0.915, position: [3.6, 4.0, -291], target: [2.4, 4.2, -308], roll: 0.001, fov: 43.5 },
  { at: 0.925, position: [2.1, 4.25, -315], target: [3.7, 4.5, -334], roll: 0, fov: 45 },
  { at: memoryCrystalArtifact.camera.entryAt, position: [0.4, 4.35, -334], target: [4.2, 4.65, -350], roll: 0.002, fov: 43 },
  { at: 0.96, position: [0.15, 4.95, -334.5], target: [4.15, 4.85, -350], roll: 0, fov: 41.5 },
  { at: memoryCrystalArtifact.camera.inspectionAt, position: [-0.4, 5.45, -334.1], target: [4.15, 5.05, -350], roll: -0.002, fov: 40.5 },
  { at: 0.99, position: [0.8, 5.9, -335], target: [4.25, 5.1, -350], roll: 0.001, fov: 40 },
  { at: 1, position: [-0.2, 6.2, -334.7], target: [4.15, 5.15, -350], roll: 0, fov: 41 },
];

const mobileFrames: CameraKeyframe[] = desktopFrames.map((frame, index) => ({
  ...frame,
  position: index === 0
    ? [0, 2.28, 9.5]
    : frame.at >= memoryCrystalArtifact.camera.entryAt
      ? [4.2, frame.position[1] + 0.25, frame.position[2] - 1.4]
      : frame.at >= voidArtifact.camera.entryAt
      ? [5.3, frame.position[1] + 0.35, frame.position[2] - 1.5]
      : frame.at >= neuralRelicArtifact.camera.entryAt
      ? [-2.5, frame.position[1] + 0.22, frame.position[2] - 0.5]
      : frame.at >= temporalRingArtifact.camera.entryAt
        ? [11.5, frame.position[1] + 0.18, frame.position[2] - 0.35]
      : frame.at >= liquidMirrorArtifact.camera.entryAt
        ? [4.72, frame.position[1] + 0.18, frame.position[2] - 0.35]
      : [frame.position[0], frame.position[1] + (index > 3 ? 0.15 : 0), frame.position[2]],
  roll: 0,
  fov: index > 3 ? 48 : 44,
}));

function interpolateFrame(frames: CameraKeyframe[], progress: number, position: THREE.Vector3, target: THREE.Vector3) {
  let index = 0;
  while (index < frames.length - 2 && progress > frames[index + 1].at) index += 1;
  const from = frames[index];
  const to = frames[index + 1];
  const local = THREE.MathUtils.clamp((progress - from.at) / Math.max(to.at - from.at, 0.001), 0, 1);
  const eased = THREE.MathUtils.smootherstep(local, 0, 1);
  position.set(
    THREE.MathUtils.lerp(from.position[0], to.position[0], eased),
    THREE.MathUtils.lerp(from.position[1], to.position[1], eased),
    THREE.MathUtils.lerp(from.position[2], to.position[2], eased),
  );
  target.set(
    THREE.MathUtils.lerp(from.target[0], to.target[0], eased),
    THREE.MathUtils.lerp(from.target[1], to.target[1], eased),
    THREE.MathUtils.lerp(from.target[2], to.target[2], eased),
  );
  return {
    roll: THREE.MathUtils.lerp(from.roll, to.roll, eased),
    fov: THREE.MathUtils.lerp(from.fov, to.fov, eased),
  };
}

export function JourneyCamera({ introComplete, reducedMotion, scrollProgress, tier }: JourneyCameraProps) {
  const { pointer } = useThree();
  const smoothedProgressRef = useRef(0);
  const vectorsRef = useRef({
    desiredPosition: new THREE.Vector3(),
    desiredTarget: new THREE.Vector3(),
    smoothedTarget: new THREE.Vector3(0.18, 2.4, -0.16),
  });

  useFrame((state, delta) => {
    if (!introComplete) return;
    const { desiredPosition, desiredTarget, smoothedTarget } = vectorsRef.current;
    const damping = reducedMotion ? 12 : tier === "mobile" ? 7.5 : 5.2;
    smoothedProgressRef.current = THREE.MathUtils.damp(smoothedProgressRef.current, scrollProgress.current, damping, delta);
    const frames = tier === "mobile" ? mobileFrames : desktopFrames;
    const composition = interpolateFrame(frames, smoothedProgressRef.current, desiredPosition, desiredTarget);
    const inspectionInfluence = THREE.MathUtils.clamp(1 - smoothedProgressRef.current / 0.28, 0, 1);
    if (!reducedMotion && tier === "desktop") {
      desiredPosition.x += pointer.x * 0.045 * inspectionInfluence;
      desiredPosition.y += pointer.y * 0.02 * inspectionInfluence;
    }
    const positionAlpha = 1 - Math.exp(-delta * (reducedMotion ? 12 : 7));
    state.camera.position.lerp(desiredPosition, positionAlpha);
    smoothedTarget.lerp(desiredTarget, positionAlpha);
    state.camera.lookAt(smoothedTarget);
    if (!reducedMotion && composition.roll !== 0) state.camera.rotateZ(composition.roll);
    if (state.camera instanceof THREE.PerspectiveCamera) {
      const nextFov = THREE.MathUtils.damp(state.camera.fov, composition.fov, 6, delta);
      if (Math.abs(nextFov - state.camera.fov) > 0.001) {
        state.camera.fov = nextFov;
        state.camera.updateProjectionMatrix();
      }
    }
  });

  return null;
}
