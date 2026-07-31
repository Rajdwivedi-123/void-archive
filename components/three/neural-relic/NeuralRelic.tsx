"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { MutableRefObject } from "react";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import { neuralRelicArtifact } from "@/artifacts/registry";
import { sampleArtifactLifecycle } from "@/artifacts/lifecycle";
import { neuralFragmentShader, neuralVertexShader } from "./shaders/neuralShaders";

type NeuralRelicProps = {
  tier: DeviceTier;
  reducedMotion: boolean;
  hasFinePointer: boolean;
  scrollProgress: MutableRefObject<number>;
};

type NodeDefinition = {
  position: [number, number, number];
  scale: [number, number, number];
  rank: "primary" | "secondary" | "micro";
  phase: number;
};

const nodes: NodeDefinition[] = [
  { position: [0, 0.1, 0], scale: [0.68, 0.82, 0.58], rank: "primary", phase: 0.1 },
  { position: [-0.75, 1.05, 0.08], scale: [0.48, 0.62, 0.42], rank: "primary", phase: 1.2 },
  { position: [-2.05, 1.85, -0.82], scale: [0.33, 0.42, 0.3], rank: "secondary", phase: 2.1 },
  { position: [0.75, 2.2, 0.68], scale: [0.38, 0.5, 0.32], rank: "secondary", phase: 3.4 },
  { position: [1.0, -0.85, -0.12], scale: [0.5, 0.64, 0.42], rank: "primary", phase: 4.2 },
  { position: [2.35, -1.25, 0.84], scale: [0.3, 0.4, 0.27], rank: "secondary", phase: 5.1 },
  { position: [1.55, 0.15, -0.64], scale: [0.27, 0.35, 0.24], rank: "secondary", phase: 2.8 },
  { position: [-1.15, -1.2, 0.18], scale: [0.42, 0.52, 0.34], rank: "primary", phase: 1.9 },
  { position: [-2.45, -1.7, -0.72], scale: [0.28, 0.38, 0.24], rank: "secondary", phase: 4.8 },
  { position: [-2.2, -0.45, 0.94], scale: [0.24, 0.31, 0.2], rank: "secondary", phase: 0.8 },
  { position: [-3.15, 2.62, -1.08], scale: [0.16, 0.22, 0.14], rank: "micro", phase: 3.1 },
  { position: [1.5, 3.15, 0.88], scale: [0.2, 0.28, 0.17], rank: "micro", phase: 4.4 },
  { position: [3.42, -1.85, 0.62], scale: [0.18, 0.24, 0.15], rank: "micro", phase: 5.7 },
  { position: [2.65, 0.72, -0.92], scale: [0.17, 0.23, 0.14], rank: "micro", phase: 2.3 },
  { position: [-3.5, -2.25, -0.82], scale: [0.18, 0.25, 0.14], rank: "micro", phase: 1.6 },
  { position: [-3.35, -0.18, 0.74], scale: [0.15, 0.21, 0.13], rank: "micro", phase: 0.4 },
  { position: [1.05, 4.05, 0.72], scale: [0.14, 0.2, 0.12], rank: "micro", phase: 3.8 },
  { position: [2.68, 1.75, -0.78], scale: [0.16, 0.22, 0.13], rank: "micro", phase: 5.4 },
];

const branchPairs: Array<[number, number]> = [
  [0, 1], [1, 2], [1, 3], [0, 4], [4, 5], [4, 6], [0, 7], [7, 8], [7, 9],
  [2, 10], [3, 11], [5, 12], [6, 13], [8, 14], [9, 15], [3, 16], [6, 17],
  [11, 17], [12, 13], [14, 15], [16, 17], [10, 13],
];

function makeCurve(fromIndex: number, toIndex: number, index: number) {
  const from = new THREE.Vector3(...nodes[fromIndex].position);
  const to = new THREE.Vector3(...nodes[toIndex].position);
  const firstBend = from.clone().lerp(to, 0.34);
  const secondBend = from.clone().lerp(to, 0.68);
  firstBend.x += Math.sin(index * 2.17) * 0.31;
  firstBend.y += Math.cos(index * 1.41) * 0.24;
  firstBend.z += (index % 2 ? 1 : -1) * (0.23 + (index % 3) * 0.07);
  secondBend.x -= Math.cos(index * 1.73) * 0.22;
  secondBend.y += Math.sin(index * 1.19) * 0.2;
  secondBend.z -= (index % 2 ? 1 : -1) * (0.16 + (index % 4) * 0.045);
  return new THREE.CatmullRomCurve3([from, firstBend, secondBend, to]);
}

const branchCurves = branchPairs.map(([from, to], index) => makeCurve(from, to, index));
const branchGeometries = branchCurves.map((curve, index) => {
  const primary = nodes[branchPairs[index][0]].rank === "primary" || nodes[branchPairs[index][1]].rank === "primary";
  const variation = (index % 4) * 0.005;
  return new THREE.TubeGeometry(curve, 28, primary ? 0.052 + variation : 0.022 + variation, 5, false);
});
const primaryGeometry = new THREE.IcosahedronGeometry(0.58, 1);
const secondaryGeometry = new THREE.IcosahedronGeometry(0.5, 1);
const microGeometry = new THREE.OctahedronGeometry(0.48, 0);
const signalGeometry = new THREE.SphereGeometry(0.075, 6, 6);
const signalRoutes = [0, 4, 7, 10, 13];

const smootherRange = (value: number, from: number, to: number) => THREE.MathUtils.smoothstep(value, from, to);

export function NeuralRelic({ tier, reducedMotion, hasFinePointer, scrollProgress }: NeuralRelicProps) {
  const rootRef = useRef<THREE.Group>(null);
  const nodeRefs = useRef<Array<THREE.Mesh | null>>([]);
  const branchRefs = useRef<Array<THREE.Group | null>>([]);
  const materialRefs = useRef<Array<THREE.ShaderMaterial | null>>([]);
  const signalRefs = useRef<Array<THREE.Mesh | null>>([]);
  const voidEchoMaterialRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const clusterRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const adaptationRef = useRef(0);
  const pointerRef = useRef(new THREE.Vector2());
  const signalVectorRef = useRef(new THREE.Vector3());
  const { pointer } = useThree();
  const quality = neuralRelicArtifact.quality[tier];
  const branchCount = quality.branchCount ?? 10;
  const signalCount = quality.signalCount ?? 2;
  const activeBranchIndices = useMemo(() => [...Array.from({ length: branchCount - 1 }, (_, index) => index), branchPairs.length - 1], [branchCount]);
  const activeNodeCount = tier === "desktop" ? 18 : tier === "tablet" ? 16 : 15;
  const uniforms = useMemo(() => activeBranchIndices.map((branchIndex) => ({
    uTime: { value: 0 },
    uGrowth: { value: 0 },
    uReveal: { value: 0 },
    uSignalSpeed: { value: 0.1 },
    uSignalOffset: { value: branchIndex * 0.137 },
    uResponse: { value: 0 },
  })), [activeBranchIndices]);

  useFrame((_, delta) => {
    if (!rootRef.current) return;
    const progress = scrollProgress.current;
    const lifecycle = sampleArtifactLifecycle(neuralRelicArtifact, progress);
    const motion = reducedMotion ? 0 : 1;
    timeRef.current += delta * motion;
    const observing = lifecycle.activation > 0.45;
    adaptationRef.current = THREE.MathUtils.damp(adaptationRef.current, observing ? 1 : 0, observing ? 0.32 : 2.5, delta);
    const adaptation = adaptationRef.current;
    const pointerEnabled = tier === "desktop" && hasFinePointer && !reducedMotion;
    pointerRef.current.x = THREE.MathUtils.damp(pointerRef.current.x, pointerEnabled ? pointer.x : 0, 3.2, delta);
    pointerRef.current.y = THREE.MathUtils.damp(pointerRef.current.y, pointerEnabled ? pointer.y : 0, 3.2, delta);

    activeBranchIndices.forEach((branchIndex, visibleIndex) => {
      const material = materialRefs.current[visibleIndex];
      if (!material) return;
      const isSignature = branchIndex === branchPairs.length - 1;
      const stagedReveal = isSignature
        ? smootherRange(progress, 0.797, 0.813)
        : THREE.MathUtils.clamp(lifecycle.activation * 1.55 - visibleIndex * 0.075, 0, 1);
      material.uniforms.uTime.value = timeRef.current;
      material.uniforms.uGrowth.value = reducedMotion ? lifecycle.activation * 0.35 : lifecycle.activation;
      material.uniforms.uReveal.value = stagedReveal;
      material.uniforms.uSignalSpeed.value = reducedMotion ? 0 : THREE.MathUtils.lerp(0.075, 0.24, adaptation);
      material.uniforms.uResponse.value = adaptation;
      const branch = branchRefs.current[visibleIndex];
      if (branch && branchIndex === 15) {
        branch.rotation.y = THREE.MathUtils.damp(branch.rotation.y, adaptation * 0.018 + pointerRef.current.x * 0.012, 2.4, delta);
      }
    });

    nodeRefs.current.forEach((node, index) => {
      if (!node) return;
      const reveal = index === 0
        ? Math.max(lifecycle.entry * 0.72, lifecycle.activation)
        : THREE.MathUtils.clamp(lifecycle.activation * 1.65 - index * 0.055, 0, 1);
      const attention = pointerEnabled ? Math.max(0, 1 - Math.abs(pointerRef.current.x - (nodes[index].position[0] / 4))) : 0;
      const pulse = reducedMotion ? 1 : 1 + Math.sin(timeRef.current * (0.68 + adaptation * 0.42) + nodes[index].phase) * 0.035 * lifecycle.activation;
      const scale = reveal * pulse * (1 + attention * adaptation * 0.025);
      node.scale.set(nodes[index].scale[0] * scale, nodes[index].scale[1] * scale, nodes[index].scale[2] * scale);
      node.visible = reveal > 0.001;
    });

    for (let index = 0; index < signalCount; index += 1) {
      const signal = signalRefs.current[index];
      if (!signal) continue;
      const route = signalRoutes[index];
      const speed = THREE.MathUtils.lerp(0.055, 0.18, adaptation);
      const position = reducedMotion ? 0.62 : (timeRef.current * speed + index * 0.21) % 1;
      branchCurves[route].getPointAt(position, signalVectorRef.current);
      signal.position.copy(signalVectorRef.current);
      const signalScale = lifecycle.activation * (0.6 + adaptation * 0.55);
      signal.scale.setScalar(signalScale);
      signal.visible = lifecycle.activation > 0.18;
    }

    const voidEcho = reducedMotion
      ? lifecycle.inspection * 0.18
      : smootherRange(progress, 0.802, 0.808) * (1 - smootherRange(progress, 0.814, 0.819));
    voidEchoMaterialRefs.current.forEach((material, index) => {
      if (material) material.opacity = voidEcho * (index === 1 ? 0.14 : 0.09);
    });

    rootRef.current.visible = lifecycle.visible > 0.001;
    const breath = reducedMotion ? 1 : 1 + Math.sin(timeRef.current * 0.55) * 0.007 * lifecycle.activation;
    rootRef.current.scale.setScalar((0.88 + lifecycle.entry * 0.12) * breath);
    rootRef.current.rotation.y = THREE.MathUtils.damp(rootRef.current.rotation.y, pointerRef.current.x * 0.01 * adaptation, 2.2, delta);
    rootRef.current.rotation.x = THREE.MathUtils.damp(rootRef.current.rotation.x, pointerRef.current.y * 0.006 * adaptation, 2.2, delta);
    if (clusterRef.current) {
      const clusterScale = lifecycle.activation * (reducedMotion ? 0.94 : 0.94 + Math.sin(timeRef.current * 0.62) * 0.018);
      clusterRef.current.scale.setScalar(clusterScale);
    }
  });

  return (
    <group ref={rootRef} position={[-2.5, 4.15, -220]} visible={false}>
      {activeBranchIndices.map((branchIndex, visibleIndex) => (
        <group key={branchIndex} ref={(group) => { branchRefs.current[visibleIndex] = group; }}>
          <mesh>
            <primitive attach="geometry" object={branchGeometries[branchIndex]} />
            <shaderMaterial ref={(material) => { materialRefs.current[visibleIndex] = material; }} vertexShader={neuralVertexShader} fragmentShader={neuralFragmentShader} uniforms={uniforms[visibleIndex]} transparent depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      {nodes.slice(0, activeNodeCount).map((node, index) => (
        <mesh key={index} ref={(mesh) => { nodeRefs.current[index] = mesh; }} position={node.position} rotation={[node.phase * 0.17, node.phase * 0.11, node.phase * 0.07]} visible={false}>
          <primitive attach="geometry" object={node.rank === "primary" ? primaryGeometry : node.rank === "secondary" ? secondaryGeometry : microGeometry} />
          <meshStandardMaterial color={node.rank === "primary" ? "#58605d" : node.rank === "secondary" ? "#343b39" : "#87908b"} metalness={0.54} roughness={0.38} emissive="#c8ccc3" emissiveIntensity={node.rank === "micro" ? 0.08 : 0.025} />
        </mesh>
      ))}
      <group ref={clusterRef} scale={0}>
        <mesh position={[-0.32, 0.24, 0.24]} rotation={[0.4, 0.2, -0.3]} scale={[0.42, 0.56, 0.38]}>
          <primitive attach="geometry" object={secondaryGeometry} />
          <meshStandardMaterial color="#2e3532" metalness={0.48} roughness={0.44} />
        </mesh>
        <mesh position={[0.26, -0.16, -0.34]} rotation={[-0.2, 0.5, 0.18]} scale={[0.38, 0.46, 0.34]}>
          <primitive attach="geometry" object={secondaryGeometry} />
          <meshStandardMaterial color="#424a46" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0.08, 0.46, -0.02]} rotation={[0.3, -0.35, 0.22]} scale={[0.28, 0.4, 0.26]}>
          <primitive attach="geometry" object={microGeometry} />
          <meshStandardMaterial color="#6d756f" metalness={0.44} roughness={0.42} emissive="#bfc3b8" emissiveIntensity={0.025} />
        </mesh>
      </group>
      {Array.from({ length: signalCount }, (_, index) => (
        <mesh key={index} ref={(mesh) => { signalRefs.current[index] = mesh; }} visible={false}>
          <primitive attach="geometry" object={signalGeometry} />
          <meshBasicMaterial color="#d6ddd8" transparent opacity={0.72} toneMapped={false} depthWrite={false} />
        </mesh>
      ))}
      <group position={[0.25, 0.18, -1.35]} rotation={[0.04, -0.08, 0.12]} scale={[1.42, 0.86, 1]}>
        {[0.18, 2.2, 4.22].map((rotation, index) => (
          <mesh key={rotation} rotation={[0, 0, rotation]}>
            <torusGeometry args={[2.72, index === 1 ? 0.016 : 0.01, 4, 34, 1.42]} />
            <meshBasicMaterial ref={(material) => { voidEchoMaterialRefs.current[index] = material; }} color="#aeb8b3" transparent opacity={0} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
