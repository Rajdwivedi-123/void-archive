import type { ArtifactId } from "@/artifacts/inspection";
import type { ObserverAffinity, RealitySession, RealitySnapshot } from "./realityTypes";

export const REALITY_STORAGE_KEY = "void-archive.reality.v2";

function sessionSeed() {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return `${bytes[0].toString(16).padStart(2, "0")}${bytes[1].toString(16).padStart(2, "0")}-${bytes[2].toString(16).padStart(2, "0")}`.toUpperCase();
}

export function createSession(): RealitySession {
  return {
    version: 2,
    seed: sessionSeed(),
    archiveUnlocked: false,
    event13Discovered: false,
    maxGravityIntensity: 0,
    mirrorObservationDepth: 0,
    temporalExploration: [0, 0, 0],
    neuralAdaptation: 0,
    voidProbeCount: 0,
    memoryRecallDepth: 0,
    recordsOpened: [],
    revisits: {},
    inspectionMs: {},
    totalInteractions: 0,
    realityFreezeSeen: false,
  };
}

export function loadSession(): RealitySession {
  const fallback = createSession();
  try {
    const saved = JSON.parse(localStorage.getItem(REALITY_STORAGE_KEY) ?? "null") as Partial<RealitySession> | null;
    if (!saved) return fallback;
    return {
      ...fallback,
      ...saved,
      version: 2,
      seed: typeof saved.seed === "string" ? saved.seed : fallback.seed,
      temporalExploration: Array.isArray(saved.temporalExploration) && saved.temporalExploration.length === 3 ? saved.temporalExploration as [number, number, number] : fallback.temporalExploration,
      recordsOpened: Array.isArray(saved.recordsOpened) ? saved.recordsOpened.slice(0, 24) : [],
      revisits: saved.revisits ?? {},
      inspectionMs: saved.inspectionMs ?? {},
    };
  } catch {
    return fallback;
  }
}

export function saveSession(session: RealitySession) {
  try { localStorage.setItem(REALITY_STORAGE_KEY, JSON.stringify(session)); } catch { /* storage is optional */ }
}

const affinityById: Record<ArtifactId, ObserverAffinity> = {
  "001": "gravity", "002": "optical", "003": "temporal", "004": "adaptive", "005": "spatial", "006": "mnemonic",
};

export function deriveSnapshot(session: RealitySession): RealitySnapshot {
  const scores: Record<ObserverAffinity, number> = {
    gravity: session.maxGravityIntensity * 3 + (session.inspectionMs["001"] ?? 0) / 9000,
    optical: session.mirrorObservationDepth * 3 + (session.inspectionMs["002"] ?? 0) / 9000,
    temporal: Math.max(...session.temporalExploration) + (session.inspectionMs["003"] ?? 0) / 9000,
    adaptive: session.neuralAdaptation * 3 + (session.inspectionMs["004"] ?? 0) / 9000,
    spatial: session.voidProbeCount * .7 + (session.inspectionMs["005"] ?? 0) / 9000,
    mnemonic: session.memoryRecallDepth * 3 + (session.inspectionMs["006"] ?? 0) / 9000,
  };
  Object.entries(session.revisits).forEach(([id, count]) => { scores[affinityById[id as ArtifactId]] += count ?? 0; });
  const affinity = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "gravity") as ObserverAffinity;
  const observerConfidence = Math.min(1, session.archiveUnlocked ? .92 : .14 + session.totalInteractions * .055);
  return { ...session, affinity, observerConfidence };
}
