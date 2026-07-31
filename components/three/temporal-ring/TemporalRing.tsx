"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { MutableRefObject } from "react";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import { temporalRingArtifact } from "@/artifacts/registry";
import { sampleArtifactLifecycle } from "@/artifacts/lifecycle";
import { temporalFragmentShader, temporalVertexShader } from "./shaders/temporalShaders";

type TemporalRingProps = {
  tier: DeviceTier;
  reducedMotion: boolean;
  hasFinePointer: boolean;
  scrollProgress: MutableRefObject<number>;
};

type ArcDefinition = {
  radius: number;
  tube: number;
  arc: number;
  start: number;
  phase: number;
  rate: number;
  scale: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
};

const arcs: ArcDefinition[] = [
  { radius: 2.62, tube: 0.14, arc: 1.72, start: 0.08, phase: 0.2, rate: 0.31, scale: [1, 1, 1], position: [0, 0, 0], rotation: [0.08, 0.06, 0.18] },
  { radius: 2.62, tube: 0.105, arc: 1.18, start: 2.18, phase: 1.7, rate: -0.24, scale: [1, 1, 1], position: [0, 0, 0], rotation: [0.08, 0.06, 0.18] },
  { radius: 1.94, tube: 0.074, arc: 2.16, start: 0.68, phase: 2.8, rate: 0.39, scale: [1.2, 0.8, 1], position: [0.05, -0.04, 0.05], rotation: [-0.12, 0.18, -0.08] },
  { radius: 1.94, tube: 0.048, arc: 0.94, start: 3.4, phase: 4.1, rate: -0.34, scale: [1.2, 0.8, 1], position: [0.05, -0.04, 0.05], rotation: [-0.12, 0.18, -0.08] },
  { radius: 1.26, tube: 0.032, arc: 2.36, start: 1.24, phase: 5.2, rate: 0.48, scale: [0.86, 1.24, 1], position: [-0.08, 0.03, 0.12], rotation: [0.22, -0.08, 0.32] },
  { radius: 0.76, tube: 0.018, arc: 3.12, start: 0.42, phase: 3.45, rate: -0.57, scale: [1.32, 0.68, 1], position: [0.08, 0.02, 0.18], rotation: [-0.18, 0.14, -0.22] },
];

// Each arc geometry is shared by its present and sampled-time meshes.
const arcGeometries = arcs.map((arc) => new THREE.TorusGeometry(arc.radius, arc.tube, 8, 48, arc.arc));
const futureSliceGeometry = new THREE.TorusGeometry(2.88, 0.026, 6, 36, 0.76);
const futureColor = new THREE.Color("#dbe5e6");
const pastColors = [new THREE.Color("#788487"), new THREE.Color("#505d60"), new THREE.Color("#374144")];

const smoothRange = (value: number, from: number, to: number) => THREE.MathUtils.smoothstep(value, from, to);

function applyArcState(group: THREE.Group, arc: ArcDefinition, time: number, separation: number, future: number) {
  const phase = time * arc.rate + arc.phase;
  const drift = Math.sin(phase) * (0.035 + separation * 0.075);
  group.position.set(
    arc.position[0] + Math.cos(phase * 0.73) * separation * 0.055,
    arc.position[1] + Math.sin(phase * 0.61) * separation * 0.045,
    arc.position[2] + drift + future * Math.sin(arc.phase) * 0.06,
  );
  group.rotation.set(
    arc.rotation[0] + Math.sin(phase * 0.41) * 0.018,
    arc.rotation[1] + Math.cos(phase * 0.52) * 0.025,
    arc.rotation[2] + arc.start + phase * (0.085 + future * 0.035),
  );
}

export function TemporalRing({ tier, reducedMotion, hasFinePointer, scrollProgress }: TemporalRingProps) {
  const rootRef = useRef<THREE.Group>(null);
  const currentRefs = useRef<Array<THREE.Group | null>>([]);
  const materialRefs = useRef<Array<THREE.ShaderMaterial | null>>([]);
  const echoRefs = useRef<Array<Array<THREE.Group | null>>>([]);
  const futureSliceRef = useRef<THREE.Group>(null);
  const futureSliceMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const timeRef = useRef(0.8);
  const timeScaleRef = useRef(1);
  const pointerRef = useRef(new THREE.Vector2());
  const { pointer } = useThree();
  const quality = temporalRingArtifact.quality[tier];
  const activeArcs = arcs.slice(0, quality.temporalSegments ?? 4);
  const echoCount = quality.echoSamples ?? 1;
  const uniforms = useMemo(() => activeArcs.map((arc) => ({
    uTime: { value: 0 },
    uPhase: { value: arc.phase },
    uActivation: { value: 0 },
    uFuture: { value: 0 },
    uHighlight: { value: arc.radius > 2.5 ? 1 : arc.radius > 1.5 ? 0.62 : 0.28 },
    uOpacity: { value: 1 },
  })), [activeArcs]);

  useFrame((_, delta) => {
    if (!rootRef.current) return;
    const progress = scrollProgress.current;
    const lifecycle = sampleArtifactLifecycle(temporalRingArtifact, progress);
    const slowIn = smoothRange(progress, 0.704, 0.718);
    const slowOut = smoothRange(progress, 0.726, 0.742);
    const slow = slowIn * (1 - slowOut);
    const future = smoothRange(progress, 0.708, 0.724) * (1 - smoothRange(progress, 0.732, 0.746));
    const catchUp = smoothRange(progress, 0.728, 0.748);
    const collapse = smoothRange(progress, 0.744, 0.758);
    const targetTimeScale = reducedMotion ? 0 : THREE.MathUtils.lerp(1, 0.08, slow);
    timeScaleRef.current = THREE.MathUtils.damp(timeScaleRef.current, targetTimeScale, 5, delta);
    timeRef.current += delta * timeScaleRef.current;

    const pointerEnabled = hasFinePointer && tier === "desktop" && !reducedMotion;
    pointerRef.current.x = THREE.MathUtils.damp(pointerRef.current.x, pointerEnabled ? pointer.x : 0, 4.5, delta);
    pointerRef.current.y = THREE.MathUtils.damp(pointerRef.current.y, pointerEnabled ? pointer.y : 0, 4.5, delta);
    const separation = lifecycle.activation * (0.24 + lifecycle.inspection * 0.42) * (1 - collapse);
    const currentTime = timeRef.current + catchUp * 0.52;

    activeArcs.forEach((arc, arcIndex) => {
      const current = currentRefs.current[arcIndex];
      const material = materialRefs.current[arcIndex];
      if (current) {
        applyArcState(current, arc, currentTime + pointerRef.current.x * 0.08, separation, 0);
        current.position.y += pointerRef.current.y * 0.035 * (quality.pointerStrength || 0);
      }
      if (material) {
        material.uniforms.uTime.value = currentTime;
        material.uniforms.uActivation.value = Math.max(lifecycle.entry * 0.38, lifecycle.activation);
        material.uniforms.uFuture.value = future;
        material.uniforms.uOpacity.value = 0.88 + lifecycle.inspection * 0.12;
      }
      for (let echoIndex = 0; echoIndex < echoCount; echoIndex += 1) {
        const echo = echoRefs.current[echoIndex]?.[arcIndex];
        if (!echo) continue;
        const isFutureSample = echoIndex === echoCount - 1;
        const sampledTime = isFutureSample && future > 0.01
          ? currentTime + 0.78 * future
          : currentTime - (echoIndex + 1) * (0.34 + separation * 0.22);
        applyArcState(echo, arc, sampledTime, separation + echoIndex * 0.07, isFutureSample ? future : 0);
        echo.position.x += Math.cos(arc.phase) * separation * (echoIndex + 1) * 0.11;
        echo.position.y -= Math.sin(arc.phase * 0.7) * separation * (echoIndex + 1) * 0.046;
        echo.rotation.z -= separation * (echoIndex + 1) * 0.09;
        const echoMesh = echo.children[0] as THREE.Mesh | undefined;
        const echoMaterial = echoMesh?.material as THREE.MeshBasicMaterial | undefined;
        if (echoMaterial) {
          const baseOpacity = (reducedMotion ? 0.26 : 0.21) / (1 + echoIndex * 0.72);
          echoMaterial.color.copy(isFutureSample && future > 0.02 ? futureColor : pastColors[Math.min(echoIndex, pastColors.length - 1)]);
          echoMaterial.opacity = lifecycle.activation * (baseOpacity + (isFutureSample ? future * 0.26 : 0)) * (1 - collapse);
        }
      }
    });

    if (futureSliceRef.current && futureSliceMaterialRef.current) {
      const futurePresence = lifecycle.activation * (0.06 + future * 0.94) * (1 - collapse);
      futureSliceRef.current.position.set(0.28 + future * 0.34, 0.16 + future * 0.12, 0.42);
      futureSliceRef.current.rotation.set(-0.1, 0.12, 0.72 + currentTime * 0.045 + future * 0.2);
      futureSliceRef.current.scale.setScalar(0.96 + future * 0.05);
      futureSliceMaterialRef.current.opacity = futurePresence * (reducedMotion ? 0.42 : 0.58);
    }

    rootRef.current.visible = lifecycle.visible > 0.001;
    rootRef.current.scale.setScalar(0.9 + lifecycle.entry * 0.1);
    rootRef.current.rotation.y = THREE.MathUtils.damp(rootRef.current.rotation.y, pointerRef.current.x * 0.018, 4, delta);
  });

  return (
    <group ref={rootRef} position={[11.5, 3.35, -170]} visible={false}>
      {activeArcs.map((arc, arcIndex) => (
        <group key={`current-${arcIndex}`} ref={(group) => { currentRefs.current[arcIndex] = group; }}>
          <mesh scale={arc.scale}>
            <primitive attach="geometry" object={arcGeometries[arcIndex]} />
            <shaderMaterial ref={(material) => { materialRefs.current[arcIndex] = material; }} vertexShader={temporalVertexShader} fragmentShader={temporalFragmentShader} uniforms={uniforms[arcIndex]} transparent depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: echoCount }, (_, echoIndex) => (
        <group key={`echo-${echoIndex}`}>
          {activeArcs.map((arc, arcIndex) => (
            <group key={arcIndex} ref={(group) => {
              echoRefs.current[echoIndex] ??= [];
              echoRefs.current[echoIndex][arcIndex] = group;
            }}>
              <mesh scale={arc.scale}>
                <primitive attach="geometry" object={arcGeometries[arcIndex]} />
                <meshBasicMaterial color="#647276" transparent opacity={0} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      <group ref={futureSliceRef}>
        <mesh>
          <primitive attach="geometry" object={futureSliceGeometry} />
          <meshBasicMaterial ref={futureSliceMaterialRef} color="#dbe5e6" transparent opacity={0} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {[-1.45, -0.72, 0, 0.72, 1.45].map((x, index) => (
        <mesh key={x} position={[x, index % 2 ? 0.12 : -0.14, 0.25]} rotation={[0, 0, index % 2 ? 0.06 : -0.04]}>
          <boxGeometry args={[0.018, index === 2 ? 0.68 : 0.42, 0.018]} />
          <meshBasicMaterial color="#aab6b8" transparent opacity={index === 2 ? 0.54 : 0.25} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
