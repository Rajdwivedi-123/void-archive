"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import type { MutableRefObject } from "react";

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
  { at: 0.18, position: [0.28, 2.3, 7.05], target: [0.48, 2.55, 0], roll: 0, fov: 40.5 },
  { at: 0.34, position: [3.85, 2.65, 4.15], target: [0.48, 2.55, 0], roll: -0.012, fov: 42 },
  { at: 0.48, position: [6.45, 2.85, -2.6], target: [6.75, 2.7, -14], roll: -0.009, fov: 43 },
  { at: 0.7, position: [6.8, 2.72, -43], target: [6.8, 2.68, -58], roll: 0, fov: 46 },
  { at: 0.86, position: [6.35, 3.5, -78], target: [5.75, 3.05, -96], roll: 0.007, fov: 44.5 },
  { at: 1, position: [5.05, 3.15, -101], target: [4.72, 3.05, -116], roll: 0, fov: 42 },
];

const mobileFrames: CameraKeyframe[] = desktopFrames.map((frame, index) => ({
  ...frame,
  position: index === 0
    ? [0, 2.28, 9.5]
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
