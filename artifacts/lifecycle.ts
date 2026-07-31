import type { ArtifactDefinition, ArtifactLifecycleSample } from "./types";

function smootherRange(value: number, start: number, end: number) {
  const normalized = Math.min(Math.max((value - start) / Math.max(end - start, 0.0001), 0), 1);
  return normalized * normalized * normalized * (normalized * (normalized * 6 - 15) + 10);
}

export function sampleArtifactLifecycle(artifact: ArtifactDefinition, progress: number): ArtifactLifecycleSample {
  const { visibleFrom, entryFrom, activationFrom, inspectionFrom, exitAfter } = artifact.lifecycle;
  const exit = exitAfter > 1 ? 0 : smootherRange(progress, exitAfter, Math.min(exitAfter + 0.05, 1));
  return {
    visible: smootherRange(progress, visibleFrom, entryFrom) * (1 - exit),
    entry: smootherRange(progress, entryFrom, activationFrom),
    activation: smootherRange(progress, activationFrom, inspectionFrom),
    inspection: smootherRange(progress, inspectionFrom, Math.min(exitAfter, 1)),
    exit,
  };
}
