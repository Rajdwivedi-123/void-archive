export type NexusLightingState = "normal" | "anomaly" | "post-n07";
export type NexusEventId = "wake" | "signal-echo" | "containment-drift" | "route-shift" | "impossible-corridor";
export type NexusScanPoint = "north" | "east" | "west";
export type NexusRelayPoint = "alpha" | "beta" | "gamma";

export type NexusGameplayProgress = {
  version: 1;
  wakeComplete: boolean;
  scanPoints: NexusScanPoint[];
  triangulated: boolean;
  arrayAlignment: [number, number, number];
  arrayCalibrated: boolean;
  relaySequence: NexusRelayPoint[];
  relayStabilized: boolean;
  topologyCompared: boolean;
  topologyAligned: boolean;
  signalEchoSteps: NexusScanPoint[];
  signalEchoResolved: boolean;
  containmentDriftResolved: boolean;
  ledgeVisited: boolean;
  tutorialComplete: boolean;
  eventsSeen: NexusEventId[];
};

export const arrayTargets: [number, number, number] = [2, 1, 3];
export const relayOrder: NexusRelayPoint[] = ["alpha", "beta", "gamma"];

export function createNexusGameplayProgress(): NexusGameplayProgress {
  return { version: 1, wakeComplete: false, scanPoints: [], triangulated: false, arrayAlignment: [0, 0, 0], arrayCalibrated: false, relaySequence: [], relayStabilized: false, topologyCompared: false, topologyAligned: false, signalEchoSteps: [], signalEchoResolved: false, containmentDriftResolved: false, ledgeVisited: false, tutorialComplete: false, eventsSeen: [] };
}

export function sanitizeNexusGameplay(saved: unknown): NexusGameplayProgress {
  const fallback = createNexusGameplayProgress();
  if (!saved || typeof saved !== "object") return fallback;
  const value = saved as Partial<NexusGameplayProgress>;
  const scanIds: NexusScanPoint[] = ["north", "east", "west"];
  const relayIds: NexusRelayPoint[] = ["alpha", "beta", "gamma"];
  const eventIds: NexusEventId[] = ["wake", "signal-echo", "containment-drift", "route-shift", "impossible-corridor"];
  const alignment = Array.isArray(value.arrayAlignment) && value.arrayAlignment.length === 3 ? value.arrayAlignment.map((step) => Number.isFinite(step) ? Math.max(0, Math.min(3, Number(step))) : 0) as [number, number, number] : fallback.arrayAlignment;
  return { ...fallback, ...value, version: 1, arrayAlignment: alignment, scanPoints: scanIds.filter((id) => value.scanPoints?.includes(id)), relaySequence: relayIds.filter((id) => value.relaySequence?.includes(id)).slice(0, 3), signalEchoSteps: scanIds.filter((id) => value.signalEchoSteps?.includes(id)), eventsSeen: eventIds.filter((id) => value.eventsSeen?.includes(id)) };
}
