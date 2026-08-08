"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { NexusInteractionId } from "@/game/gameTypes";
import { n07AreaOrder, type N07Area, type N07LevelProgress } from "@/game/n07Level";

export type N07RuntimeEvent = "topology-observed" | "topology-unobserved" | "stillness" | "future-self";

const metal = { color: "#0a0f10", metalness: .94, roughness: .25 };

function Volume({ id, position, size = [2.6, 3, 2.2] }: { id: NexusInteractionId; position: [number, number, number]; size?: [number, number, number] }) {
  return <mesh position={position} userData={{ interactionId: id }}><boxGeometry args={size} /><meshBasicMaterial transparent opacity={.001} depthWrite={false} /></mesh>;
}

function LightSeam({ position, scale, opacity = .3, rotation = [0, 0, 0] }: { position: [number, number, number]; scale: [number, number, number]; opacity?: number; rotation?: [number, number, number] }) {
  return <mesh position={position} rotation={rotation}><boxGeometry args={scale} /><meshBasicMaterial color="#d6dedc" transparent opacity={opacity} toneMapped={false} /></mesh>;
}

function Shell({ z, length, children }: { z: number; length: number; children: React.ReactNode }) {
  return <group>
    <mesh position={[0, -.18, z]}><boxGeometry args={[22, .36, length]} /><meshPhysicalMaterial {...metal} /></mesh>
    <mesh position={[-10.7, 4.2, z]}><boxGeometry args={[.5, 8.8, length]} /><meshStandardMaterial {...metal} roughness={.32} /></mesh>
    <mesh position={[10.7, 4.2, z]}><boxGeometry args={[.5, 8.8, length]} /><meshStandardMaterial {...metal} roughness={.32} /></mesh>
    {[z - length / 2 + .5, z, z + length / 2 - .5].map((frameZ) => <group key={frameZ} position={[0, 0, frameZ]}>
      <mesh position={[-6.2, 3.6, 0]}><boxGeometry args={[.5, 7.4, .65]} /><meshStandardMaterial {...metal} /></mesh>
      <mesh position={[6.2, 3.6, 0]}><boxGeometry args={[.5, 7.4, .65]} /><meshStandardMaterial {...metal} /></mesh>
      <mesh position={[0, 7.05, 0]}><boxGeometry args={[12.8, .45, .65]} /><meshStandardMaterial {...metal} /></mesh>
      <LightSeam position={[0, 6.77, .34]} scale={[8.2, .025, .02]} opacity={.22} />
    </group>)}
    {children}
  </group>;
}

function Threshold({ visible, returning }: { visible: boolean; returning: boolean }) {
  if (!visible) return null;
  return <Shell z={9} length={14}>
    <pointLight color="#abb6b6" intensity={5} position={[0, 3, 9]} distance={13} />
    <mesh position={[0, 3.2, 3.6]}><boxGeometry args={[8.5, 6.4, .12]} /><meshBasicMaterial color="#c4cfcd" transparent opacity={.045} /></mesh>
    <LightSeam position={[0, 3.2, 3.68]} scale={[.035, 5.3, .02]} opacity={.78} />
    {returning && <group position={[0, .06, 7]} rotation={[-Math.PI / 2, 0, .18]}>{[1.5, 2.7, 4].map((r, i) => <mesh key={r}><ringGeometry args={[r, r + .025, 56]} /><meshBasicMaterial color="#c5cecc" transparent opacity={.34 - i * .08} /></mesh>)}</group>}
    <Volume id="n07-cross-threshold" position={[0, 2.8, 3]} size={[7.5, 5.5, 2]} />
  </Shell>;
}

function UnobservedCorridor({ visible, progress, reducedMotion, onRuntimeEvent }: { visible: boolean; progress: N07LevelProgress; reducedMotion: boolean; onRuntimeEvent: (event: N07RuntimeEvent) => void }) {
  const architecture = useRef<THREE.Group>(null);
  const lastPosition = useRef(new THREE.Vector3());
  const still = useRef(0);
  const gazeState = useRef<boolean | null>(null);
  const forward = useMemo(() => new THREE.Vector3(), []);
  const gazeTarget = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }, delta) => {
    if (!visible) return;
    camera.getWorldDirection(forward);
    gazeTarget.set(0, 3, -7).sub(camera.position).normalize();
    const observed = forward.dot(gazeTarget) > .55;
    if (gazeState.current !== observed) { gazeState.current = observed; onRuntimeEvent(observed ? "topology-observed" : "topology-unobserved"); }
    const movement = camera.position.distanceTo(lastPosition.current);
    lastPosition.current.copy(camera.position);
    still.current = movement < .002 ? still.current + delta : 0;
    if (still.current > (reducedMotion ? .8 : 1.6)) { still.current = -100; onRuntimeEvent("stillness"); }
    if (architecture.current) {
      const open = progress.topologyState !== "observed";
      architecture.current.position.x = THREE.MathUtils.damp(architecture.current.position.x, open ? 4.4 : 0, reducedMotion ? 30 : 4.5, delta);
      architecture.current.rotation.y = THREE.MathUtils.damp(architecture.current.rotation.y, open ? -.22 : 0, reducedMotion ? 30 : 4, delta);
    }
  });
  if (!visible) return null;
  return <Shell z={-4} length={19}>
    <spotLight color="#ced6d4" intensity={9} position={[-6, 10, -1]} angle={.3} penumbra={.95} distance={24} />
    <pointLight color="#91a0a1" intensity={4.2} position={[0, 3.2, 1]} distance={16} decay={2} />
    <group ref={architecture} position={[0, 0, -7]}>
      <mesh position={[0, 3, 0]}><boxGeometry args={[7.2, 6, .5]} /><meshPhysicalMaterial color="#151d1f" metalness={.96} roughness={.2} emissive="#405052" emissiveIntensity={.035} /></mesh>
      <LightSeam position={[0, 3.1, .27]} scale={[3.8, .035, .02]} opacity={.5} />
    </group>
    <group position={[-6.5, 2.6, -7.8]} rotation={[0, .28, 0]}>
      <mesh><planeGeometry args={[4.2, 5.3]} /><meshPhysicalMaterial color="#667173" metalness={1} roughness={.08} transparent opacity={.3} /></mesh>
      <Volume id="n07-reflection-route" position={[0, 0, .7]} size={[4, 5, 1.8]} />
    </group>
    {progress.stillnessRevealed && <group position={[6.3, 3, -5]}><LightSeam position={[0, 0, 0]} scale={[.04, 4.6, .03]} opacity={.75} /><Volume id="n07-stillness-seam" position={[-.5, 0, 0]} size={[2, 5, 2]} /></group>}
    <Volume id="n07-topology-visible" position={[-2.8, 2, -7]} />
    <Volume id="n07-topology-missing" position={[3.8, 2, -7]} />
  </Shell>;
}

function ObserverTrace({ visible, progress, reducedMotion, onRuntimeEvent }: { visible: boolean; progress: N07LevelProgress; reducedMotion: boolean; onRuntimeEvent: (event: N07RuntimeEvent) => void }) {
  const trace = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    if (!visible) return;
    elapsed.current += delta;
    if (elapsed.current > (reducedMotion ? 2 : 5) && !progress.futureSelfSeen) onRuntimeEvent("future-self");
    if (trace.current && !reducedMotion) trace.current.position.z = -17 + Math.sin(elapsed.current * .45) * 2.4;
  });
  if (!visible) return null;
  return <Shell z={-21} length={17}>
    <pointLight color="#8ea0a2" intensity={4.8} position={[0, 4, -19]} distance={14} />
    <group ref={trace} position={[0, 0, -17]}>{Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[(i % 3 - 1) * .26, .4 + i * .42, -i * .18]}><sphereGeometry args={[.07 + i * .006, 8, 6]} /><meshBasicMaterial color="#d7dfdd" transparent opacity={.18 + i * .045} toneMapped={false} /></mesh>)}</group>
    <group position={[-4.2, 0, -23]}><mesh position={[0, 1.4, 0]}><cylinderGeometry args={[1, 1.5, 2.8, 8]} /><meshPhysicalMaterial {...metal} /></mesh><LightSeam position={[0, 2.2, .95]} scale={[1.2, .04, .02]} opacity={progress.traceStrategy === "synchronize" ? .75 : .28} /><Volume id="n07-trace-sync" position={[0, 1.5, .7]} /></group>
    <group position={[4.2, 0, -23]}><mesh position={[0, 1.4, 0]}><cylinderGeometry args={[1, 1.5, 2.8, 8]} /><meshPhysicalMaterial {...metal} /></mesh><LightSeam position={[0, 2.2, .95]} scale={[1.2, .04, .02]} opacity={progress.traceStrategy === "diverge" ? .75 : .28} /><Volume id="n07-trace-diverge" position={[0, 1.5, .7]} /></group>
    {progress.futureSelfSeen && <group position={[0, 1.7, -26.4]}><mesh><capsuleGeometry args={[.35, 1.5, 4, 10]} /><meshBasicMaterial color="#c7d0ce" transparent opacity={.12} depthWrite={false} /></mesh><LightSeam position={[0, .4, .2]} scale={[.025, 2.4, .02]} opacity={.7} /><Volume id="n07-future-self" position={[0, .3, .5]} /></group>}
  </Shell>;
}

function Investigation({ visible, progress }: { visible: boolean; progress: N07LevelProgress }) {
  const evidence: { id: NexusInteractionId; x: number; label: string }[] = [
    { id: "n07-evidence-event", x: -7.2, label: "13" }, { id: "n07-evidence-signal", x: -2.4, label: "7A" },
    { id: "n07-evidence-void", x: 2.4, label: "0" }, { id: "n07-evidence-memory", x: 7.2, label: "07" },
  ];
  if (!visible) return null;
  return <Shell z={-39} length={18}>
    <spotLight color="#d4dbd8" intensity={8} position={[0, 11, -36]} angle={.4} penumbra={.9} distance={25} />
    {evidence.map((item, i) => <group key={item.id} position={[item.x, 0, -38 + (i % 2) * 2]}>
      <mesh position={[0, 1.5, 0]} rotation={[0, i * .2, i % 2 ? .12 : -.08]}><boxGeometry args={[2.4, 3, .35]} /><meshPhysicalMaterial color="#111719" metalness={.94} roughness={.22} /></mesh>
      <LightSeam position={[0, 2, .2]} scale={[1.4, .035, .02]} opacity={progress.evidenceAnchors.length > i ? .65 : .22} />
      <Volume id={item.id} position={[0, 1.5, .7]} />
    </group>)}
    {progress.evidenceAnchors.length >= 3 && <group position={[0, .15, -45]}>
      <mesh rotation={[-Math.PI / 2, 0, progress.evidenceBridge === "contradictory" ? .22 : 0]}><boxGeometry args={[5.4, 10, .25]} /><meshPhysicalMaterial color="#141b1d" metalness={.95} roughness={.2} /></mesh>
      <Volume id="n07-bridge-supported" position={[-3.2, 1, 0]} size={[3, 3, 3]} /><Volume id="n07-bridge-contradictory" position={[3.2, 1, 0]} size={[3, 3, 3]} />
    </group>}
  </Shell>;
}

function ReconstructionFailure({ visible, progress }: { visible: boolean; progress: N07LevelProgress }) {
  if (!visible) return null;
  return <Shell z={-58} length={18}>
    <pointLight color="#778a8d" intensity={3.4} position={[0, 2, -56]} distance={13} />
    {[1, 2, 3].map((index) => <group key={index} position={[(index - 2) * 4.5, .1 + index * .42, -58 - index * 2.4]} rotation={[0, 0, (index - 2) * .07]}>
      <mesh><boxGeometry args={[3.5, .3, 3.6]} /><meshPhysicalMaterial color={progress.failureAnchors.includes(index) ? "#2a3436" : "#0c1112"} metalness={.95} roughness={.22} /></mesh>
      <LightSeam position={[0, .18, 0]} scale={[2.3, .025, .04]} opacity={progress.failureAnchors.includes(index) ? .75 : .2} />
      <Volume id={`n07-failure-anchor-${index}` as NexusInteractionId} position={[0, 1.2, 0]} size={[3.8, 2.8, 3.8]} />
    </group>)}
    <group position={[0, 3.8, -63]} rotation={[0, 0, -.16]}>{Array.from({ length: 7 }, (_, i) => <LightSeam key={i} position={[(i - 3) * .9, Math.sin(i * 1.8) * 1.2, i * .25]} scale={[.035, 2.2 + i * .3, .03]} opacity={.18 + i * .05} />)}</group>
  </Shell>;
}

function ObserverChamber({ visible, progress, reducedMotion }: { visible: boolean; progress: N07LevelProgress; reducedMotion: boolean }) {
  const rings = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (visible && rings.current && !reducedMotion) rings.current.rotation.y = Math.sin(clock.elapsedTime * .22) * .12; });
  if (!visible) return null;
  return <Shell z={-77} length={18}>
    <spotLight color="#d2d9d6" intensity={6.5} position={[0, 13, -73]} angle={.3} penumbra={.97} distance={30} />
    <group ref={rings} position={[0, 4.4, -78]}>{[2, 3.6, 5.2].map((r, i) => <mesh key={r} rotation={[Math.PI / 2 + i * .36, i * .45, 0]}><torusGeometry args={[r, .055 + i * .015, 8, 72]} /><meshBasicMaterial color="#bbc5c3" transparent opacity={.43 - i * .09} toneMapped={false} /></mesh>)}</group>
    <group position={[-3.8, 0, -73]}><mesh position={[0, 1.4, 0]}><boxGeometry args={[3, 2.8, 1.8]} /><meshPhysicalMaterial {...metal} /></mesh><Volume id="n07-observer-direct" position={[0, 1.5, .8]} /></group>
    <group position={[3.8, 0, -73]}><mesh position={[0, 1.4, 0]}><boxGeometry args={[3, 2.8, 1.8]} /><meshPhysicalMaterial {...metal} /></mesh><Volume id="n07-observer-wait" position={[0, 1.5, .8]} /></group>
    {progress.observerSolved && <><Volume id="n07-route-model" position={[-3.7, 2, -83]} size={[5, 4, 3]} /><Volume id="n07-route-contradiction" position={[3.7, 2, -83]} size={[5, 4, 3]} /></>}
    {progress.route && <Volume id="n07-traversal" position={[0, 2.8, -85]} size={[7, 5.5, 2]} />}
  </Shell>;
}

function Exterior({ visible, progress }: { visible: boolean; progress: N07LevelProgress }) {
  const towers = useMemo(() => Array.from({ length: 18 }, (_, i) => ({ x: (i % 2 ? 1 : -1) * (7 + (i % 5) * 3.2), y: 6 + (i % 6) * 3, z: -94 - i * 3 })), []);
  if (!visible) return null;
  const ready = progress.exteriorScans.length === 3 && progress.windowObserved && progress.externalMeasured;
  return <group>
    <color attach="background" args={["#010202"]} /><fog attach="fog" args={["#010202", 13, 84]} />
    <mesh position={[0, -.2, -98]}><boxGeometry args={[45, .4, 38]} /><meshPhysicalMaterial color="#06090a" metalness={.92} roughness={.31} /></mesh>
    <hemisphereLight color="#859395" groundColor="#010202" intensity={.34} /><directionalLight color="#d7ddda" intensity={2.2} position={[-15, 25, -70]} />
    {towers.map((tower, i) => <mesh key={i} position={[tower.x, tower.y, tower.z]} rotation={[0, (i % 3 - 1) * .08, (i % 4 - 1.5) * .015]}><boxGeometry args={[3.4 + i % 4, tower.y * 2, 4.5]} /><meshStandardMaterial {...metal} roughness={.34} /></mesh>)}
    <group position={[0, 0, -96]}>{[["n07-exterior-scan-archive", -6], ["n07-exterior-scan-horizon", 0], ["n07-exterior-scan-observer", 6]].map(([id, x]) => <group key={id} position={[Number(x), 0, 0]}><mesh position={[0, 1.4, 0]}><cylinderGeometry args={[.55, .9, 2.8, 7]} /><meshPhysicalMaterial {...metal} /></mesh><Volume id={id as NexusInteractionId} position={[0, 1.5, .7]} /></group>)}</group>
    <group position={[-8.5, 3.4, -103]} rotation={[0, .35, 0]}><mesh><planeGeometry args={[5.5, 6.8]} /><meshBasicMaterial color="#b5c0bf" transparent opacity={.055} /></mesh><LightSeam position={[0, 0, .03]} scale={[.035, 5.5, .02]} opacity={.62} /><Volume id="n07-exterior-window" position={[0, 0, .8]} size={[5, 6, 2]} /></group>
    <Volume id="n07-exterior-measure" position={[8.5, 2, -103]} size={[4, 4, 3]} />
    {ready && <group position={[0, .2, -110]}>{["sector", "archive", "observer", "event"].map((kind, i) => <group key={kind} position={[(i - 1.5) * 3.8, .5 + (i % 2) * .7, 0]} rotation={[0, 0, (i - 1.5) * .05]}><mesh><boxGeometry args={[3, .35, 5]} /><meshPhysicalMaterial color={progress.interpretation === kind ? "#354043" : "#111719"} metalness={.96} roughness={.2} /></mesh><Volume id={`n07-interpret-${kind}` as NexusInteractionId} position={[0, 1.3, 0]} size={[3.3, 3, 5]} /></group>)}</group>}
    {progress.interpretation && !progress.completed && <><Volume id="n07-final-stabilize" position={[-2.6, 1.6, -116]} /><Volume id="n07-final-preserve" position={[2.6, 1.6, -116]} /></>}
    {progress.completed && <Volume id="n07-return" position={[0, 2.2, -113]} size={[6, 4.5, 3]} />}
  </group>;
}

export function N07Level({ progress, reducedMotion, onRuntimeEvent }: { progress: N07LevelProgress; reducedMotion: boolean; onRuntimeEvent: (event: N07RuntimeEvent) => void }) {
  const current = n07AreaOrder.indexOf(progress.area);
  const visible = (area: N07Area) => Math.abs(n07AreaOrder.indexOf(area) - current) <= 1;
  return <group>
    <color attach="background" args={["#010203"]} /><fog attach="fog" args={["#010203", 9, reducedMotion ? 40 : 52]} />
    <ambientLight color="#657174" intensity={.22} /><hemisphereLight color="#7d898b" groundColor="#010202" intensity={.34} />
    <Threshold visible={visible("threshold")} returning={progress.returnVisits > 0} />
    <UnobservedCorridor visible={visible("corridor")} progress={progress} reducedMotion={reducedMotion} onRuntimeEvent={onRuntimeEvent} />
    <ObserverTrace visible={visible("trace")} progress={progress} reducedMotion={reducedMotion} onRuntimeEvent={onRuntimeEvent} />
    <Investigation visible={visible("investigation")} progress={progress} />
    <ReconstructionFailure visible={visible("failure")} progress={progress} />
    <ObserverChamber visible={visible("observer")} progress={progress} reducedMotion={reducedMotion} />
    <Exterior visible={visible("exterior")} progress={progress} />
  </group>;
}
