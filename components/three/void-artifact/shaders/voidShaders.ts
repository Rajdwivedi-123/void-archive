export const voidVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uActivation;
  uniform float uCollapse;
  uniform vec2 uPointer;

  varying vec2 vUv;
  varying float vShear;

  void main() {
    vUv = uv;
    vec3 displaced = position;
    float vertical = position.y * 0.72;
    float shear = sin(vertical * 2.7 + uTime * 0.16) * 0.08;
    shear += sin(vertical * 6.3 - uTime * 0.11) * 0.026;
    shear *= uActivation;
    displaced.x += shear + uPointer.x * (0.06 + abs(position.y) * 0.018) * uActivation;
    displaced.y += uPointer.y * 0.035 * uActivation;
    displaced.x *= 1.0 + uCollapse * 0.11;
    displaced.y *= 1.0 + uCollapse * 0.055;
    vShear = shear;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

export const voidFragmentShader = /* glsl */ `
  uniform float uActivation;
  uniform float uCollapse;
  uniform float uOpacity;

  varying vec2 vUv;
  varying float vShear;

  void main() {
    gl_FragColor = vec4(vec3(0.0), uOpacity);
  }
`;

export const voidParticleVertexShader = /* glsl */ `
  uniform float uSize;
  varying float vFade;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    float depthFade = smoothstep(26.0, 4.0, -viewPosition.z);
    vFade = depthFade;
    gl_PointSize = uSize * (150.0 / max(1.0, -viewPosition.z));
    gl_Position = projectionMatrix * viewPosition;
  }
`;

export const voidParticleFragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying float vFade;

  void main() {
    vec2 point = gl_PointCoord - 0.5;
    float disc = 1.0 - smoothstep(0.14, 0.5, length(point));
    gl_FragColor = vec4(vec3(0.58, 0.62, 0.6), disc * vFade * uOpacity);
  }
`;
