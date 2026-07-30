import type { MutableRefObject } from "react";

export type ActivationState = {
  outer: number;
  orbitals: number;
  core: number;
  energy: number;
  fragments: number;
  field: number;
  debris: number;
  light: number;
  compression: number;
  sweep: number;
};

export type GravityMotionProps = {
  activation: MutableRefObject<ActivationState>;
  reducedMotion: boolean;
  scrollProgress: MutableRefObject<number>;
};
