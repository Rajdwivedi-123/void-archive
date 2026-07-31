export const temporalVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;
  uniform float uActivation;
  uniform float uFuture;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vBand;

  void main() {
    vUv = uv;
    float chronology = uTime * 0.42 + uPhase + uv.x * 8.0;
    float offset = sin(chronology) * 0.018 * uActivation;
    offset += sin(chronology * 2.37) * 0.008 * uFuture;
    vec3 displaced = position + normal * offset;
    vec4 world = modelMatrix * vec4(displaced, 1.0);
    vWorldPosition = world.xyz;
    vNormal = normalize(normalMatrix * normal);
    vBand = sin(chronology * 1.8) * 0.5 + 0.5;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const temporalFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;
  uniform float uActivation;
  uniform float uFuture;
  uniform float uHighlight;
  uniform float uOpacity;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vBand;

  void main() {
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float rim = pow(1.0 - abs(dot(normalize(vNormal), viewDirection)), 2.2);
    float sweep = smoothstep(0.66, 0.96, sin(vUv.x * 24.0 - uTime * 1.35 + uPhase * 3.0) * 0.5 + 0.5);
    float fracture = smoothstep(0.76, 0.98, sin(vUv.y * 46.0 + uPhase * 7.0) * 0.5 + 0.5);
    float discreteHistory = floor(fract(vUv.x * 3.0 + uPhase * 0.17) * 4.0) / 3.0;
    float causalGap = smoothstep(0.46, 0.54, abs(fract(vUv.x * 6.0 + uPhase) - 0.5));
    vec3 graphite = vec3(0.045, 0.055, 0.058);
    vec3 silver = vec3(0.48, 0.54, 0.56);
    vec3 coldWhite = vec3(0.78, 0.88, 0.91);
    float materialSeparation = 0.16 + uHighlight * 0.22;
    vec3 color = mix(graphite, silver, materialSeparation + rim * (0.42 + uHighlight * 0.2) + vBand * 0.07 + discreteHistory * 0.08);
    color = mix(color, coldWhite, sweep * (0.12 + uHighlight * 0.24 + uFuture * 0.54));
    float alpha = uOpacity * uActivation * (0.48 + rim * (0.34 + uHighlight * 0.16) + sweep * 0.16);
    alpha *= (0.86 + fracture * 0.08 + causalGap * 0.1);
    gl_FragColor = vec4(color, alpha);
  }
`;
