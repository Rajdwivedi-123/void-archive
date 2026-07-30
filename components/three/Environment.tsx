"use client";

import { Environment as DreiEnvironment } from "@react-three/drei";

export function Environment() {
  return <DreiEnvironment preset="night" environmentIntensity={0.28} />;
}
