import * as THREE from "three";
import { palette } from "../../content.js";

const vertexShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float wave = sin(pos.x * 1.2 + uTime * 0.6) * 0.05
               + sin(pos.y * 1.8 + uTime * 0.9) * 0.03;
    pos.z += wave;
    vElevation = wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uColorDeep;
  uniform vec3 uColorShallow;
  varying float vElevation;

  void main() {
    vec3 color = mix(uColorDeep, uColorShallow, smoothstep(-0.05, 0.06, vElevation));
    gl_FragColor = vec4(color, 0.92);
  }
`;

// Air danau: PlaneGeometry + ShaderMaterial dengan vertex displacement sinusoidal sederhana.
export function createLake({ segments = 48, size = 60 } = {}) {
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uColorDeep: { value: new THREE.Color(palette.lakeBlue) },
      uColorShallow: { value: new THREE.Color(palette.gold) },
    },
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0;

  mesh.userData.update = (elapsed) => {
    material.uniforms.uTime.value = elapsed;
  };

  return mesh;
}
