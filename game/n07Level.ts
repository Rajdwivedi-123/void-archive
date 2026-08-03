import type { N07ApproachVector } from "./consequenceTypes";
import type { PlayerPose } from "./gameTypes";

export type N07Area = "threshold" | "reconstruction" | "causal" | "missing" | "observer" | "exterior";
export type N07Route = "archive-model" | "contradiction";
export type N07InterpretiveAction = "stabilize" | "preserve";
export type N07CausalEvent = "pre-record" | "signal-response" | "containment-change" | "observer-arrival";

export type N07LevelProgress = {
  version: 1;
  entered: boolean;
  completed: boolean;
  area: N07Area;
  vector: N07ApproachVector;
  topologySolved: boolean;
  causalSequence: N07CausalEvent[];
  causalSolved: boolean;
  observerSolved: boolean;
  observerChoice: "direct" | "wait" | null;
  route: N07Route | null;
  secretFound: boolean;
  traversalComplete: boolean;
  finalAction: N07InterpretiveAction | null;
  checkpointPose: PlayerPose;
  returnVisits: number;
};

export const n07AreaPoses: Record<N07Area, PlayerPose> = {
  threshold: { position: [0, 1.72, 12.5], yaw: 0, pitch: .05 },
  reconstruction: { position: [0, 1.72, 5.8], yaw: 0, pitch: .06 },
  causal: { position: [0, 1.72, -10.5], yaw: 0, pitch: .03 },
  missing: { position: [0, 1.72, -29.5], yaw: 0, pitch: .02 },
  observer: { position: [0, 1.72, -49], yaw: 0, pitch: .07 },
  exterior: { position: [0, 1.72, -70], yaw: 0, pitch: .08 },
};

export const n07CausalOrder: N07CausalEvent[] = ["pre-record", "signal-response", "containment-change", "observer-arrival"];

export function createN07LevelProgress(vector: N07ApproachVector = "adaptive"): N07LevelProgress {
  return { version: 1, entered: false, completed: false, area: "threshold", vector, topologySolved: false, causalSequence: [], causalSolved: false, observerSolved: false, observerChoice: null, route: null, secretFound: false, traversalComplete: false, finalAction: null, checkpointPose: n07AreaPoses.threshold, returnVisits: 0 };
}

export function sanitizeN07Level(saved: unknown, vector: N07ApproachVector = "adaptive"): N07LevelProgress {
  const fallback = createN07LevelProgress(vector);
  if (!saved || typeof saved !== "object") return fallback;
  const value = saved as Partial<N07LevelProgress>;
  const areas: N07Area[] = ["threshold", "reconstruction", "causal", "missing", "observer", "exterior"];
  const events = n07CausalOrder.filter((event) => value.causalSequence?.includes(event));
  const area = areas.includes(value.area as N07Area) ? value.area as N07Area : "threshold";
  return {
    ...fallback, ...value, version: 1, area, vector: ["temporal", "spatial", "mnemonic", "adaptive"].includes(value.vector ?? "") ? value.vector as N07ApproachVector : vector,
    causalSequence: events.slice(0, 4), route: value.route === "archive-model" || value.route === "contradiction" ? value.route : null,
    observerChoice: value.observerChoice === "direct" || value.observerChoice === "wait" ? value.observerChoice : null,
    finalAction: value.finalAction === "stabilize" || value.finalAction === "preserve" ? value.finalAction : null,
    checkpointPose: value.checkpointPose && Array.isArray(value.checkpointPose.position) ? value.checkpointPose : n07AreaPoses[area],
    returnVisits: Number.isFinite(value.returnVisits) ? Math.max(0, value.returnVisits as number) : 0,
  };
}
