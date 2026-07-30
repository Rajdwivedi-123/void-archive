import type { DeviceTier } from "@/hooks/useDeviceProfile";

export type ArtifactReading = {
  label: string;
  value: string;
  accent?: boolean;
};

export type ArtifactQualityProfile = {
  membraneSegments: number;
  reflectionLayers: number;
  pointerStrength: number;
};

export type ArtifactDefinition = {
  id: "001" | "002";
  archiveCode: string;
  title: string;
  classification: string;
  status: string;
  origin: string;
  containment: string;
  summary: string;
  readings: ArtifactReading[];
  anomalyLabel: string;
  anomalyDormant: string;
  anomalyActive: string;
  lifecycle: {
    visibleFrom: number;
    entryFrom: number;
    activationFrom: number;
    inspectionFrom: number;
    exitAfter: number;
  };
  camera: {
    entryAt: number;
    inspectionAt: number;
    exitAt: number;
  };
  quality: Record<DeviceTier, ArtifactQualityProfile>;
  reducedMotion: {
    activationScale: number;
    surfaceMotion: number;
    pointerEnabled: boolean;
  };
};

export type ArtifactLifecycleSample = {
  visible: number;
  entry: number;
  activation: number;
  inspection: number;
  exit: number;
};
