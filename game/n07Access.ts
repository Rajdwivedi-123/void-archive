import type { ConsequenceEnding, N07ApproachVector } from "./consequenceTypes";
import type { FacilityProgress } from "./gameTypes";

export type N07AccessTier = 0 | 1 | 2 | 3 | 4 | 5;
export type N07AccessEvaluation = {
  tier: N07AccessTier;
  vector: N07ApproachVector;
  strengths: Record<N07ApproachVector, number>;
  eligibleEndings: ConsequenceEnding[];
  keyEvidence: string[];
  unresolvedEvidence: string[];
  alignmentReady: boolean;
  thresholdReady: boolean;
  returningVariant: boolean;
  facilityState: string;
};

const vectorOrder: N07ApproachVector[] = ["temporal", "spatial", "mnemonic", "adaptive"];

export function evaluateN07Access(progress: FacilityProgress, returningVisitor = false): N07AccessEvaluation {
  const c = progress.consequences;
  const evidence = new Set(progress.investigation.evidenceDiscovered);
  const knowledge = new Set(progress.investigation.knowledgeFlags);
  const accepted = new Set(c.acceptedCorrelations);
  const strengths: Record<N07ApproachVector, number> = {
    temporal: (c.event13Resolved ? 2 : 0) + (c.signal7aResolution === "temporal" ? 2 : 0) + (accepted.has("S-7A|T-13") || knowledge.has("n07-temporal-vector") ? 2 : 0) + (evidence.has("R-07-FUTURE") ? 1 : 0),
    spatial: (c.voidBoundaryExposed ? 2 : 0) + (c.deadSectorInvestigated ? 1 : 0) + (c.signal7aResolution === "spatial" ? 2 : 0) + (knowledge.has("n07-spatial-vector") || evidence.has("N07-SPATIAL") ? 2 : 0) + (c.hiddenPassageUsed ? 1 : 0),
    mnemonic: (c.memoryRestorationCommitted ? 3 : 0) + (evidence.has("M-FOREIGN") ? 1 : 0) + (evidence.has("R-07-FUTURE") ? 1 : 0) + (accepted.has("M-FOREIGN|R-07-FUTURE") ? 2 : 0) + (returningVisitor ? 1 : 0),
    adaptive: (c.neuralStrategy ? 1 : 0) + (c.neuralPredictionTriggered ? 2 : 0) + (c.signal7aResolution === "neural" ? 2 : 0) + (knowledge.has("subject-07-identified") ? 2 : 0) + (c.observerArchetype === "synaptic" ? 1 : 0),
  };
  const preferred: Partial<Record<string, N07ApproachVector>> = { chronologist: "temporal", cartographer: "spatial", mnemonist: "mnemonic", synaptic: "adaptive" };
  const vector = [...vectorOrder].sort((a, b) => strengths[b] - strengths[a] || (a === preferred[c.observerArchetype] ? -1 : b === preferred[c.observerArchetype] ? 1 : vectorOrder.indexOf(a) - vectorOrder.indexOf(b)))[0];
  const dominant = strengths[vector];
  const distinctVectors = vectorOrder.filter((item) => strengths[item] >= 2).length;
  const connected = c.acceptedCorrelations.length + progress.investigation.evidenceConnections.length;
  const explored = progress.investigation.puzzlesSolved.length + c.optionalRoomsVisited.length;
  const rare = c.event13Resolved && c.voidBoundaryExposed && c.memoryRestorationCommitted && c.neuralPredictionTriggered && distinctVectors >= 3 && connected >= 2;
  let tier: N07AccessTier = 0;
  if (progress.n07Clues.length || evidence.size >= 2) tier = 1;
  if (dominant >= 2 && (Boolean(progress.signalResult) || progress.n07Clues.length >= 2)) tier = 2;
  if (dominant >= 4 && connected >= 1) tier = 3;
  if (dominant >= 5 && explored >= 4 && (c.event13Resolved || c.voidBoundaryExposed || c.memoryRestorationCommitted)) tier = 4;
  if (rare && explored >= 7) tier = 5;
  const eligibleEndings: ConsequenceEnding[] = ["protocol"];
  if (c.memoryRestorationCommitted || knowledge.has("subject-07-identified") || strengths.adaptive >= 4) eligibleEndings.push("subject-07");
  if (tier >= 4) eligibleEndings.push("n07-vector");
  if (tier === 5) eligibleEndings.push("archive-anomaly");
  const keyEvidence = [strengths.temporal >= 2 ? "EVENT 13 / PRE-RESPONSE" : null, strengths.spatial >= 2 ? "VOID / MISSING INTERVAL" : null, strengths.mnemonic >= 2 ? "MEMORY / FOREIGN RECALL" : null, strengths.adaptive >= 2 ? "NEURAL / ANTICIPATED ROUTE" : null].filter((item): item is string => Boolean(item));
  const unresolvedEvidence = [c.event13Resolved ? null : "EVENT 13 TIMING", c.voidBoundaryExposed ? null : "VOID BOUNDARY", c.memoryRestorationCommitted ? null : "MEMORY WRITEBACK", connected >= 1 ? null : "CROSS-SECTOR CORRELATION"].filter((item): item is string => Boolean(item));
  return { tier, vector, strengths, eligibleEndings, keyEvidence, unresolvedEvidence, alignmentReady: tier >= 3, thresholdReady: tier >= 4, returningVariant: returningVisitor && Boolean(c.endingCommit), facilityState: tier === 5 ? "TOPOLOGY UNSTABLE" : tier >= 4 ? "THRESHOLD COHERENT" : tier >= 3 ? "ALIGNMENT PARTIAL" : "ACCESS UNRESOLVED" };
}
