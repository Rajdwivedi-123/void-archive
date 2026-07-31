"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import type { GraphicsQuality } from "@/hooks/useGraphicsQuality";
import type { InspectionControlRef } from "@/artifacts/inspection";
import type { GravityMotionProps } from "./types";

type Props = GravityMotionProps & { tier: DeviceTier; quality: GraphicsQuality; inspection: InspectionControlRef };

const vertexShader = /* glsl */ `
  attribute vec4 aOrbit;
  attribute float aSeed;
  uniform float uTime;
  uniform float uStrength;
  uniform float uCompression;
  uniform float uReduced;
  varying float vEnergy;
  void main(){
    float time = uTime * mix(1.0,.14,uReduced);
    float inertia = sin(time*.23+aSeed*17.0)*.055;
    float theta = aOrbit.x + time*aOrbit.w*(.35+uStrength*1.8) + sin(aOrbit.z*.7+aSeed)*uStrength*.42;
    float collapse = smoothstep(.58,1.0,uCompression);
    float radius = aOrbit.y + inertia;
    radius *= 1.0-uCompression*(.16+.38*collapse*(.5+.5*sin(aSeed*31.0)));
    float warp = uStrength*uStrength;
    vec3 p=vec3(
      cos(theta)*radius,
      sin(theta*.71+aSeed*8.0)*radius*.42+aOrbit.z*.18+sin(theta*1.7+aSeed)*.1*warp,
      sin(theta)*radius*.76
    );
    p.xz += vec2(sin(theta*2.3),cos(theta*1.6))*warp*.08;
    p.y *= 1.0-collapse*.28;
    vec4 mv=modelViewMatrix*vec4(p,1.0);
    gl_Position=projectionMatrix*mv;
    gl_PointSize=(.72+aSeed*.82+collapse*.72)*(125.0/max(1.0,-mv.z));
    vEnergy=clamp(.18+uStrength*.58+collapse*.34,0.0,1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying float vEnergy;
  void main(){
    vec2 p=gl_PointCoord-.5;
    float d=length(p);
    float core=1.0-smoothstep(.08,.48,d);
    float halo=(1.0-smoothstep(.15,.5,d))*.22;
    vec3 graphite=vec3(.38,.43,.44);
    vec3 silver=vec3(.86,.9,.89);
    gl_FragColor=vec4(mix(graphite,silver,vEnergy), (core+halo)*(.1+vEnergy*.34));
  }
`;

export function GravityParticles({ activation, reducedMotion, quality, inspection }: Props) {
  const materialRef=useRef<THREE.ShaderMaterial>(null);
  const timeRef=useRef(0);
  const count=quality==="high"?720:quality==="balanced"?420:128;
  const data=useMemo(()=>{
    const positions=new Float32Array(count*3);
    const orbit=new Float32Array(count*4);
    const seeds=new Float32Array(count);
    for(let i=0;i<count;i+=1){
      const seed=((i*16807)%2147483647)/2147483647;
      const phase=(i/count)*Math.PI*2*8.31;
      const radius=.78+seed*2.35;
      const height=(((i*97)%count)/count-.5)*2.85;
      orbit.set([phase,radius,height,.12+(i%17)*.008],i*4);
      seeds[i]=seed;
    }
    return{positions,orbit,seeds};
  },[count]);
  const uniforms=useMemo(()=>({uTime:{value:0},uStrength:{value:0},uCompression:{value:0},uReduced:{value:reducedMotion?1:0}}),[reducedMotion]);
  useFrame((_,delta)=>{
    if(!materialRef.current)return;
    if(!inspection.current.freezeActive)timeRef.current+=Math.min(delta,.05);
    const inspecting=inspection.current.active&&inspection.current.artifactId==="001";
    materialRef.current.uniforms.uTime.value=timeRef.current;
    materialRef.current.uniforms.uStrength.value=inspecting?Math.max(activation.current.debris,inspection.current.primary):activation.current.debris;
    materialRef.current.uniforms.uCompression.value=inspecting?inspection.current.primary:activation.current.compression;
  });
  return <points frustumCulled={false}><bufferGeometry><bufferAttribute attach="attributes-position" args={[data.positions,3]}/><bufferAttribute attach="attributes-aOrbit" args={[data.orbit,4]}/><bufferAttribute attach="attributes-aSeed" args={[data.seeds,1]}/></bufferGeometry><shaderMaterial ref={materialRef} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} blending={THREE.AdditiveBlending}/></points>;
}
