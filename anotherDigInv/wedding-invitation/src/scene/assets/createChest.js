import * as THREE from "three";
import { palette } from "../../content.js";

// Peti harta karun: dua BoxGeometry (badan + tutup) dengan pivot di engsel
// agar tutup bisa dianimasikan membuka (rotasi lid.rotation.x lewat GSAP).
export function createChest() {
  const group = new THREE.Group();

  const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x5a3a24, roughness: 0.85 });
  const trimMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(palette.gold),
    metalness: 0.6,
    roughness: 0.4,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 1.0), woodMaterial);
  body.position.y = 0.45;
  group.add(body);

  const trimBand = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.12, 1.04), trimMaterial);
  trimBand.position.y = 0.45;
  group.add(trimBand);

  // Pivot lid di tepi belakang badan (engsel)
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 0.9, -0.5);
  group.add(lidPivot);

  const lid = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 1.0), woodMaterial);
  lid.position.set(0, 0.15, 0.5);
  lidPivot.add(lid);

  const glowLight = new THREE.PointLight(new THREE.Color(palette.gold), 0, 5);
  glowLight.position.set(0, 1.2, 0);
  group.add(glowLight);

  group.userData.lidPivot = lidPivot;
  group.userData.glowLight = glowLight;

  return group;
}
