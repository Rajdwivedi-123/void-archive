"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { GraphicsQuality } from "@/hooks/useGraphicsQuality";
import type { InspectionControlRef } from "@/artifacts/inspection";

const vertex=/* glsl */`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragment=/* glsl */`
precision highp float;varying vec2 vUv;uniform float uTime;uniform float uActivation;uniform float uSteps;uniform vec2 uPointer;
float ellipsoid(vec3 p,vec3 r){return (length(p/r)-1.)*min(min(r.x,r.y),r.z);}
float mapField(vec3 p){
  float t=uTime*.055;
  p.x+=sin(p.y*1.9+t)*.11*uActivation;
  p.y+=sin(p.z*2.3-t*.7)*.07*uActivation;
  float a=ellipsoid(p-vec3(-.18,.08,0.),vec3(.82,1.12,.67));
  float b=ellipsoid(p-vec3(.48,-.33,.06),vec3(.62,.54,.72));
  float c=ellipsoid(p-vec3(-.42,.52,-.18),vec3(.48,.46,.5));
  float cavity=min(a,min(b,c));
  float impossible=ellipsoid(p-vec3(.05,.06,.12),vec3(.28,.76,.31));
  return max(cavity,-impossible*.72);
}
vec3 normalAt(vec3 p){float e=.006;return normalize(vec3(mapField(p+vec3(e,0,0))-mapField(p-vec3(e,0,0)),mapField(p+vec3(0,e,0))-mapField(p-vec3(0,e,0)),mapField(p+vec3(0,0,e))-mapField(p-vec3(0,0,e))));}
void main(){
  vec2 q=(vUv-.5)*vec2(2.05,2.25);q+=uPointer*.025;
  vec3 ro=vec3(q,2.35),rd=normalize(vec3(q*.075,-1.));float travel=0.;float hit=0.;vec3 p=ro;
  for(int i=0;i<38;i++){if(float(i)>=uSteps)break;p=ro+rd*travel;float d=mapField(p);if(abs(d)<.007){hit=1.;break;}travel+=max(.018,abs(d)*.62);if(travel>4.7)break;}
  if(hit<.5)discard;
  vec3 n=normalAt(p);vec3 light=normalize(vec3(-.55,.72,1.));float facing=1.-abs(dot(n,-rd));float rim=pow(facing,5.2);float silver=pow(max(0.,dot(n,light)),22.);float depthBand=sin(travel*18.+p.y*6.)*.5+.5;
  vec3 color=vec3(.0005,.0007,.0008)+vec3(.34,.39,.38)*(rim*.64+silver*.3)+vec3(.025,.03,.028)*depthBand*.025;
  float alpha=.68+rim*.28;gl_FragColor=vec4(color,alpha*uActivation);
}`;

export function VoidSdfVolume({quality,inspection}:{quality:GraphicsQuality;inspection:InspectionControlRef}){
 const ref=useRef<THREE.ShaderMaterial>(null);const time=useRef(0);const uniforms=useMemo(()=>({uTime:{value:0},uActivation:{value:0},uSteps:{value:quality==="high"?36:quality==="balanced"?28:18},uPointer:{value:new THREE.Vector2()}}),[quality]);
 useFrame((_,delta)=>{if(!ref.current)return;if(!inspection.current.freezeActive)time.current+=delta;const active=inspection.current.active&&inspection.current.artifactId==="005";ref.current.uniforms.uTime.value=time.current;ref.current.uniforms.uActivation.value=THREE.MathUtils.damp(ref.current.uniforms.uActivation.value,active?1:.82,3,delta);ref.current.uniforms.uPointer.value.set(inspection.current.pointerX,inspection.current.pointerY);});
 return <mesh position={[0,0,.11]} scale={[5.55,6.25,1]} renderOrder={3}><planeGeometry args={[1,1]}/><shaderMaterial ref={ref} uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment} transparent depthWrite side={THREE.DoubleSide}/></mesh>;
}
