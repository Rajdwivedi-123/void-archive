"use client";
import { useFrame } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import * as THREE from "three";
const range=(v:number,a:number,b:number)=>THREE.MathUtils.smoothstep(v,a,b);
export function SignatureTransitions({scrollProgress,reducedMotion}:{scrollProgress:MutableRefObject<number>;reducedMotion:boolean}){
 const temporal=useRef<THREE.MeshBasicMaterial>(null);const memory=useRef<THREE.MeshBasicMaterial>(null);useFrame(()=>{const p=scrollProgress.current;const temporalWindow=range(p,.704,.712)*(1-range(p,.728,.738));const memoryWindow=range(p,.907,.915)*(1-range(p,.944,.954));if(temporal.current)temporal.current.opacity=(reducedMotion?temporalWindow*.12:temporalWindow*.28);if(memory.current)memory.current.opacity=(reducedMotion?memoryWindow*.1:memoryWindow*.24);});
 return <group><mesh position={[1.2,3.8,-210]} rotation={[0,.36,0]} scale={[1,1.22,1]}><torusGeometry args={[2.2,.05,6,64,Math.PI*1.58]}/><meshBasicMaterial ref={temporal} color="#aab4b2" transparent opacity={0} toneMapped={false} depthWrite={false}/></mesh><mesh position={[4.2,4.82,-345]} rotation={[0,.08,-.18]}><planeGeometry args={[.035,2.2]}/><meshBasicMaterial ref={memory} color="#e1e3dc" transparent opacity={0} toneMapped={false} depthWrite={false}/></mesh></group>;
}
