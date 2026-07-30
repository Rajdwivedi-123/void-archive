"use client";

import * as THREE from "three";

const floorRings = [1.52, 2.46, 3.62, 5.28];
const wallBays = [-9.4, -4.7, 0, 11.5];
const lightSeams = [-7.12, 2.34, 7.08];

export function ArchiveChamber() {
  return (
    <group>
      <mesh position={[0, -0.16, 0]}>
        <boxGeometry args={[50, 0.34, 50]} />
        <meshPhysicalMaterial color="#030405" metalness={0.82} roughness={0.36} clearcoat={0.12} clearcoatRoughness={0.55} />
      </mesh>
      <mesh position={[0.35, 0.035, 0]}>
        <cylinderGeometry args={[5.4, 5.55, 0.1, 96]} />
        <meshPhysicalMaterial color="#090b0c" metalness={0.88} roughness={0.27} clearcoat={0.2} clearcoatRoughness={0.42} />
      </mesh>
      <mesh position={[0.48, 0.092, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.8, 96]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.52} depthWrite={false} />
      </mesh>

      {floorRings.map((radius, index) => (
        <mesh key={radius} position={[0.48, 0.098 + index * 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius, radius + (index === 1 ? 0.045 : 0.025), 112]} />
          <meshBasicMaterial color={index === 1 ? "#687174" : "#303638"} transparent opacity={index === 1 ? 0.2 : 0.12} />
        </mesh>
      ))}
      {Array.from({ length: 12 }, (_, index) => (
        <group key={index} position={[0.48, 0.102, 0]} rotation={[0, (index / 12) * Math.PI * 2 + 0.14, 0]}>
          <mesh position={[0, 0, 4.3]}>
            <boxGeometry args={[index % 3 === 0 ? 0.034 : 0.018, 0.012, index % 3 === 0 ? 1.9 : 1.2]} />
            <meshBasicMaterial color="#596164" transparent opacity={index % 3 === 0 ? 0.16 : 0.08} />
          </mesh>
        </group>
      ))}

      <mesh position={[-5.45, 9.5, -22]}>
        <boxGeometry args={[21.1, 19, 2.5]} />
        <meshStandardMaterial color="#050607" metalness={0.72} roughness={0.42} />
      </mesh>
      <mesh position={[12.45, 9.5, -22]}>
        <boxGeometry args={[7.1, 19, 2.5]} />
        <meshStandardMaterial color="#050607" metalness={0.72} roughness={0.42} />
      </mesh>
      <mesh position={[6.8, 13.3, -22]}>
        <boxGeometry args={[3.8, 11.4, 2.5]} />
        <meshStandardMaterial color="#07090a" metalness={0.78} roughness={0.34} />
      </mesh>
      <mesh position={[-7.5, 10, -27]}>
        <boxGeometry args={[27, 23, 2]} />
        <meshStandardMaterial color="#010202" metalness={0.42} roughness={0.68} />
      </mesh>
      <mesh position={[15.9, 10, -27]}>
        <boxGeometry args={[10.2, 23, 2]} />
        <meshStandardMaterial color="#010202" metalness={0.42} roughness={0.68} />
      </mesh>
      {wallBays.map((x, index) => (
        <group key={x}>
          <mesh position={[x, 7.4 + (index % 2) * 0.35, -20.58]}>
            <boxGeometry args={[3.65, 10.8, 0.7]} />
            <meshStandardMaterial color="#020304" metalness={0.78} roughness={0.33} />
          </mesh>
          <mesh position={[x - 2.12, 8.2, -19.92]}>
            <boxGeometry args={[0.46, 14.5, 1.35]} />
            <meshPhysicalMaterial color="#111416" metalness={0.92} roughness={0.25} clearcoat={0.15} />
          </mesh>
          <mesh position={[x, 13.15, -20.02]}>
            <boxGeometry args={[4.45, 0.58, 1.2]} />
            <meshStandardMaterial color="#0e1112" metalness={0.88} roughness={0.28} />
          </mesh>
        </group>
      ))}
      {lightSeams.map((x, index) => (
        <mesh key={x} position={[x, 7.6, -19.18]}>
          <boxGeometry args={[0.025, index === 1 ? 5.8 : 3.9, 0.04]} />
          <meshBasicMaterial color={index === 1 ? "#929da0" : "#566064"} transparent opacity={index === 1 ? 0.42 : 0.2} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 15.1, -19.6]}>
        <boxGeometry args={[29, 1.3, 2.2]} />
        <meshStandardMaterial color="#090b0c" metalness={0.86} roughness={0.3} />
      </mesh>

      {[-3.45, 3.95].map((x, index) => (
        <group key={x} position={[x, 2.5, -1.2]} rotation={[0, index === 0 ? -0.13 : 0.13, index === 0 ? -0.035 : 0.035]}>
          <mesh>
            <boxGeometry args={[0.42, 5.1, 0.52]} />
            <meshPhysicalMaterial color="#111416" metalness={0.9} roughness={0.26} clearcoat={0.2} />
          </mesh>
          <mesh position={[index === 0 ? 0.52 : -0.52, 2.15, 0]} rotation={[0, 0, index === 0 ? -0.38 : 0.38]}>
            <boxGeometry args={[1.1, 0.22, 0.42]} />
            <meshStandardMaterial color="#22282a" metalness={0.94} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {[-5.2, 5.45].map((x, index) => (
        <group key={x} position={[x, 5.0, 5.2]} rotation={[0, index === 0 ? -0.18 : 0.18, index === 0 ? -0.1 : 0.1]}>
          <mesh>
            <boxGeometry args={[1.05, 10.5, 1.5]} />
            <meshStandardMaterial color="#020303" metalness={0.78} roughness={0.38} />
          </mesh>
          <mesh position={[index === 0 ? 1.2 : -1.2, 4.6, 0]} rotation={[0, 0, index === 0 ? -0.32 : 0.32]}>
            <boxGeometry args={[2.8, 0.65, 1.2]} />
            <meshStandardMaterial color="#050607" metalness={0.82} roughness={0.34} />
          </mesh>
        </group>
      ))}

      <mesh position={[-1.25, 6.2, -2.6]}>
        <coneGeometry args={[2.25, 12, 32, 1, true]} />
        <meshBasicMaterial color="#aab4b7" transparent opacity={0.007} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[3.6, 7.0, -5.4]} rotation={[0, 0, -0.12]} scale={[0.65, 1, 0.65]}>
        <coneGeometry args={[2.6, 13, 32, 1, true]} />
        <meshBasicMaterial color="#778185" transparent opacity={0.0045} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}
