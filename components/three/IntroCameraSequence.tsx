"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type IntroCameraSequenceProps = {
  isSceneReady: boolean;
  reducedMotion: boolean;
  onIntroComplete: () => void;
};

export function IntroCameraSequence({
  isSceneReady,
  reducedMotion,
  onIntroComplete,
}: IntroCameraSequenceProps) {
  const { camera } = useThree();
  const hasStartedRef = useRef(false);
  const introCompleteRef = useRef(false);
  const lookAtTarget = useMemo(() => new THREE.Vector3(0.18, 2.4, -0.16), []);

  useEffect(() => {
    if (!isSceneReady || hasStartedRef.current) return;

    hasStartedRef.current = true;
    camera.position.set(0, 2.6, 18);
    camera.lookAt(lookAtTarget);

    if (reducedMotion) {
      camera.position.set(0.12, 2.2, 8.62);
      camera.lookAt(lookAtTarget);
      introCompleteRef.current = true;
      onIntroComplete();
      return;
    }

    const timeline = gsap.timeline({
      onComplete: () => {
        introCompleteRef.current = true;
        onIntroComplete();
      },
    });

    timeline
      .to(
        camera.position,
        {
          duration: 1.8,
          x: 0.18,
          y: 2.1,
          z: 12.2,
          ease: "power2.inOut",
        },
        0,
      )
      .to(
        camera.position,
        {
          duration: 1.6,
          x: 0.12,
          y: 2.2,
          z: 8.62,
          ease: "power2.out",
        },
        1.7,
      )
      .to(
        lookAtTarget,
        {
          duration: 1.4,
          x: 0.18,
          y: 2.4,
          z: -0.16,
          ease: "power2.inOut",
        },
        1.7,
      );
  }, [camera, isSceneReady, reducedMotion, lookAtTarget, onIntroComplete]);

  useFrame(() => {
    if (!introCompleteRef.current) {
      camera.lookAt(lookAtTarget);
    }
  });

  return null;
}
