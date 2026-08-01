import type { ArtifactId } from "@/artifacts/inspection";
import type { AffinityScores, ObserverAffinity, ObserverArchetype, ObservationQuality, RealitySession, RealitySnapshot } from "./realityTypes";

export const REALITY_STORAGE_KEY = "void-archive.reality.v3";
const LEGACY_STORAGE_KEY = "void-archive.reality.v2";

function sessionSeed() {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return `${bytes[0].toString(16).padStart(2, "0")}${bytes[1].toString(16).padStart(2, "0")}-${bytes[2].toString(16).padStart(2, "0")}`.toUpperCase();
}

export function createSession(): RealitySession {
  return {
    version: 3, seed: sessionSeed(), archiveUnlocked: false, returningVisitor: false, completedRuns: 0,
    event13Discovered: false, maxGravityIntensity: 0, mirrorObservationDepth: 0,
    temporalExploration: [0, 0, 0], neuralAdaptation: 0, voidProbeCount: 0, memoryRecallDepth: 0,
    recordsOpened: [], revisits: {}, inspectionMs: {}, controlCounts: {}, visitOrder: [],
    archiveViews: 0, connectionViews: 0, pointerMotion: 0, totalInteractions: 0,
    realityFreezeSeen: false, n07Route: null,
    facilityTraits: { record: 0, signal: 0, spatial: 0, intervention: 0, witness: 0 }, facilityRooms: [], facilityClues: [],
  };
}

export function loadSession(): RealitySession {
  const fallback = createSession();
  try {
    const raw = localStorage.getItem(REALITY_STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    const saved = JSON.parse(raw ?? "null") as Partial<RealitySession> | null;
    if (!saved) return fallback;
    const archiveUnlocked = Boolean(saved.archiveUnlocked);
    return {
      ...fallback, ...saved, version: 3,
      seed: typeof saved.seed === "string" ? saved.seed : fallback.seed,
      archiveUnlocked, returningVisitor: archiveUnlocked,
      completedRuns: Math.max(saved.completedRuns ?? 0, archiveUnlocked ? 1 : 0),
      temporalExploration: Array.isArray(saved.temporalExploration) && saved.temporalExploration.length === 3 ? saved.temporalExploration as [number, number, number] : fallback.temporalExploration,
      recordsOpened: Array.isArray(saved.recordsOpened) ? saved.recordsOpened.slice(-36) : [],
      visitOrder: Array.isArray(saved.visitOrder) ? saved.visitOrder.slice(-18) : [],
      revisits: saved.revisits ?? {}, inspectionMs: saved.inspectionMs ?? {}, controlCounts: saved.controlCounts ?? {},
      facilityTraits: { ...fallback.facilityTraits, ...(saved.facilityTraits ?? {}) },
      facilityRooms: Array.isArray(saved.facilityRooms) ? saved.facilityRooms.slice(-12) : [],
      facilityClues: Array.isArray(saved.facilityClues) ? saved.facilityClues.slice(-12) : [],
    };
  } catch { return fallback; }
}

export function saveSession(session: RealitySession) {
  try { localStorage.setItem(REALITY_STORAGE_KEY, JSON.stringify(session)); } catch { /* optional storage */ }
}

export function clearSession() {
  try { localStorage.removeItem(REALITY_STORAGE_KEY); localStorage.removeItem(LEGACY_STORAGE_KEY); } catch { /* optional storage */ }
}

const affinityById: Record<ArtifactId, keyof AffinityScores> = {
  "001": "gravityAffinity", "002": "opticalAffinity", "003": "temporalAffinity",
  "004": "neuralAffinity", "005": "spatialAffinity", "006": "mnemonicAffinity",
};
const legacyAffinity: Record<keyof AffinityScores, ObserverAffinity> = {
  gravityAffinity: "gravity", opticalAffinity: "optical", temporalAffinity: "temporal",
  neuralAffinity: "adaptive", spatialAffinity: "spatial", mnemonicAffinity: "mnemonic",
};

function scoresFor(session: RealitySession): AffinityScores {
  const scores: AffinityScores = {
    gravityAffinity: session.maxGravityIntensity * 3 + (session.inspectionMs["001"] ?? 0) / 9000,
    opticalAffinity: session.mirrorObservationDepth * 3 + (session.inspectionMs["002"] ?? 0) / 9000,
    temporalAffinity: Math.max(...session.temporalExploration) + (session.inspectionMs["003"] ?? 0) / 9000,
    neuralAffinity: session.neuralAdaptation * 3 + (session.inspectionMs["004"] ?? 0) / 9000,
    spatialAffinity: session.voidProbeCount * .7 + (session.inspectionMs["005"] ?? 0) / 9000 + session.connectionViews * .35,
    mnemonicAffinity: session.memoryRecallDepth * 3 + (session.inspectionMs["006"] ?? 0) / 9000,
  };
  scores.mnemonicAffinity += session.facilityTraits.record * .42 + session.facilityTraits.witness * .16;
  scores.temporalAffinity += session.facilityTraits.signal * .36;
  scores.neuralAffinity += session.facilityTraits.signal * .18 + session.facilityTraits.intervention * .22;
  scores.spatialAffinity += session.facilityTraits.spatial * .48;
  scores.gravityAffinity += session.facilityTraits.intervention * .14;
  Object.entries(session.revisits).forEach(([id, count]) => { scores[affinityById[id as ArtifactId]] += count ?? 0; });
  return scores;
}

function archetypeFor(session: RealitySession, scores: AffinityScores): ObserverArchetype {
  const controls = Object.values(session.controlCounts).reduce((sum, value) => sum + (value ?? 0), 0);
  const dwell = Object.values(session.inspectionMs).reduce((sum, value) => sum + (value ?? 0), 0);
  if (controls >= 7 || session.maxGravityIntensity > .82) return "interventionist";
  const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] as keyof AffinityScores;
  if (dominant === "temporalAffinity") return "chronologist";
  if (dominant === "spatialAffinity") return "cartographer";
  if (dominant === "neuralAffinity") return "synaptic";
  if (dominant === "mnemonicAffinity") return "mnemonist";
  if (dwell > 12000 || session.totalInteractions < 4) return "witness";
  return controls > 2 ? "interventionist" : "witness";
}

function qualityFor(session: RealitySession): ObservationQuality {
  const dwell = Object.values(session.inspectionMs).reduce((sum, value) => sum + (value ?? 0), 0);
  const explored = Object.keys(session.inspectionMs).length + Object.keys(session.revisits).length;
  if (session.completedRuns > 0 && dwell > 30000) return "extended";
  if (session.archiveUnlocked && explored >= 4) return "coherent";
  if (session.archiveUnlocked && explored < 3) return "interrupted";
  return "partial";
}

function seededNumber(seed: string, salt: number) {
  let value = salt * 97;
  for (const char of seed) value = (value * 31 + char.charCodeAt(0)) >>> 0;
  return value;
}

export function deriveSnapshot(session: RealitySession): RealitySnapshot {
  const affinities = scoresFor(session);
  const dominant = Object.entries(affinities).sort((a, b) => b[1] - a[1])[0]?.[0] as keyof AffinityScores;
  const affinity = legacyAffinity[dominant] ?? "gravity";
  const archetype = archetypeFor(session, affinities);
  const observerConfidence = Math.min(.99, (session.archiveUnlocked ? .62 : .12) + Math.min(24, session.totalInteractions) * .018 + Object.keys(session.inspectionMs).length * .035);
  const recallOrder = (["001", "002", "003", "004", "005", "006"] as ArtifactId[]).sort((a, b) => affinities[affinityById[b]] - affinities[affinityById[a]]);
  const n1 = seededNumber(session.seed, 1); const n2 = seededNumber(session.seed, 2);
  return {
    ...session, affinity, affinities, archetype, observerConfidence,
    observationQuality: qualityFor(session),
    temporalNeuralBranch: affinities.temporalAffinity >= affinities.neuralAffinity ? "causality" : "anticipation",
    neuralVoidBranch: affinities.spatialAffinity > affinities.neuralAffinity + .3 ? "spatial-mismatch" : affinities.neuralAffinity > 1 ? "structural" : "quiet",
    recallOrder,
    measurements: {
      drift: `${((n1 % 83) + 17) / 1000}`.slice(0, 5),
      phase: `${(n2 % 271) + 38}.${n1 % 10} ms`,
      returnDistance: `${41 + n1 % 17}.${n2 % 10} m`,
      mnemonicIndex: `M-${String((n1 + n2) % 97).padStart(2, "0")}`,
    },
  };
}
