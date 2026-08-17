import * as THREE from "three";

const WOOD_COLOR = 0x6b4a34;
const POST_COLOR = 0x4a3323;

// Dermaga: susunan BoxGeometry (papan kayu), warna solid flat untuk kesan low-poly.
export function createDock({ length = 8, width = 2.4 } = {}) {
  const group = new THREE.Group();
  const plankMaterial = new THREE.MeshStandardMaterial({
    color: WOOD_COLOR,
    roughness: 0.9,
    metalness: 0,
  });

  const plankCount = Math.round(length * 2.5);
  const plankLength = width;
  const plankDepth = length / plankCount;

  for (let i = 0; i < plankCount; i++) {
    const geometry = new THREE.BoxGeometry(plankLength, 0.12, plankDepth * 0.86);
    const plank = new THREE.Mesh(geometry, plankMaterial);
    plank.position.set(0, 0.5, -i * plankDepth);
    group.add(plank);
  }

  const postMaterial = new THREE.MeshStandardMaterial({ color: POST_COLOR, roughness: 1 });
  const postPositions = [
    [-width / 2 + 0.15, -0.15],
    [width / 2 - 0.15, -0.15],
  ];
  for (let i = 0; i < plankCount; i += 4) {
    for (const [px] of postPositions) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6), postMaterial);
      post.position.set(px, -0.1, -i * plankDepth);
      group.add(post);
    }
  }

  return group;
}
