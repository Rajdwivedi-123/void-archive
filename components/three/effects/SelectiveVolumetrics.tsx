"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import type { GraphicsQuality } from "@/hooks/useGraphicsQuality";

const vertex=/* glsl */`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragment=/* glsl */`uniform float uOpacity;uniform float uTime;varying vec2 vUv;void main(){float radial=1.-smoothstep(.08,.5,abs(vUv.x-.5));float ends=smoothstep(0.,.16,vUv.y)*(1.-smoothstep(.72,1.,vUv.y));float haze=.82+.18*sin(vUv.y*23.-uTime*.12);gl_FragColor=vec4(vec3(.69,.73,.71),radial*ends*haze*uOpacity);}`;
const range=(v:number,a:number,b:number)=>THREE.MathUtils.smoothstep(v,a,b);
export function SelectiveVolumetrics({scrollProgress,quality,reducedMotion}:{scrollProgress:MutableRefObject<number>;quality:GraphicsQuality;reducedMotion:boolean}){
 const refs=useRef<Array<THREE.ShaderMaterial|null>>([]);const t=useRef(0);const uniforms=useMemo(()=>[0,1,2].map(()=>({uOpacity:{value:0},uTime:{value:0}})),[]);
 useFrame((_,d)=>{if(!reducedMotion)t.current+=d;const p=scrollProgress.current;const values=[range(p,.738,.766)*(1-range(p,.81,.824)),range(p,.85,.878)*(1-range(p,.906,.916)),range(p,.925,.948)];refs.current.forEach((m,i)=>{if(!m)return;m.uniforms.uTime.value=t.current;m.uniforms.uOpacity.value=values[i]*(quality==="high"?.12:quality==="balanced"?.075:.035);});});
 const beam=(index:number,position:[number,number,number],scale:[number,number,number],rotation:[number,number,number]=[0,0,0])=><mesh position={position} scale={scale} rotation={rotation} renderOrder={1}><cylinderGeometry args={[.22,.72,1,quality==="high"?18:10,1,true]}/><shaderMaterial ref={m=>{refs.current[index]=m}} uniforms={uniforms[index]} vertexShader={vertex} fragmentShader={fragment} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending}/></mesh>;
 return <group>{beam(0,[-2.5,7.8,-220],[1,9.5,1],[0,0,.08])}{beam(1,[3.7,8.3,-282],[1.15,7.2,1],[0,0,-.12])}{beam(2,[4.2,9.6,-350],[1.25,11,1])}<mesh position={[4.1,1.25,-282]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[1.15,24]}/><meshBasicMaterial color="#000" transparent opacity={.9} depthWrite={false}/></mesh></group>;
}
