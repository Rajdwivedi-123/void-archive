import type { MutableRefObject } from "react";
import type { ArtifactDefinition } from "./types";

export type ArtifactId = ArtifactDefinition["id"];

export type InspectionControl = {
  active: boolean;
  artifactId: ArtifactId | null;
  primary: number;
  pointerX: number;
  pointerY: number;
  scanner: boolean;
  observerConfidence: number;
  sessionBias: number;
  freezeActive: boolean;
};

export type InspectionControlRef = MutableRefObject<InspectionControl>;
