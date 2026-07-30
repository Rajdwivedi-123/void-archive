export const liquidMirrorVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;
  uniform float uActivation;
  uniform float uInspection;
  uniform float uSurfaceMotion;
  uniform vec2 uPointer;

  varying vec2 vUv;
  varying float vViscousFold;
  varying float vEdgeDrift;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    vec2 centered = uv * 2.0 - 1.0;

    float slowFold = sin(centered.y * 2.7 - uTime * 0.24)
      + sin(centered.y * 5.1 + centered.x * 1.4 + uTime * 0.13) * 0.42;
    float crossFold = sin(centered.x * 4.4 - centered.y * 1.25 - uTime * 0.17) * 0.38;
    float viscousFold = (slowFold + crossFold) * uSurfaceMotion;
    float edgeWeight = smoothstep(0.32, 0.98, abs(centered.x));
    float edgeDrift = sin(centered.y * 4.8 + uTime * 0.19) * edgeWeight;

    transformed.z += viscousFold * (0.065 + uInspection * 0.045) * uActivation;
    transformed.x += edgeDrift * 0.055 * uActivation;
    transformed.x += uPointer.x * 0.055 * (1.0 - abs(centered.y) * 0.35);
    transformed.y += uPointer.y * 0.025;
    transformed.y *= 0.88 + uReveal * 0.12;

    vec4 viewPosition = modelViewMatrix * vec4(transformed, 1.0);
    vViewPosition = viewPosition.xyz;
    vViscousFold = viscousFold;
    vEdgeDrift = edgeDrift;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

export const liquidMirrorFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;
  uniform float uActivation;
  uniform float uReflection;
  uniform float uInstability;
  uniform float uInspection;
  uniform float uEcho;
  uniform float uLayers;
  uniform vec2 uPointer;
  uniform vec2 uReflectionOffset;

  varying vec2 vUv;
  varying float vViscousFold;
  varying float vEdgeDrift;
  varying vec3 vViewPosition;

  float band(float value, float center, float width) {
    return 1.0 - smoothstep(width, width + 0.012, abs(value - center));
  }

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float silhouetteShift = sin(p.y * 2.15 + 0.7) * 0.055 - p.y * 0.035;
    float halfWidth = 0.61 + sin(p.y * 3.4 - 0.25) * 0.065 + sin(p.y * 7.1) * 0.018;
    float unstableEdge = sin(p.y * 13.0 - uTime * 0.21) * 0.014 * uInstability;
    float sideMask = smoothstep(0.015, 0.055, halfWidth + unstableEdge - abs(p.x - silhouetteShift));
    float capShape = abs(p.y) + pow(abs(p.x - silhouetteShift), 2.4) * 0.12;
    float capMask = 1.0 - smoothstep(0.92, 1.0, capShape);
    float alphaMask = sideMask * capMask;
    if (alphaMask < 0.02) discard;

    vec2 reflectedUv = vec2(1.0 - vUv.x, vUv.y);
    reflectedUv += uReflectionOffset * vec2(0.075, 0.04);
    reflectedUv.x += vViscousFold * 0.018 + vEdgeDrift * 0.012;
    reflectedUv.y += sin(reflectedUv.x * 8.0 + uTime * 0.09) * 0.01 * uActivation;

    float architecture = band(reflectedUv.x, 0.18, 0.018)
      + band(reflectedUv.x, 0.76, 0.012)
      + band(reflectedUv.x, 0.47 + sin(reflectedUv.y * 3.0) * 0.025, 0.008);
    float secondary = band(reflectedUv.x, 0.34 + uReflectionOffset.x * 0.09, 0.007) * step(1.5, uLayers);
    float tertiary = band(reflectedUv.x, 0.62 - uReflectionOffset.x * 0.12, 0.005) * step(2.5, uLayers);
    float floorReturn = smoothstep(0.17, 0.0, abs(reflectedUv.y - 0.18 - vViscousFold * 0.012));

    float sweepPosition = mix(-0.25, 1.18, clamp(uActivation * 1.18, 0.0, 1.0));
    float revealSweep = band(reflectedUv.x + reflectedUv.y * 0.08, sweepPosition, 0.038);

    float impossibleSeamPosition = 0.53 + sin(uTime * 0.16) * 0.055 + uEcho * 0.09;
    float impossibleSeam = band(reflectedUv.x, impossibleSeamPosition, 0.008 + uEcho * 0.012);
    impossibleSeam *= smoothstep(0.34, 0.7, uReflection) * (0.48 + uInspection * 0.52);

    vec3 voidMetal = vec3(0.004, 0.007, 0.008);
    vec3 graphite = vec3(0.065, 0.074, 0.077);
    vec3 silver = vec3(0.58, 0.65, 0.67);
    float broadResponse = 0.18 + pow(max(0.0, 1.0 - abs(p.x + vViscousFold * 0.06)), 3.2) * 0.28;
    float liquidSheen = (sin(p.x * 3.8 + p.y * 1.15 + vViscousFold * 0.9) * 0.5 + 0.5) * 0.11;
    liquidSheen += pow(max(0.0, 1.0 - abs(p.x * 0.72 + p.y * 0.18)), 7.0) * 0.13;
    float reflectedLight = architecture * 0.36 + secondary * 0.2 + tertiary * 0.14 + floorReturn * 0.08;
    reflectedLight *= uReflection;
    reflectedLight += revealSweep * 0.58 * uActivation;
    reflectedLight += impossibleSeam * (0.3 + uInspection * 0.22);

    vec3 color = mix(voidMetal, graphite, broadResponse + abs(vViscousFold) * 0.055);
    color += vec3(0.045, 0.052, 0.054) * liquidSheen * uReveal;
    color = mix(color, silver, clamp(reflectedLight + liquidSheen * uReflection, 0.0, 0.78));
    color += vec3(0.12, 0.14, 0.15) * smoothstep(0.0, 0.05, 0.055 - min(halfWidth - abs(p.x - silhouetteShift), 1.0 - capShape)) * uInstability;

    float opacity = alphaMask * mix(0.42, 0.98, uReveal);
    gl_FragColor = vec4(color, opacity);
  }
`;
