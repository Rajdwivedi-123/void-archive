export const crystalVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uActivation;
  uniform float uRecall;
  uniform vec2 uPointer;

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying float vFracture;

  void main() {
    vec3 displaced = position;
    float fracture = sin(position.y * 3.7 + position.x * 5.1) * sin(position.z * 6.2 - position.y * 1.9);
    displaced += normal * fracture * (0.012 + uRecall * 0.018) * uActivation;
    displaced.x += uPointer.x * 0.025 * (0.4 + abs(position.y) * 0.14);
    displaced.z += uPointer.y * 0.018;
    vec4 world = modelMatrix * vec4(displaced, 1.0);
    vWorldPosition = world.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vFracture = fracture;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const crystalFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uActivation;
  uniform float uRecall;
  uniform float uOpacity;

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying float vFracture;

  void main() {
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - abs(dot(normalize(vWorldNormal), viewDirection)), 2.6);
    float slowStrata = sin(vWorldPosition.y * 2.1 + vWorldPosition.x * 0.7 - uTime * 0.17) * 0.5 + 0.5;
    float fractureLine = smoothstep(0.91, 0.995, abs(vFracture));
    float recallBand = exp(-abs(fract(vWorldPosition.y * 0.18 - uTime * 0.035) - 0.5) * 11.0) * uRecall;
    vec3 smoke = vec3(0.12, 0.145, 0.15);
    vec3 pearl = vec3(0.76, 0.79, 0.77);
    vec3 memoryTint = vec3(0.57, 0.62, 0.61);
    vec3 color = mix(smoke, pearl, fresnel * 0.76 + fractureLine * 0.22);
    color += memoryTint * slowStrata * 0.035 * uActivation;
    color += pearl * recallBand * 0.12;
    float alpha = uOpacity * (0.035 + fresnel * 0.36 + fractureLine * 0.08 + recallBand * 0.08);
    gl_FragColor = vec4(color, alpha);
  }
`;

export const memoryPlaneVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uActivation;
  uniform float uDepth;
  uniform float uRecall;
  uniform vec2 uPointer;

  varying vec2 vUv;
  varying float vDrift;

  void main() {
    vUv = uv;
    vec3 displaced = position;
    float drift = sin(uv.y * 7.0 + uTime * (0.11 + uDepth * 0.025) + uDepth * 3.4);
    displaced.z += drift * 0.035 * uActivation;
    displaced.x += uPointer.x * (0.015 + uDepth * 0.045) * (uDepth > 0.5 ? -1.0 : 1.0);
    displaced.y += uPointer.y * (0.01 + uDepth * 0.025);
    displaced.xy *= 1.0 + uRecall * uDepth * 0.025;
    vDrift = drift;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

export const memoryPlaneFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uActivation;
  uniform float uRecall;
  uniform float uDepth;
  uniform float uSignature;
  uniform float uOpacity;

  varying vec2 vUv;
  varying float vDrift;

  float line(float value, float center, float width) {
    return 1.0 - smoothstep(width, width + 0.012, abs(value - center));
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float ringTrace(vec2 p, vec2 center, float radius, float width) {
    float angle = atan(p.y - center.y, p.x - center.x);
    float arcMask = smoothstep(-2.5, -1.7, angle) * (1.0 - smoothstep(1.65, 2.45, angle));
    return (1.0 - smoothstep(width, width + 0.014, abs(length(p - center) - radius))) * arcMask;
  }

  void main() {
    vec2 p = vUv;
    float verticals = line(p.x, 0.2 + uDepth * 0.08, 0.009) * step(0.14, p.y);
    verticals += line(p.x, 0.72 - uDepth * 0.12, 0.006) * step(p.y, 0.82);
    float horizontals = line(p.y, 0.28 + uDepth * 0.1, 0.008) * step(0.16, p.x) * step(p.x, 0.8);
    horizontals += line(p.y, 0.7 - uDepth * 0.08, 0.005) * step(0.34, p.x);
    float diagonal = line(p.x + p.y * (0.28 + uDepth * 0.12), 0.82, 0.007);
    float gravityOrbit = ringTrace(p, vec2(0.3, 0.68), 0.16, 0.008);
    float temporalArc = ringTrace(p, vec2(0.7, 0.31), 0.19, 0.009);
    float neuralBranch = line(p.x + p.y * 0.5, 0.62, 0.006) * step(0.24, p.y) * step(p.y, 0.72);
    neuralBranch += line(p.x - p.y * 0.38, 0.22, 0.005) * step(0.3, p.x) * step(p.x, 0.66);
    float voidBoundary = ringTrace(p, vec2(0.47, 0.49), 0.28, 0.006) * step(0.48, p.x + p.y);
    float callbackTrace = (gravityOrbit + temporalArc + neuralBranch + voidBoundary) * uSignature;
    float chamberTrace = clamp(verticals + horizontals + diagonal * (0.35 + uSignature * 0.65) + callbackTrace, 0.0, 1.0);
    float recallSweep = exp(-abs(p.y - fract(uTime * 0.035 + uDepth * 0.31)) * 18.0);
    float dissolve = smoothstep(0.24, 0.8, hash(floor(p * vec2(19.0, 13.0)) + floor(uTime * 0.08)) + uRecall * 0.42);
    float cavity = 1.0 - smoothstep(0.22, 0.54, length((p - vec2(0.5)) * vec2(0.72, 1.0)));
    vec3 graphite = vec3(0.24, 0.28, 0.28);
    vec3 pearl = vec3(0.82, 0.84, 0.8);
    vec3 coolMemory = vec3(0.61, 0.68, 0.69);
    vec3 color = mix(graphite, coolMemory, uDepth * 0.6);
    color = mix(color, pearl, chamberTrace * (0.42 + uSignature * 0.4));
    color += pearl * recallSweep * 0.05;
    float traceAlpha = chamberTrace * dissolve * (0.16 + uSignature * 0.48);
    float atmosphere = cavity * (0.012 + uDepth * 0.018) + recallSweep * 0.018;
    float alpha = uOpacity * uActivation * (traceAlpha + atmosphere + abs(vDrift) * 0.008);
    gl_FragColor = vec4(color, alpha);
  }
`;
