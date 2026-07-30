"use client";

type LightingProps = {
  reducedMotion: boolean;
};

export function Lighting({ reducedMotion }: LightingProps) {
  return (
    <>
      <ambientLight color="#080a0b" intensity={0.055} />
      <directionalLight color="#dce0df" intensity={reducedMotion ? 0.42 : 0.34} position={[-7, 10, 5]} />
      <spotLight
        color="#e7e1d9"
        intensity={reducedMotion ? 4.2 : 5.4}
        position={[-4.8, 10.5, 4.2]}
        angle={0.16}
        penumbra={0.86}
        distance={25}
        decay={2.1}
      />
      <spotLight
        color="#aab6ba"
        intensity={3.1}
        position={[7.5, 5.2, 1.5]}
        angle={0.12}
        penumbra={0.9}
        distance={18}
        decay={2.25}
      />
      <pointLight color="#5d696d" intensity={0.42} position={[-6, 3.5, -9]} distance={13} decay={2.3} />
    </>
  );
}
