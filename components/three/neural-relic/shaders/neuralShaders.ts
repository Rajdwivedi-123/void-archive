export const neuralVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uGrowth;
  uniform float uResponse;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    float tissue = sin(position.y * 4.3 + position.x * 2.1 + uTime * 0.32) * 0.012;
    tissue += sin(position.z * 5.7 - uTime * 0.21) * 0.007 * uResponse;
    vec3 displaced = position + normal * tissue * uGrowth;
    vec4 world = modelMatrix * vec4(displaced, 1.0);
    vWorldPosition = world.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const neuralFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;
  uniform float uSignalSpeed;
  uniform float uSignalOffset;
  uniform float uResponse;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    if (vUv.x > uReveal) discard;
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float rim = pow(1.0 - abs(dot(normalize(vNormal), viewDirection)), 2.4);
    float path = fract(vUv.x - uTime * uSignalSpeed + uSignalOffset);
    float signal = smoothstep(0.12, 0.0, abs(path - 0.5));
    float growthFront = smoothstep(0.12, 0.0, abs(vUv.x - uReveal));
    vec3 graphite = vec3(0.028, 0.034, 0.033);
    vec3 silver = vec3(0.36, 0.4, 0.39);
    vec3 biologicalTint = vec3(0.48, 0.49, 0.43);
    vec3 color = mix(graphite, silver, 0.24 + rim * 0.56);
    color = mix(color, biologicalTint, uResponse * 0.1);
    color += vec3(0.62, 0.66, 0.63) * signal * (0.34 + uResponse * 0.48);
    color += vec3(0.28, 0.31, 0.29) * growthFront;
    float alpha = 0.56 + rim * 0.34 + signal * 0.1;
    gl_FragColor = vec4(color, alpha);
  }
`;
