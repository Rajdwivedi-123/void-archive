import type { ArtifactId } from "@/artifacts/inspection";
import type { RealitySnapshot } from "@/reality/realityTypes";

export type AudioBusName = "ambience" | "artifact" | "interaction" | "transition";

export type ArchiveAudioScene = {
  stage: string;
  artifact: ArtifactId | null;
  inspecting: boolean;
  control: number;
  scanner: boolean;
  archiveOpen: boolean;
  freeze: boolean;
  mobile: boolean;
};

export type AudioDiagnostics = {
  contextState: AudioContextState | "uninitialized";
  active: boolean;
  masterGain: number;
  ambienceGain: number;
  artifactGain: number;
  interactionGain: number;
  transitionGain: number;
  ambienceFilterHz: number;
  limiterReductionDb: number;
  connectedToDestination: boolean;
  currentArtifact: ArtifactId | null;
  persistentSources: number;
  transientSources: number;
};

export type ArchiveAudioContextValue = {
  enabled: boolean;
  preferenceRemembered: boolean;
  activate: () => Promise<void>;
  mute: () => void;
  toggle: () => void;
  syncScene: (scene: ArchiveAudioScene) => void;
  cueInteraction: (kind: "archive" | "inspect" | "record" | "scanner" | "subject" | "reset") => void;
  cueControl: (artifact: ArtifactId, value: number) => void;
  diagnostics: () => AudioDiagnostics;
};

export type ObserverAudioProfile = Pick<RealitySnapshot, "archetype" | "affinity" | "observerConfidence" | "returningVisitor" | "n07Route" | "event13Discovered">;
