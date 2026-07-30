export const coreVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uActivation;
  uniform float uScroll;
  uniform float uMotion;
  uniform float uCompression;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vPocket;
  varying float vRidge;

  void main() {
    vec3 transformed = position;
    vec3 sphereDirection = normalize(position);
    float latitude = transformed.y * 5.5;
    float longitude = atan(transformed.z, transformed.x) * 3.8;
    float broadTension = sin(latitude - uTime * 0.19) * sin(longitude + uTime * 0.14);
    float foldedRidge = sin(latitude * 1.72 + longitude * 1.48 - uTime * 0.27);

    vec3 dentDirectionA = normalize(vec3(-0.72, 0.38, 0.58));
    vec3 dentDirectionB = normalize(vec3(0.48 + sin(uTime * 0.11) * 0.08, -0.67, 0.46));
    vec3 dentDirectionC = normalize(vec3(0.62, 0.58, -0.5));
    float dentA = pow(max(dot(sphereDirection, dentDirectionA), 0.0), 10.0);
    float dentB = pow(max(dot(sphereDirection, dentDirectionB), 0.0), 13.0);
    float dentC = pow(max(dot(sphereDirection, dentDirectionC), 0.0), 16.0);
    float collapsePocket = max(dentA, max(dentB * 0.84, dentC * 0.62));
    float pressureRidge = pow(max(0.0, foldedRidge), 5.0);

    float surface = broadTension * 0.48 + foldedRidge * 0.16 + pressureRidge * 0.34 - collapsePocket * 1.42;
    float displacement = (0.04 + uScroll * 0.018) * surface * uActivation * uMotion;
    transformed += normal * displacement;
    transformed += vec3(0.016, -0.006, 0.009) * broadTension * uActivation * uMotion;
    transformed.y += pressureRidge * 0.018 * uActivation * uMotion;
    transformed *= 1.0 - uCompression * (0.12 + collapsePocket * 0.075);
    transformed.x *= 1.0 + sin(uTime * 0.13) * 0.012 * uActivation * uMotion;
    transformed.z *= 1.0 - cos(uTime * 0.1) * 0.009 * uActivation * uMotion;

    vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
    vWorldPosition = worldPosition.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vPocket = collapsePocket;
    vRidge = max(pressureRidge, foldedRidge * 0.5 + 0.5);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const coreFragmentShader = /* glsl */ `
  uniform float uActivation;
  uniform float uScroll;
  uniform float uCompression;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vPocket;
  varying float vRidge;

  void main() {
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    vec3 normal = normalize(vNormal);
    float fresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.45);
    float grazingKey = pow(max(dot(normal, normalize(vec3(-0.58, 0.7, 0.42))), 0.0), 8.0);
    float opposingRim = pow(max(dot(normal, normalize(vec3(0.72, -0.18, 0.5))), 0.0), 11.0);
    float ridge = smoothstep(0.72, 0.88, vRidge);
    float pocket = smoothstep(0.18, 0.78, vPocket);
    vec3 voidBlack = vec3(0.0015, 0.0022, 0.0028);
    vec3 graphite = vec3(0.018, 0.022, 0.024);
    vec3 coldSilver = vec3(0.56, 0.6, 0.61);
    vec3 color = mix(graphite, voidBlack, pocket * 0.93);
    float liquidHighlight = fresnel * 0.58 + grazingKey * 0.76 + opposingRim * 0.22;
    color = mix(color, coldSilver, clamp(liquidHighlight, 0.0, 0.9));
    color += ridge * grazingKey * vec3(0.42, 0.45, 0.46) * uActivation;
    color += pow(fresnel, 8.0) * vec3(0.26, 0.29, 0.3) * (0.72 + uScroll * 0.18);
    color *= 1.0 - uCompression * 0.4;
    gl_FragColor = vec4(color, 1.0);
  }
`;
