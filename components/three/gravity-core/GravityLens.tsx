"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { InspectionControlRef } from "@/artifacts/inspection";

const vertex=/* glsl */`varying vec3 vN;varying vec3 vW;void main(){vN=normalize(normalMatrix*normal);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
const fragment=/* glsl */`uniform float uStrength;uniform float uTime;varying vec3 vN;varying vec3 vW;void main(){vec3 v=normalize(cameraPosition-vW);float f=pow(1.-abs(dot(vN,v)),4.6);float compression=sin((vW.y+vW.x*.3)*18.-uTime*.35)*.5+.5;float band=smoothstep(.9,.99,compression)*uStrength;vec3 c=mix(vec3(.04,.05,.052),vec3(.5,.56,.57),f);gl_FragColor=vec4(c,f*(.012+uStrength*.042)+band*.006);}`;
export function GravityLens({inspection}:{inspection:InspectionControlRef}){const ref=useRef<THREE.ShaderMaterial>(null);const t=useRef(0);const uniforms=useMemo(()=>({uStrength:{value:.2},uTime:{value:0}}),[]);useFrame((_,d)=>{if(!ref.current)return;t.current+=d;const active=inspection.current.active&&inspection.current.artifactId==="001";ref.current.uniforms.uStrength.value=THREE.MathUtils.damp(ref.current.uniforms.uStrength.value,active?inspection.current.primary:.18,3,d);ref.current.uniforms.uTime.value=t.current;});return <mesh scale={2.62} renderOrder={1}><sphereGeometry args={[1,40,28]}/><shaderMaterial ref={ref} uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment} transparent depthWrite={false} side={THREE.BackSide} blending={THREE.NormalBlending}/></mesh>}
