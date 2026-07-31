"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { sampleArtifactLifecycle } from "@/artifacts/lifecycle";
import { voidArtifact } from "@/artifacts/registry";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import {
  voidFragmentShader,
  voidParticleFragmentShader,
  voidParticleVertexShader,
  voidVertexShader,
} from "./shaders/voidShaders";
import type { InspectionControlRef } from "@/artifacts/inspection";

type VoidArtifactProps = {
  tier: DeviceTier;
  reducedMotion: boolean;
  hasFinePointer: boolean;
  scrollProgress: MutableRefObject<number>;
  inspection: InspectionControlRef;
};

const boundaryPoints = [
  new THREE.Vector2(-2.08, -2.72),
  new THREE.Vector2(-0.72, -3.12),
  new THREE.Vector2(0.52, -2.62),
  new THREE.Vector2(1.72, -2.14),
  new THREE.Vector2(2.32, -0.78),
  new THREE.Vector2(1.82, 0.35),
  new THREE.Vector2(2.08, 1.68),
  new THREE.Vector2(0.66, 2.78),
  new THREE.Vector2(-0.58, 2.42),
  new THREE.Vector2(-1.78, 2.76),
  new THREE.Vector2(-2.58, 1.38),
  new THREE.Vector2(-2.26, 0.18),
  new THREE.Vector2(-2.72, -0.92),
];

const seamDefinitions: Array<Array<[number, number, number]>> = [
  [[-2.62, -0.88, 0.08], [-2.86, -0.18, 0.1], [-2.5, 0.46, 0.07]],
  [[-2.45, 1.46, 0.06], [-2.12, 2.22, 0.09], [-1.68, 2.7, 0.04]],
  [[-0.9, 2.53, 0.04], [-0.22, 2.72, 0.08], [0.5, 2.77, 0.04]],
  [[1.1, 2.3, 0.06], [1.95, 1.76, 0.1], [2.04, 1.14, 0.05]],
  [[2.13, 0.5, 0.05], [2.34, -0.16, 0.09], [2.26, -0.74, 0.04]],
  [[1.68, -2.02, 0.04], [1.12, -2.48, 0.09], [0.46, -2.66, 0.04]],
  [[-0.34, -2.82, 0.04], [-1.06, -3.08, 0.08], [-1.76, -2.82, 0.04]],
];

const seamGeometries = seamDefinitions.map((points, index) => {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
  return new THREE.TubeGeometry(curve, 12, index % 3 === 0 ? 0.018 : 0.011, 4, false);
});

const smoothRange = (value: number, from: number, to: number) => THREE.MathUtils.smoothstep(value, from, to);

export function VoidArtifact({ tier, reducedMotion, hasFinePointer, scrollProgress, inspection }: VoidArtifactProps) {
  const rootRef = useRef<THREE.Group>(null);
  const boundaryRef = useRef<THREE.Mesh>(null);
  const boundaryMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const seamMaterialRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const particlesGeometryRef = useRef<THREE.BufferGeometry>(null);
  const particlesMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const timeRef = useRef(0);
  const pointerRef = useRef(new THREE.Vector2());
  const { pointer } = useThree();
  const quality = voidArtifact.quality[tier];
  const particleCount = quality.voidParticles ?? 20;
  const seamCount = quality.fractureSeams ?? 4;

  const shapeGeometry = useMemo(() => {
    const shape = new THREE.Shape(boundaryPoints);
    const geometry = new THREE.ShapeGeometry(shape, 1);
    geometry.computeBoundingBox();
    return geometry;
  }, []);

  const particleData = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const base = Array.from({ length: particleCount }, (_, index) => {
      const angle = (index / particleCount) * Math.PI * 2 + Math.sin(index * 12.37) * 0.8;
      const radius = 3.1 + ((index * 29) % 17) / 17 * 3.8;
      return {
        angle,
        radius,
        height: -2.9 + ((index * 43) % 101) / 101 * 6.3,
        depth: -1.5 + ((index * 61) % 97) / 97 * 3,
        speed: 0.018 + (index % 7) * 0.004,
      };
    });
    return { positions, base };
  }, [particleCount]);

  const boundaryUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uActivation: { value: 0 },
    uCollapse: { value: 0 },
    uOpacity: { value: 0 },
    uPointer: { value: new THREE.Vector2() },
  }), []);
  const particleUniforms = useMemo(() => ({
    uSize: { value: tier === "mobile" ? 0.58 : 0.72 },
    uOpacity: { value: 0 },
  }), [tier]);

  useFrame((_, delta) => {
    if (!rootRef.current || !boundaryMaterialRef.current) return;
    const progress = scrollProgress.current;
    const lifecycle = sampleArtifactLifecycle(voidArtifact, progress);
    const inspecting = inspection.current.active && inspection.current.artifactId === "005";
    const activation = Math.max(lifecycle.activation, inspecting ? 1 : 0);
    const inspectionAmount = Math.max(lifecycle.inspection, inspecting ? 1 : 0);
    const signatureIn = smoothRange(progress, 0.899, 0.905);
    const signatureOut = smoothRange(progress, 0.907, 0.913);
    const collapse = signatureIn * (1 - signatureOut);
    const motion = reducedMotion ? 0 : 1;
    if (!inspection.current.freezeActive) timeRef.current += delta * motion;

    const pointerEnabled = tier === "desktop" && hasFinePointer && !reducedMotion;
    pointerRef.current.x = THREE.MathUtils.damp(pointerRef.current.x, inspecting ? inspection.current.pointerX : pointerEnabled ? pointer.x : 0, 1.8, delta);
    pointerRef.current.y = THREE.MathUtils.damp(pointerRef.current.y, inspecting ? inspection.current.pointerY : pointerEnabled ? pointer.y : 0, 1.8, delta);

    const material = boundaryMaterialRef.current;
    material.uniforms.uTime.value = timeRef.current;
    material.uniforms.uActivation.value = Math.max(lifecycle.entry * 0.4, activation);
    material.uniforms.uCollapse.value = reducedMotion ? 0.32 * lifecycle.inspection : collapse;
    material.uniforms.uOpacity.value = lifecycle.visible * (0.78 + lifecycle.activation * 0.21);
    material.uniforms.uPointer.value.copy(pointerRef.current).multiplyScalar(quality.pointerStrength);

    if (boundaryRef.current) {
      const scale = 0.88 + lifecycle.entry * 0.12 + (reducedMotion ? lifecycle.inspection * 0.025 : collapse * 0.11);
      boundaryRef.current.scale.set(scale * (1 + pointerRef.current.x * 0.004), scale, 1);
      boundaryRef.current.position.x = pointerRef.current.x * -0.028;
    }

    seamMaterialRefs.current.forEach((seamMaterial, index) => {
      if (!seamMaterial) return;
      const staged = THREE.MathUtils.clamp(lifecycle.entry * 2.1 - index * 0.13, 0, 1);
      const breakPattern = index % 2 ? 0.58 : 1;
      seamMaterial.opacity = Math.max(staged, inspecting ? 1 : 0) * (0.08 + activation * 0.28 + collapse * 0.24 + (inspecting && inspection.current.scanner ? 0.18 : 0)) * breakPattern;
    });

    const positions = particleData.positions;
    particleData.base.forEach((particle, index) => {
      const drift = reducedMotion ? particle.angle : particle.angle + timeRef.current * particle.speed;
      const inward = activation * (0.42 + Math.sin(particle.angle * 2.1) * 0.12);
      const bentAngle = drift + inward * Math.sin(drift * 1.7) * 0.52;
      let radius = particle.radius - inward * 0.9;
      const swallowed = radius < 3.34 && activation > 0.48;
      if (swallowed) radius = 0;
      const offset = index * 3;
      positions[offset] = swallowed ? 100 : Math.cos(bentAngle) * radius + Math.sin(particle.height) * inward * 0.34;
      positions[offset + 1] = swallowed ? 100 : particle.height + Math.cos(drift * 1.3) * inward * 0.28;
      positions[offset + 2] = swallowed ? 100 : particle.depth - Math.sin(bentAngle) * inward * 0.5;
    });
    if (particlesGeometryRef.current) particlesGeometryRef.current.attributes.position.needsUpdate = true;
    if (particlesMaterialRef.current) particlesMaterialRef.current.uniforms.uOpacity.value = activation * (0.12 + inspectionAmount * 0.18 + (inspecting && inspection.current.scanner ? 0.12 : 0));

    rootRef.current.visible = lifecycle.visible > 0.001 || inspecting;
    rootRef.current.rotation.y = THREE.MathUtils.damp(rootRef.current.rotation.y, -0.055 + pointerRef.current.x * 0.006, 2.2, delta);
  });

  return (
    <group ref={rootRef} position={[5.3, 4.25, -282]} visible={false}>
      <mesh position={[-0.16, 0.1, -0.08]} scale={[1.045, 1.035, 1]}>
        <primitive attach="geometry" object={shapeGeometry} />
        <meshBasicMaterial color="#0b0d0c" transparent opacity={0.045} depthWrite={false} />
      </mesh>
      <mesh ref={boundaryRef} renderOrder={3}>
        <primitive attach="geometry" object={shapeGeometry} />
        <shaderMaterial
          ref={boundaryMaterialRef}
          vertexShader={voidVertexShader}
          fragmentShader={voidFragmentShader}
          uniforms={boundaryUniforms}
          transparent
          depthWrite
          side={THREE.DoubleSide}
        />
      </mesh>
      {seamGeometries.slice(0, seamCount).map((geometry, index) => (
        <mesh key={index} renderOrder={4}>
          <primitive attach="geometry" object={geometry} />
          <meshBasicMaterial
            ref={(material) => { seamMaterialRefs.current[index] = material; }}
            color={index % 3 === 0 ? "#aeb4af" : "#66706b"}
            transparent
            opacity={0}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      ))}
      <points renderOrder={5}>
        <bufferGeometry ref={particlesGeometryRef}>
          <bufferAttribute attach="attributes-position" args={[particleData.positions, 3]} />
        </bufferGeometry>
        <shaderMaterial
          ref={particlesMaterialRef}
          vertexShader={voidParticleVertexShader}
          fragmentShader={voidParticleFragmentShader}
          uniforms={particleUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
