import type { FacilityRoom, PlayerPose } from "./gameTypes";

export type CollisionBox = { minX: number; maxX: number; minZ: number; maxZ: number };
export type FacilityCollision = { minX: number; maxX: number; minZ: number; maxZ: number; blockers: CollisionBox[] };

export const facilityPoses: Record<FacilityRoom, PlayerPose> = {
  nexus: { position: [0.8, 1.72, 13.5], yaw: 0, pitch: 0.09 },
  "record-vault": { position: [0, 1.72, 11.4], yaw: 0, pitch: 0.06 },
  "signal-room": { position: [0, 1.72, 10.6], yaw: 0, pitch: 0.12 },
  "dead-sector": { position: [-0.6, 1.72, 9.6], yaw: 0, pitch: 0.04 },
  "observation-deck": { position: [0, 1.72, 8.8], yaw: 0, pitch: 0.08 },
  "maintenance-spine": { position: [0, 1.72, 12.2], yaw: 0, pitch: 0.02 },
};

export const facilityCollision: Record<FacilityRoom, FacilityCollision> = {
  nexus: {
    minX: -13.8, maxX: 13.8, minZ: -17.2, maxZ: 15.5,
    blockers: [
      { minX: -2.9, maxX: 2.9, minZ: -10.2, maxZ: -4.2 },
      { minX: -11.7, maxX: -5.1, minZ: -3.7, maxZ: 1.8 },
      { minX: 6.1, maxX: 11.8, minZ: -2.5, maxZ: 2.9 },
      { minX: -14.5, maxX: -11.9, minZ: -15.5, maxZ: 9.5 },
      { minX: 11.9, maxX: 14.5, minZ: -15.5, maxZ: 9.5 },
      { minX: -7.45, maxX: -2.85, minZ: 6.45, maxZ: 7.9 },
      { minX: 2.85, maxX: 7.45, minZ: 6.45, maxZ: 7.9 },
    ],
  },
  "record-vault": { minX: -9.8, maxX: 9.8, minZ: -17.5, maxZ: 13, blockers: [{ minX: -2.6, maxX: 2.6, minZ: -6.5, maxZ: -2.2 }, { minX: -9.8, maxX: -7.1, minZ: -12, maxZ: 5.5 }] },
  "signal-room": { minX: -10.8, maxX: 10.8, minZ: -15.5, maxZ: 12, blockers: [{ minX: -4.6, maxX: 4.6, minZ: -7.4, maxZ: -3.2 }, { minX: 6.4, maxX: 10.8, minZ: -13, maxZ: -5.5 }] },
  "dead-sector": { minX: -9.5, maxX: 9.5, minZ: -14.5, maxZ: 11, blockers: [{ minX: -4.5, maxX: 4.5, minZ: -8.5, maxZ: -3.5 }] },
  "observation-deck": { minX: -12.5, maxX: 12.5, minZ: -10.5, maxZ: 10.5, blockers: [{ minX: -12.5, maxX: 12.5, minZ: -10.5, maxZ: -8.6 }] },
  "maintenance-spine": { minX: -4.2, maxX: 4.2, minZ: -19.5, maxZ: 14, blockers: [{ minX: -4.2, maxX: -2.9, minZ: -19.5, maxZ: 14 }, { minX: 2.9, maxX: 4.2, minZ: -19.5, maxZ: 14 }] },
};

export function safeFacilityPose(room: FacilityRoom, pose?: PlayerPose): PlayerPose {
  const fallback = facilityPoses[room];
  if (!pose || pose.position.length !== 3 || ![...pose.position, pose.yaw, pose.pitch].every(Number.isFinite)) return fallback;
  const bounds = facilityCollision[room];
  const x = Math.max(bounds.minX + .5, Math.min(bounds.maxX - .5, pose.position[0]));
  const z = Math.max(bounds.minZ + .5, Math.min(bounds.maxZ - .5, pose.position[2]));
  const blocked = bounds.blockers.some((box) => x > box.minX - .42 && x < box.maxX + .42 && z > box.minZ - .42 && z < box.maxZ + .42);
  return blocked ? fallback : { position: [x, 1.72, z], yaw: pose.yaw, pitch: Math.max(-1.08, Math.min(1.08, pose.pitch)) };
}
