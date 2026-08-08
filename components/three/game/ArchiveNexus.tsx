"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { RealitySnapshot } from "@/reality/realityTypes";
import type { FacilityProgress, NexusInteractionId } from "@/game/gameTypes";
import { resolveFacilityMutations } from "@/game/facilityMutations";
import { evaluateN07Access, type N07AccessEvaluation } from "@/game/n07Access";
import { arrayTargets, relayOrder, type NexusGameplayProgress, type NexusLightingState } from "@/game/nexusGameplay";

type Props = { reducedMotion: boolean; discoveredCount: number; session: RealitySnapshot; gateOpening: boolean; progress: FacilityProgress; target: NexusInteractionId | null; scanner: boolean };

const graphite = new THREE.Color("#111719");
const silver = new THREE.Color("#879194");

function WorldLabel({ primary, secondary, position, rotation = [0, 0, 0], width = 4.4, active = false }: { primary: string; secondary: string; position: [number, number, number]; rotation?: [number, number, number]; width?: number; active?: boolean }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "rgba(3, 5, 6, .86)";
      context.fillRect(8, 8, 1008, 240);
      context.strokeStyle = active ? "rgba(218, 225, 224, .72)" : "rgba(150, 163, 165, .34)";
      context.lineWidth = active ? 4 : 2;
      context.strokeRect(10, 10, 1004, 236);
      context.fillStyle = active ? "rgba(238, 242, 240, .96)" : "rgba(205, 213, 213, .78)";
      context.font = "500 44px Arial";
      context.letterSpacing = "8px";
      context.fillText(primary, 52, 104);
      context.fillStyle = active ? "rgba(190, 204, 205, .78)" : "rgba(139, 153, 155, .58)";
      context.font = "400 25px Arial";
      context.letterSpacing = "6px";
      context.fillText(secondary, 52, 176);
      context.fillRect(52, 207, active ? 360 : 180, 3);
    }
    const next = new THREE.CanvasTexture(canvas);
    next.colorSpace = THREE.SRGBColorSpace;
    next.anisotropy = 4;
    return next;
  }, [active, primary, secondary]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={position} rotation={rotation}>
    <planeGeometry args={[width, width * .25]} />
    <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} opacity={active ? 1 : .86} />
  </mesh>;
}

function InteractionVolume({ id, position, size }: { id: NexusInteractionId; position: [number, number, number]; size: [number, number, number] }) {
  return <mesh position={position} userData={{ interactionId: id }}><boxGeometry args={size} /><meshBasicMaterial transparent opacity={.001} depthWrite={false} /></mesh>;
}

function Monolith({ position, scale, rotation = [0, 0, 0] }: { position: [number, number, number]; scale: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh><boxGeometry args={scale} /><meshPhysicalMaterial color={graphite} metalness={.86} roughness={.3} clearcoat={.12} /></mesh>
      <mesh position={[scale[0] * .18, 0, scale[2] * .505]}><boxGeometry args={[.025, scale[1] * .72, .018]} /><meshBasicMaterial color={silver} transparent opacity={.22} toneMapped={false} /></mesh>
    </group>
  );
}

function SectorDoor({ index, position, rotation, available, changed }: { index: number; position: [number, number, number]; rotation: number; available: boolean; changed: boolean }) {
  const offset = index % 2 ? .34 : -.24;
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 3.8, 0]}><boxGeometry args={[4.9, 8.2, 1.45]} /><meshPhysicalMaterial color={changed ? "#0c0f10" : "#050607"} metalness={.88} roughness={.31} /></mesh>
      <mesh position={[offset, 3.7, .77]}><boxGeometry args={[.06, 5.8, .04]} /><meshBasicMaterial color={available ? "#b9c2c2" : "#536064"} transparent opacity={available ? .58 : .2} toneMapped={false} /></mesh>
      <mesh position={[-1.5, 6.65, .79]}><boxGeometry args={[1.25, .06, .04]} /><meshBasicMaterial color="#788285" transparent opacity={.25} toneMapped={false} /></mesh>
      {Array.from({ length: index }, (_, marker) => <mesh key={marker} position={[-1.45 + marker * .18, 6.35, .8]}><boxGeometry args={[.08, .18, .04]} /><meshBasicMaterial color="#9aa3a4" transparent opacity={.32} /></mesh>)}
    </group>
  );
}

function RouteGate({ id, position, side, label, detail, open = false, active = false }: { id: NexusInteractionId; position: [number, number, number]; side: -1 | 1; label: string; detail: string; open?: boolean; active?: boolean }) {
  return <group position={position} rotation={[0, side * .08, 0]}>
    <mesh position={[0, 3.2, 0]}><boxGeometry args={[4.6, 6.7, 1.35]} /><meshPhysicalMaterial color="#080b0c" metalness={.92} roughness={.27} /></mesh>
    <mesh position={[side * .72, 3.2, .7]}><boxGeometry args={[active ? .075 : .045, 4.8, .03]} /><meshBasicMaterial color="#a7b2b3" transparent opacity={active ? .82 : open ? .58 : .32} toneMapped={false} /></mesh>
    <mesh position={[0, 5.8, .72]}><boxGeometry args={[2.5, .055, .03]} /><meshBasicMaterial color="#9ca7a8" transparent opacity={.34} toneMapped={false} /></mesh>
    <InteractionVolume id={id} position={[0, 3.1, 1.1]} size={[4.9, 6.2, 2.2]} />
    <WorldLabel primary={label} secondary={detail} position={[0, 4.75, .84]} width={3.85} active={active} />
  </group>;
}

function MaintenanceHatch({ available, active }: { available: boolean; active: boolean }) {
  return <group position={[0, .12, 3.1]}>
    <mesh><boxGeometry args={[3.8, .26, 4.8]} /><meshPhysicalMaterial color="#070a0b" metalness={.94} roughness={.24} /></mesh>
    <mesh position={[0, .15, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.4, 3.8]} /><meshBasicMaterial color="#263033" transparent opacity={.22} /></mesh>
    {[-1.35, 1.35].map((x) => <mesh key={x} position={[x, .16, 0]}><boxGeometry args={[.035, .025, 3.8]} /><meshBasicMaterial color="#9aa6a7" transparent opacity={.36} toneMapped={false} /></mesh>)}
    <WorldLabel primary="LOWER" secondary={available ? "MAINTENANCE ACCESS / OPEN" : "MAINTENANCE ACCESS / SEALED"} position={[0, .45, 1.45]} rotation={[-Math.PI / 2, 0, 0]} width={3.1} active={active} />
    {available && <InteractionVolume id="route-maintenance-spine" position={[0, 1.1, 0]} size={[4.2, 2.1, 5.1]} />}
  </group>;
}

function FloorStation({ id, position, label, active, complete }: { id: NexusInteractionId; position: [number, number, number]; label: string; active: boolean; complete: boolean }) {
  return <group position={position}>
    <mesh position={[0, .035, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.72, .9, 24]} /><meshBasicMaterial color="#bbc5c4" transparent opacity={complete ? .62 : active ? .48 : .22} toneMapped={false} /></mesh>
    <mesh position={[0, .03, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.7, 24]} /><meshBasicMaterial color="#5e6b6e" transparent opacity={active ? .16 : .06} /></mesh>
    <InteractionVolume id={id} position={[0, 1.5, 0]} size={[2.2, 3, 2.2]} />
    {active && <WorldLabel primary={label} secondary={complete ? "MEASUREMENT / LOCKED" : "MEASUREMENT / POSITION"} position={[.55, 2.2, -1.5]} width={.95} active />}
  </group>;
}

function MeasurementArray({ gameplay, target, reducedMotion }: { gameplay: NexusGameplayProgress; target: NexusInteractionId | null; reducedMotion: boolean }) {
  const assembly = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!assembly.current) return;
    assembly.current.position.y = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * .35) * .035;
    assembly.current.rotation.y = THREE.MathUtils.damp(assembly.current.rotation.y, gameplay.arrayCalibrated ? -.32 : .08, 3, delta);
  });
  return <group position={[2.7, 0, 9.3]}>
    <group ref={assembly}>
      <mesh position={[0, 1.9, 0]}><cylinderGeometry args={[.14, .44, 3.8, 8]} /><meshPhysicalMaterial color="#161d1f" metalness={.92} roughness={.22} /></mesh>
      {gameplay.arrayAlignment.map((step, index) => <group key={index} position={[0, 3.4 + index * .62, 0]} rotation={[Math.PI / 2 + index * .28, step * Math.PI / 2, index * .22]}>
        <mesh><torusGeometry args={[.72 + index * .32, index === 1 ? .07 : .045, 8, 48]} /><meshBasicMaterial color="#b8c3c3" transparent opacity={step === arrayTargets[index] ? .82 : .38} toneMapped={false} /></mesh>
        <mesh position={[.72 + index * .32, 0, 0]}><boxGeometry args={[.24, .12, .12]} /><meshBasicMaterial color="#d4dcda" transparent opacity={.74} toneMapped={false} /></mesh>
      </group>)}
    </group>
    {([-1.35, 0, 1.35] as const).map((x, index) => <group key={x} position={[x, 0, .9]}><mesh position={[0, .72, 0]}><cylinderGeometry args={[.28, .42, 1.44, 8]} /><meshPhysicalMaterial color="#0c1112" metalness={.94} roughness={.24} /></mesh><mesh position={[0, 1.48, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.2, .34, 12]} /><meshBasicMaterial color="#bdc7c6" transparent opacity={gameplay.arrayAlignment[index] === arrayTargets[index] ? .72 : .25} toneMapped={false} /></mesh><InteractionVolume id={(["array-component-a", "array-component-b", "array-component-c"] as NexusInteractionId[])[index]} position={[0, 1, .4]} size={[1.1, 2, 1.4]} /></group>)}
    <WorldLabel primary="ARRAY 7A" secondary={gameplay.arrayCalibrated ? "ALIGNMENT / COHERENT" : gameplay.triangulated ? "MANUAL CALIBRATION / ACTIVE" : "TRIANGULATION / REQUIRED"} position={[0, 6.3, .2]} width={3.2} active={gameplay.arrayCalibrated || target?.startsWith("array-component")} />
  </group>;
}

function NexusActivities({ gameplay, scanner, target }: { gameplay: NexusGameplayProgress; scanner: boolean; target: NexusInteractionId | null }) {
  const scanIds: NexusInteractionId[] = gameplay.arrayCalibrated && !gameplay.signalEchoResolved ? ["signal-echo-north", "signal-echo-east", "signal-echo-west"] : ["nexus-scan-north", "nexus-scan-east", "nexus-scan-west"];
  const scanComplete = gameplay.arrayCalibrated && !gameplay.signalEchoResolved ? gameplay.signalEchoSteps : gameplay.scanPoints;
  return <group>
    {([[0, 0, 11.2], [9.7, 0, -8.2], [-9.7, 0, -8.2]] as [number, number, number][]).map((position, index) => <FloorStation key={scanIds[index]} id={scanIds[index]} position={position} label={`SCAN ${String(index + 1).padStart(2, "0")}`} active={scanner || target === scanIds[index]} complete={scanComplete.includes((["north", "east", "west"] as const)[index])} />)}
    {([[-9.7, 0, 5.4], [9.7, 0, 5.4], [0, 0, -15.4]] as [number, number, number][]).map((position, index) => <group key={index} position={position}>
      <mesh position={[0, .85, 0]}><cylinderGeometry args={[.38, .6, 1.7, 8]} /><meshPhysicalMaterial color="#171e20" metalness={.93} roughness={.25} emissive="#667376" emissiveIntensity={gameplay.relaySequence.includes(relayOrder[index]) ? .2 : .075} /></mesh>
      <mesh position={[0, 1.76, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.25, .42, 12]} /><meshBasicMaterial color="#c4cecc" transparent opacity={gameplay.relaySequence.includes(relayOrder[index]) ? .74 : .26} toneMapped={false} /></mesh>
      <mesh position={[0, .045, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[1.25, 24]} /><meshBasicMaterial color="#8f9da0" transparent opacity={target === (["relay-alpha", "relay-beta", "relay-gamma"] as NexusInteractionId[])[index] ? .13 : .055} depthWrite={false} /></mesh>
      {target === (["relay-alpha", "relay-beta", "relay-gamma"] as NexusInteractionId[])[index] && <pointLight color="#b4c0c0" intensity={4.2} distance={7} decay={2} position={[0, 2.8, 1.2]} />}
      <InteractionVolume id={(["relay-alpha", "relay-beta", "relay-gamma"] as NexusInteractionId[])[index]} position={[0, 1.25, 0]} size={[1.5, 2.5, 1.5]} />
      <WorldLabel primary={`RELAY ${String.fromCharCode(65 + index)}`} secondary={gameplay.relayStabilized ? "CONTAINMENT / STABLE" : "HOLD / STABILIZE"} position={[0, 2.7, -.5]} width={2.4} active={target === (["relay-alpha", "relay-beta", "relay-gamma"] as NexusInteractionId[])[index]} />
    </group>)}
  </group>;
}

function UpperLedge({ visited, active }: { visited: boolean; active: boolean }) {
  return <group>
    <mesh position={[9, 1.05, -10.8]} rotation={[-.16, 0, 0]}><boxGeometry args={[5.4, .32, 10]} /><meshPhysicalMaterial color="#101517" metalness={.92} roughness={.27} /></mesh>
    <mesh position={[9, 2.12, -16]}><boxGeometry args={[7.6, .36, 8]} /><meshPhysicalMaterial color="#0c1112" metalness={.92} roughness={.25} /></mesh>
    {[6.1, 11.9].map((x) => <mesh key={x} position={[x, 3.2, -16]}><boxGeometry args={[.08, 2.2, 7]} /><meshBasicMaterial color="#aeb9b9" transparent opacity={.28} toneMapped={false} /></mesh>)}
    <mesh position={[9, 2.32, -16]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[1.7, 2.1, 32]} /><meshBasicMaterial color="#aebabb" transparent opacity={visited ? .52 : .23} toneMapped={false} /></mesh>
    <InteractionVolume id="nexus-ledge" position={[9, 3.5, -16]} size={[6, 3.8, 6]} />
    <WorldLabel primary="UPPER ALIGNMENT" secondary={visited ? "CHAMBER SCALE / RECORDED" : "OBSERVATION LEDGE / ACCESS"} position={[9, 5, -6]} rotation={[0, Math.PI, 0]} width={2.4} active={active} />
  </group>;
}

function N07Gate({ evaluation, reducedMotion, active, committed, completed, route, interpretation }: { evaluation: N07AccessEvaluation; reducedMotion: boolean; active: boolean; committed: boolean; completed: boolean; route: string | null; interpretation: string | null }) {
  const fragments = useRef<THREE.Group>(null);
  const clock = useRef(0);
  useFrame((state, delta) => {
    if (!fragments.current || reducedMotion || !evaluation.alignmentReady) return;
    clock.current += delta;
    fragments.current.rotation.z = Math.sin(clock.current * .23) * (evaluation.vector === "temporal" ? .012 : .004);
    fragments.current.position.y = Math.sin(clock.current * .42) * .06;
    state.invalidate();
  });
  const glow = committed ? .8 : evaluation.thresholdReady ? .58 : evaluation.alignmentReady ? .34 : .14;
  return <group position={[-8, 0, -24.5]} rotation={[0, .04, 0]}>
    <mesh position={[0, -.12, 1.7]}><boxGeometry args={[12, .22, 10]} /><meshPhysicalMaterial color="#080b0c" metalness={.9} roughness={.31} /></mesh>
    <group ref={fragments}>
      <mesh position={[-3.55, 6.2, 0]} rotation={[0, .04, -.025]}><boxGeometry args={[2.15, 12.8, 2.1]} /><meshPhysicalMaterial color="#151b1d" metalness={.94} roughness={.24} emissive="#455052" emissiveIntensity={.1} /></mesh>
      <mesh position={[3.35, 5.15, -.5]} rotation={[0, -.05, .035]}><boxGeometry args={[2.35, 10.7, 2.45]} /><meshPhysicalMaterial color="#121719" metalness={.95} roughness={.23} emissive="#414a4c" emissiveIntensity={.09} /></mesh>
      <mesh position={[-.55, 12.2, -.15]} rotation={[0, 0, -.045]}><boxGeometry args={[5.4, 1.4, 2.2]} /><meshPhysicalMaterial color="#0a0d0e" metalness={.94} roughness={.25} /></mesh>
      <mesh position={[.5, 6.4, .65]}><boxGeometry args={[.055, 10.8, .04]} /><meshBasicMaterial color="#c2cac8" transparent opacity={glow} toneMapped={false} /></mesh>
      <mesh position={[-1.7, 8.3, .7]}><boxGeometry args={[3.8, .045, .04]} /><meshBasicMaterial color="#a9b4b3" transparent opacity={glow * .72} toneMapped={false} /></mesh>
      <mesh position={[-4.62, 6.1, 1.08]} rotation={[0, .04, -.025]}><boxGeometry args={[.045, 10.7, .04]} /><meshBasicMaterial color="#aeb9b8" transparent opacity={glow * .52} toneMapped={false} /></mesh>
      <mesh position={[4.5, 5.2, .75]} rotation={[0, -.05, .035]}><boxGeometry args={[.045, 8.8, .04]} /><meshBasicMaterial color="#c1b5ad" transparent opacity={glow * .44} toneMapped={false} /></mesh>
      {evaluation.vector === "temporal" && [-.38, .38].map((z, index) => <mesh key={z} position={[index ? .8 : -.5, 6.7, z]}><boxGeometry args={[.035, 8.8, .04]} /><meshBasicMaterial color="#c7bbb3" transparent opacity={.16 + index * .1} toneMapped={false} /></mesh>)}
      {evaluation.vector === "spatial" && <group rotation={[0, 0, -.11]}><mesh position={[1.8, 6.5, .2]}><boxGeometry args={[.045, 9.5, .05]} /><meshBasicMaterial color="#bcc5c4" transparent opacity={.4} /></mesh><mesh position={[-1.1, 3.1, .25]} rotation={[0, 0, Math.PI / 2]}><boxGeometry args={[.045, 5.2, .05]} /><meshBasicMaterial color="#bcc5c4" transparent opacity={.24} /></mesh></group>}
      {evaluation.vector === "mnemonic" && <mesh position={[.95, 6.5, -.8]}><boxGeometry args={[6.9, 11.5, .06]} /><meshBasicMaterial color="#b6c0bf" transparent opacity={.055} depthWrite={false} /></mesh>}
      {evaluation.vector === "adaptive" && Array.from({ length: 5 }, (_, index) => <mesh key={index} position={[-2.2 + index * 1.1, 2.2 + index * 1.8, .8]} rotation={[0, 0, index % 2 ? .25 : -.2]}><boxGeometry args={[.045, 2.4, .04]} /><meshBasicMaterial color="#c2cac8" transparent opacity={.2 + index * .07} /></mesh>)}
    </group>
    {evaluation.tier >= 3 && <><spotLight color="#b8c1c0" intensity={evaluation.tier >= 4 ? 11 : 5} position={[0, 12, 5]} angle={.28} penumbra={.86} distance={24} decay={2} /><mesh position={[0, 5.8, -.8]}><planeGeometry args={[5.8, 9.8]} /><meshBasicMaterial color="#8f9b9c" transparent opacity={committed ? .055 : .012 + evaluation.tier * .004} depthWrite={false} /></mesh></>}
    {evaluation.alignmentReady && <><pointLight color="#aeb9b8" intensity={evaluation.thresholdReady ? 6 : 3} position={[-4.6, 7.5, 3.2]} distance={17} decay={2} /><pointLight color="#c2b6ae" intensity={evaluation.thresholdReady ? 5 : 2.5} position={[4.4, 9, 2.6]} distance={16} decay={2} /></>}
    {completed && <group position={[interpretation === "observer" ? 1.2 : 0, .08, 4.2]} rotation={[-Math.PI / 2, 0, interpretation === "event" ? -.32 : interpretation === "archive" ? .18 : route === "contradiction" ? -.18 : .08]}>{[2.4, 3.6, 4.8].map((radius, index) => <mesh key={radius} scale={interpretation === "sector" && index === 1 ? [.72, 1, 1] : 1}><ringGeometry args={[radius, radius + (interpretation === "archive" ? .045 : .025), 64]} /><meshBasicMaterial color="#b8c2c0" transparent opacity={.3 - index * .06} toneMapped={false} /></mesh>)}</group>}
    <InteractionVolume id="n07-gate" position={[0, 5.5, 2]} size={[8, 11, 4]} />
    <WorldLabel primary="N-07" secondary={completed ? `${(interpretation ?? "NONLOCAL").toUpperCase()} INTERPRETATION / RETAINED` : committed ? "COMMITMENT PRESERVED" : evaluation.thresholdReady ? `THRESHOLD / ${evaluation.vector.toUpperCase()}` : evaluation.alignmentReady ? "ALIGNMENT / INCOMPLETE" : "LOCATION / NONLOCAL"} position={[0, 13.8, .7]} width={5.8} active={active || evaluation.thresholdReady} />
  </group>;
}

export function ArchiveNexus({ reducedMotion, discoveredCount, session, gateOpening, progress, target, scanner }: Props) {
  const mechanism = useRef<THREE.Group>(null);
  const gateLeft = useRef<THREE.Mesh>(null);
  const gateRight = useRef<THREE.Mesh>(null);
  const map = useRef<THREE.Group>(null);
  const clock = useRef(0);
  const doorData = useMemo(() => [
    { position: [-13.2, 0, -12.8] as [number, number, number], rotation: Math.PI / 2 },
    { position: [-13.2, 0, -4.6] as [number, number, number], rotation: Math.PI / 2 },
    { position: [-13.2, 0, 5.2] as [number, number, number], rotation: Math.PI / 2 },
    { position: [13.2, 0, -10.4] as [number, number, number], rotation: -Math.PI / 2 },
    { position: [13.2, 0, -1.8] as [number, number, number], rotation: -Math.PI / 2 },
    { position: [13.2, 0, 7.1] as [number, number, number], rotation: -Math.PI / 2 },
  ], []);
  const mutations = useMemo(() => resolveFacilityMutations(progress.consequences), [progress.consequences]);
  const n07 = useMemo(() => evaluateN07Access(progress, session.returningVisitor), [progress, session.returningVisitor]);
  const traceAcquired = progress.completedInteractions.includes("scanner-array") || Boolean(progress.signalResult);
  const gameplay = progress.nexusGameplay;
  const lightingState: NexusLightingState = progress.n07.completed ? "post-n07" : (gameplay.triangulated && !gameplay.relayStabilized) || mutations.rareTopology || mutations.voidAbsence ? "anomaly" : "normal";
  const routeEnergy = gameplay.arrayCalibrated ? .76 : gameplay.triangulated ? .52 : .3;

  useFrame((state, delta) => {
    clock.current += delta;
    if (mechanism.current) {
      if (!reducedMotion) mechanism.current.rotation.y += delta * (.025 + gameplay.scanPoints.length * .012 + (gameplay.arrayCalibrated ? .035 : 0));
      mechanism.current.rotation.z = THREE.MathUtils.damp(mechanism.current.rotation.z, gameplay.relayStabilized ? 0 : gameplay.triangulated ? -.08 : 0, 2.2, delta);
      mechanism.current.position.y = THREE.MathUtils.damp(mechanism.current.position.y, gameplay.ledgeVisited ? 14.35 : 13.8, 2, delta);
    }
    if (map.current && !reducedMotion) map.current.position.y = 3.3 + Math.sin(clock.current * .55) * .08;
    const opening = gateOpening ? 2.45 : 0;
    if (gateLeft.current) gateLeft.current.position.x = THREE.MathUtils.damp(gateLeft.current.position.x, -1.42 - opening, reducedMotion ? 14 : 2.4, delta);
    if (gateRight.current) gateRight.current.position.x = THREE.MathUtils.damp(gateRight.current.position.x, 1.42 + opening, reducedMotion ? 14 : 2.4, delta);
    state.invalidate();
  });

  const progressed = session.visitOrder.length;
  return (
    <group>
      <color attach="background" args={["#010203"]} />
      <fog attach="fog" args={["#010203", lightingState === "anomaly" ? 17 : 21, lightingState === "post-n07" ? 82 : 70]} />
      <hemisphereLight color="#b0babc" groundColor="#07090a" intensity={lightingState === "normal" ? .74 : .66} />
      <ambientLight color="#7f8b8e" intensity={lightingState === "post-n07" ? .45 : .39} />
      <directionalLight color="#d5dad8" intensity={2.45} position={[-8, 24, 13]} />
      <spotLight color="#b9c6c8" intensity={12} position={[0, 22, 6]} angle={.3} penumbra={.82} distance={58} decay={1.7} />
      <spotLight color="#d4ccc2" intensity={7.2} position={[-12, 8, 4]} angle={.3} penumbra={.88} distance={32} decay={1.9} />
      <pointLight color="#7a8a8d" intensity={5.5} position={[9, 4, -3]} distance={22} decay={1.9} />
      <pointLight color="#a9b4b5" intensity={8.5} position={[0, 13, -6]} distance={28} decay={1.8} />
      <spotLight color="#849599" intensity={traceAcquired ? 13 : 8} position={[7.5, 8.5, 12]} angle={.22} penumbra={.78} distance={28} decay={1.8} />
      <spotLight color="#9da8a9" intensity={5.5} position={[-8, 8, 11]} angle={.24} penumbra={.86} distance={26} decay={1.9} />

      <mesh position={[0, -.22, -5]}><boxGeometry args={[31, .44, 46]} /><meshPhysicalMaterial color={lightingState === "anomaly" ? "#151b1d" : "#192023"} metalness={.88} roughness={.33} clearcoat={.1} /></mesh>
      <mesh position={[0, -.005, -2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[7.5, 34]} /><meshBasicMaterial color="#111719" transparent opacity={.22} /></mesh>
      {[-14.4, -7.6, 7.6, 14.4].map((x) => <mesh key={x} position={[x, .02, -1]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[x === -7.6 || x === 7.6 ? .05 : .035, 36]} /><meshBasicMaterial color="#b5bfbe" transparent opacity={x === -7.6 || x === 7.6 ? .5 : .28} toneMapped={false} /></mesh>)}
      {Array.from({ length: 18 }, (_, index) => <mesh key={index} position={[0, .025, 15 - index * 1.95]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[12, .018]} /><meshBasicMaterial color="#758083" transparent opacity={index % 4 === 0 ? .24 : .08} /></mesh>)}
      {[
        { x: -2.65, z: 9.65, rotation: -.55, active: target === "route-record-vault" },
        { x: 2.65, z: 9.65, rotation: .55, active: traceAcquired || target === "route-signal-room" },
        { x: 0, z: -7.2, rotation: 0, active: target === "observation-gate" },
      ].map((route, index) => <group key={index} position={[route.x, .045, route.z]} rotation={[0, route.rotation, 0]}>
        <mesh><boxGeometry args={[route.active ? .09 : .055, .022, index === 2 ? 18 : 7.7]} /><meshBasicMaterial color="#c0c9c8" transparent opacity={route.active ? .72 : routeEnergy} toneMapped={false} /></mesh>
        {[-1, 0, 1].map((step) => <mesh key={step} position={[0, .018, step * (index === 2 ? 5.2 : 2.1)]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[.34, .018, .34]} /><meshBasicMaterial color="#879396" transparent opacity={route.active ? .36 : .15} /></mesh>)}
      </group>)}

      <mesh position={[0, -8.5, -31]}><boxGeometry args={[56, 1, 52]} /><meshBasicMaterial color="#000000" /></mesh>
      {[-17.2, 17.2].map((x, side) => <group key={x}>{Array.from({ length: 7 }, (_, index) => mutations.voidAbsence && side === 1 && index === 3 ? null : <Monolith key={index} position={[x + (side ? -.35 : .35) * (index % 2) + (mutations.gravityBent ? Math.sin(index * 1.7) * .55 : 0), 10 + index * 3.9, -17 + index * 7.4]} scale={[2.4 + (index % 3) * .7, 23 + index * 3.2, 3.6]} rotation={[0, side ? -.035 : .035, (side ? -.012 : .012) + (mutations.gravityBent ? (index - 3) * .009 : 0)]} />)}</group>)}
      <Monolith position={[n07.tier > 0 ? -15.8 : -6.4, 18, -28]} scale={[8.5, 38, 4.4]} rotation={[0, .07, -.035]} />
      <Monolith position={[8.7, 24, -31]} scale={[11.5, 51, 5.8]} rotation={[0, -.04, .018]} />
      {mutations.memoryGhost && <group position={[5.8, 13, -17]} rotation={[0, -.28, 0]}><mesh><boxGeometry args={[4.8, 22, .12]} /><meshBasicMaterial color="#aab6b7" transparent opacity={.035} depthWrite={false} /></mesh><mesh position={[0, 0, .08]}><boxGeometry args={[.035, 15, .03]} /><meshBasicMaterial color="#b5c0c1" transparent opacity={.28} toneMapped={false} /></mesh></group>}
      {mutations.voidAbsence && <group position={[12.4, 11, -2]}><mesh><boxGeometry args={[5.8, 23, 5]} /><meshBasicMaterial color="#000000" /></mesh><mesh position={[-2.9, 0, 2.52]}><boxGeometry args={[.04, 18, .03]} /><meshBasicMaterial color="#b5c0c1" transparent opacity={.16} toneMapped={false} /></mesh></group>}
      <mesh position={[0, 31, -23]} rotation={[0, 0, -.08]}><boxGeometry args={[36, 1.6, 3]} /><meshStandardMaterial color="#090c0d" metalness={.85} roughness={.32} /></mesh>

      <group ref={mechanism} position={[0, 13.8, -10.2]} scale={.82}>
        {[3.1, 4.4, 6.2].map((radius, index) => <mesh key={radius} rotation={[Math.PI / 2 + index * .34, index * .52, 0]}><torusGeometry args={[radius, index === 1 ? .14 : .07, 12, 96]} /><meshPhysicalMaterial color={index === 1 ? "#899497" : "#333a3c"} metalness={.94} roughness={.19} emissive="#273033" emissiveIntensity={index === 1 ? .18 : .04} /></mesh>)}
        <mesh><icosahedronGeometry args={[1.05, 1]} /><meshPhysicalMaterial color="#0a0d0e" metalness={.9} roughness={.22} emissive="#6f7b7d" emissiveIntensity={.18} /></mesh>
        {Array.from({ length: 12 }, (_, index) => <mesh key={index} position={[Math.cos(index / 12 * Math.PI * 2) * 7.7, (index % 3 - 1) * .65, Math.sin(index / 12 * Math.PI * 2) * 7.7]}><boxGeometry args={[.05, 1.8, .05]} /><meshBasicMaterial color="#a6b1b1" transparent opacity={index % 4 === 0 ? .58 : .19} toneMapped={false} /></mesh>)}
        {mutations.neuralPrediction && <mesh rotation={[Math.PI / 2, .3, 0]}><torusGeometry args={[8.8, .035, 8, 96]} /><meshBasicMaterial color="#c6cecc" transparent opacity={.34} toneMapped={false} /></mesh>}
      </group>
      <mesh position={[0, 12.8, -12.8]}><cylinderGeometry args={[5.6, 7.8, 25, 24, 1, true]} /><meshBasicMaterial color="#9ba7a9" transparent opacity={.018} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
      <mesh position={[0, 10.8, -13.2]}><boxGeometry args={[.055, 20, .055]} /><meshBasicMaterial color="#c5cdcb" transparent opacity={.62} toneMapped={false} /></mesh>
      {gameplay.wakeComplete && <group position={[0, .08, -10.2]} rotation={[-Math.PI / 2, 0, 0]}>{[3.2, 5.5, 8.2].map((radius, index) => <mesh key={radius}><ringGeometry args={[radius, radius + .035, 64]} /><meshBasicMaterial color="#b8c3c2" transparent opacity={(gameplay.relayStabilized ? .42 : .26) - index * .06} toneMapped={false} /></mesh>)}</group>}
      {gameplay.triangulated && [[0, -10.2, 0], [5.7, -4.4, -.78], [-5.7, -4.4, .78]].map(([x, z, rotation], index) => <mesh key={index} position={[x, .07, z]} rotation={[-Math.PI / 2, 0, rotation]}><planeGeometry args={[.045, index ? 16 : 12]} /><meshBasicMaterial color="#cad2d0" transparent opacity={gameplay.arrayCalibrated ? .68 : .38} toneMapped={false} /></mesh>)}

      <group position={[0, 0, -18.2]}>
        <mesh position={[-4.9, 5.3, 0]}><boxGeometry args={[5.8, 11, 2.6]} /><meshPhysicalMaterial color="#080a0b" metalness={.9} roughness={.3} /></mesh>
        <mesh position={[4.9, 5.3, 0]}><boxGeometry args={[5.8, 11, 2.6]} /><meshPhysicalMaterial color="#080a0b" metalness={.9} roughness={.3} /></mesh>
        <mesh ref={gateLeft} position={[-1.42, 3.7, .5]}><boxGeometry args={[2.72, 7.6, .9]} /><meshPhysicalMaterial color="#101416" metalness={.94} roughness={.2} /></mesh>
        <mesh ref={gateRight} position={[1.42, 3.7, .5]}><boxGeometry args={[2.72, 7.6, .9]} /><meshPhysicalMaterial color="#101416" metalness={.94} roughness={.2} /></mesh>
        <mesh position={[0, 8.5, .75]}><boxGeometry args={[5.1, .12, .06]} /><meshBasicMaterial color="#c0c8c7" transparent opacity={.46} toneMapped={false} /></mesh>
        <InteractionVolume id="observation-gate" position={[0, 3.6, 2]} size={[5.4, 7.2, 1]} />
        <WorldLabel primary="FORWARD" secondary="OBSERVATION PROTOCOL" position={[0, 9.4, 1.46]} width={5} active={target === "observation-gate"} />
      </group>

      <group ref={map} position={[-8.2, 3.3, -1]} userData={{ interactionId: "archive-map" }}>
        <pointLight color="#aebabb" intensity={5.5} distance={9} decay={2} />
        <mesh><torusGeometry args={[2.15, .065, 8, 72]} /><meshBasicMaterial color="#b9c4c4" transparent opacity={.64} toneMapped={false} /></mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[2.15, .045, 8, 72]} /><meshBasicMaterial color="#8e9a9d" transparent opacity={.44} toneMapped={false} /></mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[1.58, .032, 8, 64]} /><meshBasicMaterial color="#8e9a9d" transparent opacity={.34} toneMapped={false} /></mesh>
        {[0, 1, 2, 3, 4, 5].map((index) => <group key={index} rotation={[0, index / 6 * Math.PI * 2, 0]}><mesh position={[0, (index % 2) * .5 - .2, 2.15]}><octahedronGeometry args={[index < discoveredCount ? .22 : .13, 0]} /><meshPhysicalMaterial color={index < discoveredCount ? "#a8b2b2" : "#242a2c"} metalness={.9} roughness={.22} emissive={index < discoveredCount ? "#647073" : "#000000"} emissiveIntensity={.24} /></mesh></group>)}
        {progress.discoveredRooms.filter((room) => room !== "nexus").map((room, index) => <mesh key={room} position={[Math.cos(index * 1.37) * 2.85, -.7 + index * .34, Math.sin(index * 1.37) * 2.85]}><octahedronGeometry args={[.1, 0]} /><meshBasicMaterial color="#aab5b5" transparent opacity={.42} toneMapped={false} /></mesh>)}
        <mesh><sphereGeometry args={[.42, 16, 12]} /><meshBasicMaterial color="#b3bdbc" transparent opacity={.58} toneMapped={false} /></mesh>
        {session.event13Discovered && <mesh position={[.78, .42, -.55]}><octahedronGeometry args={[.11, 0]} /><meshBasicMaterial color="#b8aaa1" transparent opacity={.42} toneMapped={false} /></mesh>}
        {mutations.temporalEarlyResponse && <mesh position={[-1.4, .8, 1.1]}><octahedronGeometry args={[.13, 0]} /><meshBasicMaterial color="#c2b6ae" transparent opacity={.58} toneMapped={false} /></mesh>}
        {mutations.rareTopology && <group position={[0, -2.4, 0]} rotation={[.7, .4, 0]}><mesh><torusGeometry args={[3.6, .06, 8, 96]} /><meshBasicMaterial color="#c5b7ae" transparent opacity={.55} toneMapped={false} /></mesh><mesh position={[0, 0, 3.6]}><octahedronGeometry args={[.2, 0]} /><meshBasicMaterial color="#d0c3ba" transparent opacity={.72} /></mesh></group>}
      </group>
      <mesh position={[-8.2, .55, -1]}><cylinderGeometry args={[2.8, 3.3, 1.1, 8]} /><meshPhysicalMaterial color="#080a0b" metalness={.9} roughness={.28} /></mesh>
      <InteractionVolume id={gameplay.topologyAligned ? "archive-map" : "topology-current"} position={[-8.2, 2.8, -1]} size={[5.3, 5.6, 5.3]} />
      <group position={[-10.2, 0, 1.8]}><mesh position={[0, .65, 0]}><cylinderGeometry args={[.3, .48, 1.3, 8]} /><meshPhysicalMaterial color="#101617" metalness={.92} roughness={.23} /></mesh><InteractionVolume id="topology-recorded" position={[0, 1, 0]} size={[1.4, 2, 1.4]} /></group>
      <WorldLabel primary="ARCHIVE MAP" secondary={gameplay.topologyAligned ? "IMPOSSIBLE ALIGNMENT / EXPOSED" : gameplay.topologyCompared ? "RECORDED TOPOLOGY / SELECT" : "CURRENT TOPOLOGY / ROTATE"} position={[-8.2, 6.7, 1]} rotation={[0, .18, 0]} active={target === "archive-map" || target?.startsWith("topology")} />
      {gameplay.topologyAligned && <group position={[-11.8, 0, -17.5]} rotation={[0, .18, 0]}>
        {[0, 1, 2, 3].map((index) => <mesh key={index} position={[0, 1.5 + index * 2.1, -index * 1.35]}><boxGeometry args={[4.4 - index * .35, .055, .055]} /><meshBasicMaterial color="#c6b9b0" transparent opacity={.38 - index * .055} toneMapped={false} /></mesh>)}
        <mesh position={[0, .04, -2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[3.8, 8.5]} /><meshBasicMaterial color="#8f9b9c" transparent opacity={.075} depthWrite={false} /></mesh>
      </group>}

      <group position={[8.7, 0, .2]}>
        <mesh position={[0, 1.1, 0]} rotation={[-.18, 0, 0]}><boxGeometry args={[4.7, 2.2, 2.7]} /><meshPhysicalMaterial color="#0b0e0f" metalness={.91} roughness={.26} /></mesh>
        <mesh position={[0, 2.12, -.5]} rotation={[-.18, 0, 0]}><boxGeometry args={[3.6, 1.28, .08]} /><meshBasicMaterial color="#839094" transparent opacity={.18} toneMapped={false} /></mesh>
        {Array.from({ length: 6 }, (_, index) => <mesh key={index} position={[-1.45 + index * .58, 2.1, -.55]}><boxGeometry args={[.24, .025, .02]} /><meshBasicMaterial color="#b2baba" transparent opacity={index === progressed % 6 ? .72 : .2} toneMapped={false} /></mesh>)}
        <InteractionVolume id="system-terminal" position={[0, 1.6, -.2]} size={[4.8, 3.2, 2.9]} />
        <WorldLabel primary="SYSTEM NODE" secondary="LOCAL TERMINAL / INTERACT" position={[0, 4.15, .5]} rotation={[0, -.18, 0]} active={target === "system-terminal"} />
      </group>

      <MeasurementArray gameplay={gameplay} target={target} reducedMotion={reducedMotion} />
      <NexusActivities gameplay={gameplay} scanner={scanner} target={target} />
      <UpperLedge visited={gameplay.ledgeVisited} active={target === "nexus-ledge"} />

      <RouteGate id="route-record-vault" position={[-4.15, 0, 5.7]} side={-1} label="LEFT" detail="RECORD VAULT / OPTIONAL" open={progress.discoveredRooms.includes("record-vault")} active={target === "route-record-vault"} />
      <RouteGate id="route-signal-room" position={[4.15, 0, 5.7]} side={1} label="RIGHT" detail={gameplay.arrayCalibrated ? "SIGNAL ROOM / ROUTE ACTIVE" : "SIGNAL ROOM / ALIGN ARRAY"} open={gameplay.arrayCalibrated || progress.discoveredRooms.includes("signal-room")} active={gameplay.arrayCalibrated || target === "route-signal-room"} />
      <MaintenanceHatch available={gameplay.relayStabilized || progress.hiddenPassageDiscovered} active={target === "route-maintenance-spine"} />

      <group position={[-8.4, 0, 8.2]}>
        {[0, 1, 2].map((index) => <mesh key={index} position={[index * .72, 2.2 + index * .55, -.45 * index]} rotation={[0, .22, -.06]}><boxGeometry args={[.5, 4.4 + index, 2.5]} /><meshPhysicalMaterial color="#0b0f10" metalness={.9} roughness={.3} /></mesh>)}
      </group>
      <group position={[6.9, 4.5, 5.9]}>
        {Array.from({ length: 9 }, (_, index) => <mesh key={index} position={[(index - 4) * .31, Math.sin(index * 1.1) * .55, 0]}><boxGeometry args={[.06, .28 + Math.abs(Math.sin(index)) * .8, .04]} /><meshBasicMaterial color="#aeb9b9" transparent opacity={traceAcquired ? .68 : .3} toneMapped={false} /></mesh>)}
      </group>
      <group position={[-6.9, 4.5, 5.9]}>{[0, 1, 2, 3].map((index) => <mesh key={index} position={[(index - 1.5) * .62, index % 2 ? .6 : -.4, 0]}><boxGeometry args={[.34, 2.6 + index * .45, .06]} /><meshBasicMaterial color="#d2cbc1" transparent opacity={gameplay.topologyCompared ? .46 : .24} toneMapped={false} /></mesh>)}</group>
      <mesh position={[4.2, .055, 6.6]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[5.2, 4.8]} /><meshBasicMaterial color="#8fa1a4" transparent opacity={gameplay.arrayCalibrated ? .16 : .07} /></mesh>
      <mesh position={[-4.2, .055, 6.6]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[5.2, 4.8]} /><meshBasicMaterial color="#b9afa4" transparent opacity={gameplay.topologyCompared ? .14 : .065} /></mesh>
      <mesh position={[0, .055, -16.8]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[7.2, 4.8]} /><meshBasicMaterial color="#c2c8c5" transparent opacity={.1 + (gameplay.relayStabilized ? .08 : 0)} /></mesh>

      {doorData.map((door, index) => <SectorDoor key={index} index={index + 1} position={door.position} rotation={door.rotation} available={index === 0 || index < discoveredCount} changed={(index === 0 && session.maxGravityIntensity > .7) || (index === 2 && session.event13Discovered) || (index === 4 && session.voidProbeCount > 0)} />)}
      <InteractionVolume id="restricted-sector" position={[11.1, 3.1, 7.1]} size={[2, 6.2, 4.2]} />
      <WorldLabel primary="N-06" secondary="ACCESS / RESTRICTED" position={[11.55, 7.65, 6.2]} rotation={[0, -Math.PI / 2, 0]} width={3.6} active={target === "restricted-sector"} />

      <group position={[2.8, 5.8, -13.4]} userData={{ interactionId: "event-seven" }}>
        <mesh><boxGeometry args={[.028, 9.5, .028]} /><meshBasicMaterial color="#b7aaa2" transparent opacity={session.archiveUnlocked ? .28 : .1} toneMapped={false} /></mesh>
        <InteractionVolume id="event-seven" position={[0, 0, 0]} size={[1.1, 10, 1.1]} />
      </group>
      {traceAcquired && <group position={[8.4, 5.6, -16.8]} rotation={[0, -.18, 0]}>
        <mesh position={[-1.85, 0, 0]}><boxGeometry args={[.07, 8.8, .08]} /><meshBasicMaterial color="#b9aaa2" transparent opacity={.38} toneMapped={false} /></mesh>
        <mesh position={[1.85, 1.45, 0]}><boxGeometry args={[.07, 5.9, .08]} /><meshBasicMaterial color="#b9aaa2" transparent opacity={.27} toneMapped={false} /></mesh>
        <mesh position={[0, 4.38, 0]}><boxGeometry args={[3.75, .07, .08]} /><meshBasicMaterial color="#b9aaa2" transparent opacity={.34} toneMapped={false} /></mesh>
        <WorldLabel primary="N-07" secondary="COORDINATE / BEHIND WALL" position={[0, 5.25, .08]} width={3.8} active />
      </group>}
      {(n07.tier > 0 || session.returningVisitor) && <N07Gate evaluation={n07} reducedMotion={reducedMotion} active={target === "n07-gate"} committed={Boolean(progress.consequences.endingCommit)} completed={progress.n07.completed} route={progress.n07.route} interpretation={progress.n07.interpretation} />}
    </group>
  );
}
