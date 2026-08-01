"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import type { FacilityRoom, NexusInteractionId, PlayerPose } from "@/game/gameTypes";
import type { NexusControlStore } from "@/game/NexusControlStore";
import { facilityCollision } from "@/game/facilityTopology";

type Props = {
  active: boolean;
  tier: DeviceTier;
  reducedMotion: boolean;
  controls: NexusControlStore;
  initialPose: PlayerPose;
  room: FacilityRoom;
  onTarget: (target: NexusInteractionId | null) => void;
  onInteract: (target: NexusInteractionId) => void;
  onScannerToggle: () => void;
  onPose: (pose: PlayerPose) => void;
  onPointerLock: (locked: boolean) => void;
};

function blocked(room: FacilityRoom, x: number, z: number) {
  return facilityCollision[room].blockers.some((box) => x > box.minX - .42 && x < box.maxX + .42 && z > box.minZ - .42 && z < box.maxZ + .42);
}

function interactionFrom(object: THREE.Object3D | null): NexusInteractionId | null {
  let current = object;
  while (current) {
    if (typeof current.userData.interactionId === "string") return current.userData.interactionId as NexusInteractionId;
    current = current.parent;
  }
  return null;
}

export function FirstPersonController({ active, tier, reducedMotion, controls, initialPose, room, onTarget, onInteract, onScannerToggle, onPose, onPointerLock }: Props) {
  const { gl, scene } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const yaw = useRef(initialPose.yaw);
  const pitch = useRef(initialPose.pitch);
  const targetRef = useRef<NexusInteractionId | null>(null);
  const activeRef = useRef(active);
  const poseKey = useRef("");
  const poseClock = useRef(0);
  const keys = useRef({ forward: false, backward: false, left: false, right: false, sprint: false });
  const vectorsRef = useRef({ forward: new THREE.Vector3(), right: new THREE.Vector3(), desired: new THREE.Vector3(), next: new THREE.Vector3() });
  const raycasterRef = useRef(new THREE.Raycaster());

  useEffect(() => { activeRef.current = active; if (!active) velocity.current.set(0, 0, 0); }, [active]);
  useEffect(() => { targetRef.current = null; onTarget(null); controls.clear(); }, [controls, onTarget, room]);

  useEffect(() => {
    const canvas = gl.domElement;
    const pointerLockChange = () => onPointerLock(document.pointerLockElement === canvas);
    const mouseMove = (event: MouseEvent) => {
      if (!activeRef.current || document.pointerLockElement !== canvas) return;
      const sensitivity = reducedMotion ? .00105 : .00135;
      yaw.current -= event.movementX * sensitivity;
      pitch.current = THREE.MathUtils.clamp(pitch.current - event.movementY * sensitivity, -1.08, 1.08);
    };
    const key = (event: KeyboardEvent, down: boolean) => {
      if (!activeRef.current) return;
      if (["KeyW", "KeyS", "KeyA", "KeyD", "ShiftLeft", "ShiftRight", "KeyE", "KeyQ", "Tab"].includes(event.code)) event.preventDefault();
      if (event.code === "KeyW") keys.current.forward = down;
      if (event.code === "KeyS") keys.current.backward = down;
      if (event.code === "KeyA") keys.current.left = down;
      if (event.code === "KeyD") keys.current.right = down;
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") keys.current.sprint = down;
      if (down && !event.repeat && event.code === "KeyE" && targetRef.current) onInteract(targetRef.current);
      if (down && !event.repeat && (event.code === "KeyQ" || event.code === "Tab")) onScannerToggle();
    };
    const requestLock = () => { if (activeRef.current && tier === "desktop" && document.pointerLockElement !== canvas) void canvas.requestPointerLock(); };
    const blur = () => { keys.current = { forward: false, backward: false, left: false, right: false, sprint: false }; };
    const keyDown = (event: KeyboardEvent) => key(event, true);
    const keyUp = (event: KeyboardEvent) => key(event, false);
    document.addEventListener("pointerlockchange", pointerLockChange);
    document.addEventListener("mousemove", mouseMove);
    window.addEventListener("blur", blur);
    canvas.addEventListener("click", requestLock);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    return () => {
      document.removeEventListener("pointerlockchange", pointerLockChange);
      document.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("blur", blur);
      canvas.removeEventListener("click", requestLock);
    };
  }, [gl, onInteract, onPointerLock, onScannerToggle, reducedMotion, tier]);

  useFrame((state, delta) => {
    if (!active) return;
    const nextPoseKey = `${room}:${initialPose.position.join(":")}:${initialPose.yaw}:${initialPose.pitch}`;
    if (poseKey.current !== nextPoseKey) {
      poseKey.current = nextPoseKey;
      yaw.current = initialPose.yaw;
      pitch.current = initialPose.pitch;
      velocity.current.set(0, 0, 0);
      state.camera.position.set(...initialPose.position);
      state.camera.rotation.set(initialPose.pitch, initialPose.yaw, 0, "YXZ");
      if (state.camera instanceof THREE.PerspectiveCamera) { state.camera.fov = tier === "mobile" ? 54 : 49; state.camera.updateProjectionMatrix(); }
    }
    const touch = controls.snapshot();
    const look = controls.consumeLook();
    if (look.x || look.y) {
      const sensitivity = tier === "mobile" ? .0032 : .0024;
      yaw.current -= look.x * sensitivity;
      pitch.current = THREE.MathUtils.clamp(pitch.current - look.y * sensitivity, -1.02, 1.02);
    }
    const vectors = vectorsRef.current;
    const raycaster = raycasterRef.current;
    state.camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");
    vectors.forward.set(0, 0, -1).applyEuler(state.camera.rotation).setY(0).normalize();
    vectors.right.crossVectors(vectors.forward, state.camera.up).normalize();
    vectors.desired.set(0, 0, 0);
    if (keys.current.forward || touch.forward) vectors.desired.add(vectors.forward);
    if (keys.current.backward || touch.backward) vectors.desired.sub(vectors.forward);
    if (keys.current.right || touch.right) vectors.desired.add(vectors.right);
    if (keys.current.left || touch.left) vectors.desired.sub(vectors.right);
    const moving = vectors.desired.lengthSq() > 0;
    if (moving) vectors.desired.normalize().multiplyScalar((keys.current.sprint || touch.sprint ? 4.25 : 2.35));
    velocity.current.x = THREE.MathUtils.damp(velocity.current.x, vectors.desired.x, moving ? 7 : 9, delta);
    velocity.current.z = THREE.MathUtils.damp(velocity.current.z, vectors.desired.z, moving ? 7 : 9, delta);
    vectors.next.copy(state.camera.position);
    const bounds = facilityCollision[room];
    const nextX = THREE.MathUtils.clamp(vectors.next.x + velocity.current.x * delta, bounds.minX, bounds.maxX);
    if (!blocked(room, nextX, vectors.next.z)) vectors.next.x = nextX;
    const nextZ = THREE.MathUtils.clamp(vectors.next.z + velocity.current.z * delta, bounds.minZ, bounds.maxZ);
    if (!blocked(room, vectors.next.x, nextZ)) vectors.next.z = nextZ;
    vectors.next.y = 1.72;
    state.camera.position.copy(vectors.next);

    raycaster.setFromCamera(new THREE.Vector2(0, 0), state.camera);
    raycaster.far = 4.6;
    const hit = raycaster.intersectObjects(scene.children, true).find((entry) => interactionFrom(entry.object));
    const nextTarget = hit ? interactionFrom(hit.object) : null;
    if (nextTarget !== targetRef.current) { targetRef.current = nextTarget; onTarget(nextTarget); }

    poseClock.current += delta;
    if (poseClock.current > .35) {
      poseClock.current = 0;
      onPose({ position: [state.camera.position.x, 1.72, state.camera.position.z], yaw: yaw.current, pitch: pitch.current });
    }
    state.invalidate();
  });

  return null;
}
