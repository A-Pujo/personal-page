import * as THREE from "three";
import { palette } from "../../content.js";

const skyVertexShader = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragmentShader = `
  varying vec3 vWorldPosition;
  uniform vec3 uTop;
  uniform vec3 uMid;
  uniform vec3 uBottom;

  void main() {
    float h = normalize(vWorldPosition).y;
    vec3 color = mix(uBottom, uMid, smoothstep(-0.1, 0.25, h));
    color = mix(color, uTop, smoothstep(0.2, 0.7, h));
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Langit gradient sunset via mesh sphere besar dengan shader gradient (oranye -> ungu tua).
export function createSky() {
  const geometry = new THREE.SphereGeometry(45, 24, 16);
  const material = new THREE.ShaderMaterial({
    vertexShader: skyVertexShader,
    fragmentShader: skyFragmentShader,
    side: THREE.BackSide,
    uniforms: {
      uTop: { value: new THREE.Color(palette.duskPurple) },
      uMid: { value: new THREE.Color(palette.sunsetOrange) },
      uBottom: { value: new THREE.Color(palette.lakeBlue) },
    },
  });
  return new THREE.Mesh(geometry, material);
}

// Silhouette bukit jauh untuk kedalaman, low-poly flat shading.
export function createHillsSilhouette() {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(palette.duskPurple) });

  const hillPositions = [
    { x: -18, z: -20, r: 8, h: 3 },
    { x: 10, z: -24, r: 10, h: 4 },
    { x: 22, z: -18, r: 7, h: 2.5 },
  ];

  for (const { x, z, r, h } of hillPositions) {
    const geometry = new THREE.ConeGeometry(r, h, 5);
    const hill = new THREE.Mesh(geometry, material);
    hill.position.set(x, h / 2 - 0.5, z);
    group.add(hill);
  }

  return group;
}
