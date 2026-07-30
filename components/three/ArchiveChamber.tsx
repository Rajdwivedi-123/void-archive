"use client";

export function ArchiveChamber() {
  const pillars = [
    { x: -14, z: -14 },
    { x: 14, z: -14 },
    { x: -14, z: 14 },
    { x: 14, z: 14 },
  ];

  const wallRecesses = [
    { x: -8, z: -20 },
    { x: 0, z: -20 },
    { x: 8, z: -20 },
    { x: -8, z: 20 },
    { x: 0, z: 20 },
    { x: 8, z: 20 },
  ];

  return (
    <group>
      <mesh position={[0, -0.08, 0]} receiveShadow={false}>
        <boxGeometry args={[50, 0.25, 50]} />
        <meshStandardMaterial
          color="#060606"
          metalness={0.58}
          roughness={0.38}
        />
      </mesh>

      <mesh position={[0, 11, -24]}>
        <boxGeometry args={[48, 24, 1.4]} />
        <meshStandardMaterial
          color="#101010"
          metalness={0.82}
          roughness={0.24}
        />
      </mesh>
      <mesh position={[0, 11, 24]}>
        <boxGeometry args={[48, 24, 1.4]} />
        <meshStandardMaterial
          color="#101010"
          metalness={0.82}
          roughness={0.24}
        />
      </mesh>
      <mesh position={[-24, 11, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[48, 24, 1.4]} />
        <meshStandardMaterial
          color="#101010"
          metalness={0.82}
          roughness={0.24}
        />
      </mesh>
      <mesh position={[24, 11, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[48, 24, 1.4]} />
        <meshStandardMaterial
          color="#101010"
          metalness={0.82}
          roughness={0.24}
        />
      </mesh>

      {pillars.map((pillar) => (
        <group key={`${pillar.x}-${pillar.z}`}>
          <mesh position={[pillar.x, 7.5, pillar.z]}>
            <boxGeometry args={[2.2, 15, 2.2]} />
            <meshStandardMaterial
              color="#0b0b0b"
              metalness={0.75}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[pillar.x, 14.5, pillar.z]}>
            <boxGeometry args={[3.6, 1.2, 3.6]} />
            <meshStandardMaterial
              color="#171717"
              metalness={0.9}
              roughness={0.15}
            />
          </mesh>
        </group>
      ))}

      {wallRecesses.map((recess) => (
        <mesh
          key={`${recess.x}-${recess.z}`}
          position={[recess.x, 8, recess.z]}
        >
          <boxGeometry args={[5.5, 8, 0.5]} />
          <meshStandardMaterial
            color="#090909"
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>
      ))}

      <mesh position={[0, 16.5, 0]}>
        <boxGeometry args={[34, 1.4, 34]} />
        <meshStandardMaterial
          color="#0f0f0f"
          metalness={0.8}
          roughness={0.18}
        />
      </mesh>

      {Array.from({ length: 10 }).map((_, index) => (
        <mesh key={`beam-${index}`} position={[index * 4.8 - 23.5, 10, -22]}>
          <boxGeometry args={[1.6, 15.2, 0.45]} />
          <meshStandardMaterial
            color="#111111"
            metalness={0.7}
            roughness={0.24}
          />
        </mesh>
      ))}

      {Array.from({ length: 10 }).map((_, index) => (
        <mesh key={`beam-b-${index}`} position={[index * 4.8 - 23.5, 10, 22]}>
          <boxGeometry args={[1.6, 15.2, 0.45]} />
          <meshStandardMaterial
            color="#111111"
            metalness={0.7}
            roughness={0.24}
          />
        </mesh>
      ))}

      {Array.from({ length: 8 }).map((_, index) => (
        <mesh
          key={`beam-c-${index}`}
          position={[-22, 10, index * 6 - 21]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <boxGeometry args={[1.6, 15.2, 0.45]} />
          <meshStandardMaterial
            color="#111111"
            metalness={0.7}
            roughness={0.24}
          />
        </mesh>
      ))}

      {Array.from({ length: 8 }).map((_, index) => (
        <mesh
          key={`beam-d-${index}`}
          position={[22, 10, index * 6 - 21]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <boxGeometry args={[1.6, 15.2, 0.45]} />
          <meshStandardMaterial
            color="#111111"
            metalness={0.7}
            roughness={0.24}
          />
        </mesh>
      ))}
    </group>
  );
}
