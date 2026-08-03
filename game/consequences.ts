import type { PuzzleId } from "./investigation";
import type { FacilityRoom } from "./gameTypes";
import type { ConsequenceState, N07DiscoveryRoute, SignalResolution } from "./consequenceTypes";

export function createConsequenceState(): ConsequenceState {
  return {
    gravityOverdrive: false, gravityStabilized: false, mirrorImpossibleFeedSelected: null, temporalSequenceChoice: null,
    event13Resolved: false, neuralStrategy: null, neuralPredictionTriggered: false, voidBoundaryExposed: false, voidProbeDepth: 0,
    memoryReconstructionType: null, memoryRestorationCommitted: false, signal7aResolution: null, deadSectorInvestigated: false,
    hiddenPassageUsed: false, n07DiscoveryRoute: null, acceptedCorrelations: [], rejectedCorrelations: [], optionalRoomsVisited: [],
    minimalCompletion: false, observerArchetype: "unresolved", committedEnding: null, endingCommit: null, n07ThresholdResolved: false, returningEcho: null,
  };
}

const rooms: FacilityRoom[] = ["nexus", "record-vault", "signal-room", "dead-sector", "observation-deck", "maintenance-spine"];
const signals: SignalResolution[] = ["temporal", "spatial", "neural"];
const routes: N07DiscoveryRoute[] = ["temporal", "spatial", "memory"];

export function sanitizeConsequences(saved?: Partial<ConsequenceState>): ConsequenceState {
  const base = createConsequenceState();
  const strings = (value: unknown, limit: number) => Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === "string"))].slice(-limit) : [];
  const signal = signals.includes(saved?.signal7aResolution as SignalResolution) ? saved?.signal7aResolution as SignalResolution : null;
  const route = routes.includes(saved?.n07DiscoveryRoute as N07DiscoveryRoute) ? saved?.n07DiscoveryRoute as N07DiscoveryRoute : null;
  return {
    ...base, ...saved,
    mirrorImpossibleFeedSelected: typeof saved?.mirrorImpossibleFeedSelected === "boolean" ? saved.mirrorImpossibleFeedSelected : null,
    neuralStrategy: saved?.neuralStrategy === "intervention" || saved?.neuralStrategy === "observation" ? saved.neuralStrategy : null,
    signal7aResolution: signal,
    n07DiscoveryRoute: route,
    voidProbeDepth: Math.max(0, Math.min(3, Number(saved?.voidProbeDepth) || 0)),
    acceptedCorrelations: strings(saved?.acceptedCorrelations, 16),
    rejectedCorrelations: strings(saved?.rejectedCorrelations, 16),
    optionalRoomsVisited: rooms.filter((room) => saved?.optionalRoomsVisited?.includes(room)).filter((room) => room !== "nexus"),
    committedEnding: (saved?.committedEnding as string) === "minimal" ? "protocol" : saved?.committedEnding === "protocol" || saved?.committedEnding === "subject-07" || saved?.committedEnding === "n07-vector" || saved?.committedEnding === "archive-anomaly" ? saved.committedEnding : null,
    endingCommit: saved?.endingCommit && ["protocol", "subject-07", "n07-vector", "archive-anomaly"].includes(saved.endingCommit.type) ? saved.endingCommit : null,
    n07ThresholdResolved: Boolean(saved?.n07ThresholdResolved),
    returningEcho: saved?.returningEcho === "gravity" || saved?.returningEcho === "mirror" || saved?.returningEcho === "void" || saved?.returningEcho === "memory" ? saved.returningEcho : null,
  };
}

export function signalResolutionFor(result: string): SignalResolution {
  if (result.includes("TEMPORAL")) return "temporal";
  if (result.includes("NEURAL")) return "neural";
  return "spatial";
}

export function commitPuzzleConsequence(state: ConsequenceState, puzzle: PuzzleId, variant: string, solved = true, memoryProfile?: string): ConsequenceState {
  if (puzzle === "gravity") return { ...state, gravityOverdrive: variant === "excursion" || state.gravityOverdrive, gravityStabilized: solved && variant !== "excursion" };
  if (puzzle === "mirror") return { ...state, mirrorImpossibleFeedSelected: solved ? true : state.mirrorImpossibleFeedSelected };
  if (puzzle === "temporal") return { ...state, temporalSequenceChoice: variant, event13Resolved: solved || state.event13Resolved, n07DiscoveryRoute: state.n07DiscoveryRoute ?? "temporal" };
  if (puzzle === "neural") return { ...state, neuralStrategy: variant.includes("intervention") ? "intervention" : "observation" };
  if (puzzle === "void") return { ...state, voidBoundaryExposed: solved || state.voidBoundaryExposed, voidProbeDepth: Math.max(state.voidProbeDepth, solved ? 3 : 1), n07DiscoveryRoute: state.n07DiscoveryRoute ?? "spatial" };
  return { ...state, memoryReconstructionType: memoryProfile ?? variant, memoryRestorationCommitted: solved || state.memoryRestorationCommitted, n07DiscoveryRoute: state.n07DiscoveryRoute ?? "memory" };
}

export function withVisitedRoom(state: ConsequenceState, room: FacilityRoom): ConsequenceState {
  if (room === "nexus" || state.optionalRoomsVisited.includes(room)) return state;
  return { ...state, optionalRoomsVisited: [...state.optionalRoomsVisited, room].slice(-5) };
}
