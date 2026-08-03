import type { ConsequenceState, FacilityMutations } from "./consequenceTypes";

export function resolveFacilityMutations(state: ConsequenceState): FacilityMutations {
  const temporalVector = state.n07DiscoveryRoute === "temporal" || state.acceptedCorrelations.includes("S-7A|T-13");
  const spatialVector = state.n07DiscoveryRoute === "spatial" || state.acceptedCorrelations.includes("D-N00|V-NONLOCAL");
  const rareTopology = state.event13Resolved && state.voidBoundaryExposed && state.signal7aResolution === "spatial" && state.memoryRestorationCommitted;
  const deep = Boolean(state.n07DiscoveryRoute) && (state.acceptedCorrelations.length > 0 || rareTopology);
  const subject = state.memoryRestorationCommitted || state.acceptedCorrelations.includes("M-FOREIGN|R-07-FUTURE");
  const ending = state.committedEnding ?? (deep ? "n07-vector" : subject ? "subject-07" : "protocol");
  const responseLabels = [
    state.gravityOverdrive ? "NEXUS FIELD / MISALIGNED" : state.gravityStabilized ? "CONTAINMENT / COHERENT" : null,
    state.voidBoundaryExposed ? "LOCAL GEOMETRY / INCOMPLETE" : null,
    state.neuralStrategy ? `NEURAL RESPONSE / ${state.neuralStrategy.toUpperCase()}` : null,
    state.signal7aResolution ? `SIGNAL 7A / ${state.signal7aResolution.toUpperCase()}` : null,
    state.memoryRestorationCommitted ? "MEMORY WRITEBACK / PRESENT" : null,
    rareTopology ? "ARCHIVE TOPOLOGY / UNSTABLE" : null,
  ].filter((item): item is string => Boolean(item));
  return {
    gravityBent: state.gravityOverdrive,
    containmentAligned: state.gravityStabilized && !state.gravityOverdrive,
    mirrorRouteGhost: state.mirrorImpossibleFeedSelected === true ? "reliable" : state.mirrorImpossibleFeedSelected === false ? "false" : null,
    temporalEarlyResponse: state.event13Resolved || temporalVector,
    neuralPrediction: state.neuralStrategy === "observation" || state.neuralPredictionTriggered,
    voidAbsence: state.voidBoundaryExposed,
    memoryGhost: state.memoryRestorationCommitted || state.returningEcho === "memory",
    recoveredRecord: state.memoryRestorationCommitted,
    signalTopology: state.signal7aResolution,
    routeVariant: state.hiddenPassageUsed ? "maintenance" : temporalVector ? "causal" : spatialVector ? "observation" : null,
    deadSectorState: state.deadSectorInvestigated ? state.voidBoundaryExposed ? "silent" : "active" : "unresolved",
    rareTopology,
    ending,
    activeSectorCount: ending === "protocol" ? "6 / 7" : "7 / 7",
    responseLabels,
  };
}
