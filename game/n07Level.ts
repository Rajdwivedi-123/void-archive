import type { N07ApproachVector } from "./consequenceTypes";
import type { PlayerPose } from "./gameTypes";

export type N07Area = "threshold" | "corridor" | "trace" | "investigation" | "failure" | "observer" | "exterior";
export type N07Route = "archive-model" | "contradiction";
export type N07InterpretiveAction = "stabilize" | "preserve";
export type N07Interpretation = "sector" | "archive" | "observer" | "event";
export type N07TopologyState = "observed" | "unobserved" | "scanner-confirmed" | "memory-stabilized" | "trace-stabilized";
export type N07TraceStrategy = "synchronize" | "diverge";
export type N07TraceKind = "entry" | "turn" | "scanner" | "interaction" | "pause" | "commit";
export type N07EvidenceAnchor = "event-13" | "signal-7a" | "void-boundary" | "memory-record";
export type N07ExteriorScan = "archive" | "horizon" | "observer";

export type N07TraceSample = {
  kind: N07TraceKind;
  area: N07Area;
  position: [number, number, number];
  stamp: number;
};

export type N07LevelProgress = {
  version: 2;
  entered: boolean;
  completed: boolean;
  area: N07Area;
  vector: N07ApproachVector;
  topologyState: N07TopologyState;
  topologySolved: boolean;
  stillnessRevealed: boolean;
  reflectionConfirmed: boolean;
  traceStrategy: N07TraceStrategy | null;
  traceSamples: N07TraceSample[];
  traceSynchronized: boolean;
  futureSelfSeen: boolean;
  predictionConfidence: number;
  evidenceAnchors: N07EvidenceAnchor[];
  evidenceBridge: "supported" | "contradictory" | null;
  investigationSolved: boolean;
  failureAnchors: number[];
  failureRecovered: boolean;
  recoveryCount: number;
  observerSolved: boolean;
  observerChoice: "direct" | "wait" | null;
  route: N07Route | null;
  secretFound: boolean;
  traversalComplete: boolean;
  exteriorScans: N07ExteriorScan[];
  windowObserved: boolean;
  externalMeasured: boolean;
  interpretation: N07Interpretation | null;
  finalAction: N07InterpretiveAction | null;
  checkpointPose: PlayerPose;
  returnVisits: number;
};

export const n07AreaOrder: N07Area[] = ["threshold", "corridor", "trace", "investigation", "failure", "observer", "exterior"];

export const n07AreaPoses: Record<N07Area, PlayerPose> = {
  threshold: { position: [0, 1.72, 12.5], yaw: 0, pitch: .04 },
  corridor: { position: [0, 1.72, 3.5], yaw: 0, pitch: .03 },
  trace: { position: [0, 1.72, -14], yaw: 0, pitch: .03 },
  investigation: { position: [0, 1.72, -33], yaw: 0, pitch: .02 },
  failure: { position: [0, 1.72, -52], yaw: 0, pitch: .03 },
  observer: { position: [0, 1.72, -70], yaw: 0, pitch: .06 },
  exterior: { position: [0, 1.72, -91], yaw: 0, pitch: .08 },
};

export function appendN07Trace(progress: N07LevelProgress, sample: Omit<N07TraceSample, "stamp">): N07TraceSample[] {
  const previous = progress.traceSamples.at(-1);
  if (previous?.kind === sample.kind && previous.area === sample.area) return progress.traceSamples;
  return [...progress.traceSamples, { ...sample, stamp: Date.now() }].slice(-24);
}

export function createN07LevelProgress(vector: N07ApproachVector = "adaptive"): N07LevelProgress {
  return {
    version: 2, entered: false, completed: false, area: "threshold", vector,
    topologyState: "observed", topologySolved: false, stillnessRevealed: false, reflectionConfirmed: false,
    traceStrategy: null, traceSamples: [], traceSynchronized: false, futureSelfSeen: false, predictionConfidence: .82,
    evidenceAnchors: [], evidenceBridge: null, investigationSolved: false,
    failureAnchors: [], failureRecovered: false, recoveryCount: 0,
    observerSolved: false, observerChoice: null, route: null, secretFound: false, traversalComplete: false,
    exteriorScans: [], windowObserved: false, externalMeasured: false, interpretation: null, finalAction: null,
    checkpointPose: n07AreaPoses.threshold, returnVisits: 0,
  };
}

const isPose = (value: unknown): value is PlayerPose => Boolean(value && typeof value === "object" && Array.isArray((value as PlayerPose).position));

export function sanitizeN07Level(saved: unknown, vector: N07ApproachVector = "adaptive"): N07LevelProgress {
  const fallback = createN07LevelProgress(vector);
  if (!saved || typeof saved !== "object") return fallback;
  const raw = saved as Record<string, unknown>;
  const legacyArea: Record<string, N07Area> = { reconstruction: "corridor", causal: "trace", missing: "investigation" };
  const areaCandidate = legacyArea[String(raw.area)] ?? raw.area;
  const area = n07AreaOrder.includes(areaCandidate as N07Area) ? areaCandidate as N07Area : "threshold";
  const interpretations: N07Interpretation[] = ["sector", "archive", "observer", "event"];
  const topologyStates: N07TopologyState[] = ["observed", "unobserved", "scanner-confirmed", "memory-stabilized", "trace-stabilized"];
  const evidenceKinds: N07EvidenceAnchor[] = ["event-13", "signal-7a", "void-boundary", "memory-record"];
  const scans: N07ExteriorScan[] = ["archive", "horizon", "observer"];
  const trace = Array.isArray(raw.traceSamples) ? raw.traceSamples.filter((item): item is N07TraceSample => Boolean(item && typeof item === "object" && typeof (item as N07TraceSample).kind === "string" && Array.isArray((item as N07TraceSample).position))).slice(-24) : [];
  const migratedSolved = Boolean(raw.topologySolved);
  return {
    ...fallback,
    entered: Boolean(raw.entered), completed: Boolean(raw.completed), area,
    vector: ["temporal", "spatial", "mnemonic", "adaptive"].includes(String(raw.vector)) ? raw.vector as N07ApproachVector : vector,
    topologyState: topologyStates.includes(raw.topologyState as N07TopologyState) ? raw.topologyState as N07TopologyState : migratedSolved ? "scanner-confirmed" : "observed",
    topologySolved: migratedSolved, stillnessRevealed: Boolean(raw.stillnessRevealed), reflectionConfirmed: Boolean(raw.reflectionConfirmed),
    traceStrategy: raw.traceStrategy === "synchronize" || raw.traceStrategy === "diverge" ? raw.traceStrategy : null,
    traceSamples: trace, traceSynchronized: Boolean(raw.traceSynchronized ?? raw.causalSolved), futureSelfSeen: Boolean(raw.futureSelfSeen),
    predictionConfidence: Number.isFinite(raw.predictionConfidence) ? Math.max(0, Math.min(1, Number(raw.predictionConfidence))) : .82,
    evidenceAnchors: Array.isArray(raw.evidenceAnchors) ? evidenceKinds.filter((item) => (raw.evidenceAnchors as unknown[]).includes(item)) : [],
    evidenceBridge: raw.evidenceBridge === "supported" || raw.evidenceBridge === "contradictory" ? raw.evidenceBridge : null,
    investigationSolved: Boolean(raw.investigationSolved),
    failureAnchors: Array.isArray(raw.failureAnchors) ? [...new Set(raw.failureAnchors.filter((item): item is number => Number.isInteger(item) && Number(item) >= 1 && Number(item) <= 3))] : [],
    failureRecovered: Boolean(raw.failureRecovered), recoveryCount: Number.isFinite(raw.recoveryCount) ? Math.max(0, Number(raw.recoveryCount)) : 0,
    observerSolved: Boolean(raw.observerSolved), observerChoice: raw.observerChoice === "direct" || raw.observerChoice === "wait" ? raw.observerChoice : null,
    route: raw.route === "archive-model" || raw.route === "contradiction" ? raw.route : null,
    secretFound: Boolean(raw.secretFound), traversalComplete: Boolean(raw.traversalComplete),
    exteriorScans: Array.isArray(raw.exteriorScans) ? scans.filter((item) => (raw.exteriorScans as unknown[]).includes(item)) : [],
    windowObserved: Boolean(raw.windowObserved), externalMeasured: Boolean(raw.externalMeasured),
    interpretation: interpretations.includes(raw.interpretation as N07Interpretation) ? raw.interpretation as N07Interpretation : null,
    finalAction: raw.finalAction === "stabilize" || raw.finalAction === "preserve" ? raw.finalAction : null,
    checkpointPose: isPose(raw.checkpointPose) ? raw.checkpointPose : n07AreaPoses[area],
    returnVisits: Number.isFinite(raw.returnVisits) ? Math.max(0, Number(raw.returnVisits)) : 0,
  };
}
