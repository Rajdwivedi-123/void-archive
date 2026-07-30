export const fieldVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uStrength;
  uniform float uMotion;
  uniform float uEvent;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vRipple;

  void main() {
    float ripple = sin(position.y * 9.0 - uTime * 0.28)
      * sin(position.x * 5.5 + uTime * 0.17);
    float eventWave = sin(length(position.xy) * 11.0 - uEvent * 5.0);
    vec3 transformed = position + normal * (ripple * 0.009 * uStrength * uMotion + eventWave * 0.018 * uEvent);
    vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vWorldPosition = worldPosition.xyz;
    vRipple = ripple;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const fieldFragmentShader = /* glsl */ `
  uniform float uStrength;
  uniform float uEvent;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vRipple;

  void main() {
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float edge = pow(1.0 - abs(dot(normalize(vNormal), viewDirection)), 6.5);
    float interference = smoothstep(0.76, 0.98, abs(vRipple));
    float alpha = (edge * 0.058 + interference * edge * 0.016 + edge * uEvent * 0.055) * uStrength;
    vec3 color = mix(vec3(0.12, 0.14, 0.15), vec3(0.46, 0.51, 0.53), edge);
    gl_FragColor = vec4(color, alpha);
  }
`;
