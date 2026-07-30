export const liquidMirrorVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;
  varying vec2 vUv;
  varying float vWarp;
  void main() {
    vUv = uv;
    vec3 transformed = position;
    float warp = sin(position.y * 3.2 - uTime * 0.32) * 0.5 + sin(position.x * 6.0 + uTime * 0.19) * 0.5;
    transformed.z += warp * 0.075 * uReveal;
    transformed.x *= 1.0 + sin(position.y * 2.1 + uTime * 0.12) * 0.035 * uReveal;
    vWarp = warp;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

export const liquidMirrorFragmentShader = /* glsl */ `
  uniform float uReveal;
  varying vec2 vUv;
  varying float vWarp;
  void main() {
    float edge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x)
      * smoothstep(0.0, 0.16, vUv.y) * smoothstep(1.0, 0.84, vUv.y);
    float seam = smoothstep(0.47, 0.5, vUv.x + vWarp * 0.025) - smoothstep(0.5, 0.53, vUv.x + vWarp * 0.025);
    vec3 color = mix(vec3(0.005, 0.007, 0.008), vec3(0.38, 0.43, 0.45), seam * 0.7 + abs(vWarp) * 0.08);
    gl_FragColor = vec4(color, edge * uReveal * 0.82);
  }
`;
