import * as THREE from "three";
import { palette } from "../../content.js";

// Kunang-kunang: THREE.Points melayang perlahan dengan glow warna emas.
export function createFireflies(count) {
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = Math.random() * 4 + 0.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    speeds[i] = 0.3 + Math.random() * 0.6;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: new THREE.Color(palette.gold),
    size: 0.12,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.userData.basePositions = positions.slice();
  points.userData.speeds = speeds;

  points.userData.update = (elapsed) => {
    const pos = geometry.attributes.position.array;
    const base = points.userData.basePositions;
    for (let i = 0; i < count; i++) {
      const s = speeds[i];
      pos[i * 3] = base[i * 3] + Math.sin(elapsed * s + i) * 0.6;
      pos[i * 3 + 1] = base[i * 3 + 1] + Math.sin(elapsed * s * 0.7 + i * 2) * 0.3;
      pos[i * 3 + 2] = base[i * 3 + 2] + Math.cos(elapsed * s + i) * 0.6;
    }
    geometry.attributes.position.needsUpdate = true;
  };

  return points;
}

// Splash air: burst partikel singkat saat cast/reel, dipicu manual (bukan loop terus-menerus).
export function createSplashBurst(count, origin) {
  const positions = new Float32Array(count * 3);
  const velocities = [];

  for (let i = 0; i < count; i++) {
    positions[i * 3] = origin.x;
    positions[i * 3 + 1] = origin.y;
    positions[i * 3 + 2] = origin.z;
    velocities.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        Math.random() * 1.8 + 0.4,
        (Math.random() - 0.5) * 1.5
      )
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xdff2f5,
    size: 0.08,
    transparent: true,
    opacity: 1,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  let age = 0;
  const lifespan = 0.9;

  points.userData.update = (delta) => {
    age += delta;
    const pos = geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const v = velocities[i];
      pos[i * 3] += v.x * delta;
      pos[i * 3 + 1] += v.y * delta;
      pos[i * 3 + 2] += v.z * delta;
      v.y -= 3.2 * delta; // gravity
    }
    geometry.attributes.position.needsUpdate = true;
    material.opacity = Math.max(0, 1 - age / lifespan);
    points.userData.isDead = age >= lifespan;
  };

  return points;
}
