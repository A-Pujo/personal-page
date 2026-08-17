import * as THREE from "three";
import { palette } from "../../content.js";

// Ikan bercahaya (momen lamaran): badan torpedo + ekor bercabang + sirip punggung/samping + mata,
// supaya siluetnya jelas terbaca sebagai ikan (bukan cuma gumpalan pipih bercahaya).
export function createFish() {
  const group = new THREE.Group();
  const gold = new THREE.Color(palette.gold);

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: gold,
    emissive: gold,
    emissiveIntensity: 0.55,
    roughness: 0.4,
    metalness: 0.15,
  });
  const finMaterial = new THREE.MeshStandardMaterial({
    color: gold.clone().offsetHSL(0, 0, -0.14),
    emissive: gold,
    emissiveIntensity: 0.3,
    roughness: 0.5,
    metalness: 0.1,
  });
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x241a10, roughness: 0.4 });

  // Badan: elipsoid memanjang (kepala di +x, pangkal ekor di -x).
  const bodyGeometry = new THREE.IcosahedronGeometry(0.4, 1);
  bodyGeometry.scale(1.45, 0.62, 0.5);
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  group.add(body);

  // Ekor bercabang (forked tail) — bentuk pipih dari dua segitiga bertemu di pangkal.
  const tailShape = new THREE.Shape();
  tailShape.moveTo(0.06, 0);
  tailShape.lineTo(-0.42, 0.36);
  tailShape.lineTo(-0.3, 0);
  tailShape.lineTo(-0.42, -0.36);
  tailShape.closePath();
  const tailGeometry = new THREE.ExtrudeGeometry(tailShape, { depth: 0.03, bevelEnabled: false });
  tailGeometry.center();
  const tail = new THREE.Mesh(tailGeometry, finMaterial);
  tail.position.x = -0.56;
  group.add(tail);

  // Sirip punggung.
  const dorsal = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.24, 3), finMaterial);
  dorsal.position.set(0, 0.27, 0);
  dorsal.rotation.y = Math.PI / 6;
  group.add(dorsal);

  // Sirip samping kiri & kanan.
  const sideFinGeometry = new THREE.ConeGeometry(0.09, 0.22, 3);
  const finL = new THREE.Mesh(sideFinGeometry, finMaterial);
  finL.position.set(0.08, -0.06, 0.24);
  finL.rotation.set(0, 0, Math.PI / 2.3);
  finL.rotation.y = -0.5;
  group.add(finL);
  const finR = finL.clone();
  finR.position.z = -0.24;
  finR.rotation.y = 0.5;
  group.add(finR);

  // Mata kecil supaya ada "wajah" yang menghadap arah renang.
  const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
  const eyeL = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eyeL.position.set(0.3, 0.08, 0.18);
  group.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.z = -0.18;
  group.add(eyeR);

  const light = new THREE.PointLight(gold, 0, 4);
  light.position.set(0, 0.2, 0);
  group.add(light);
  group.userData.glowLight = light;
  group.userData.body = body;

  group.scale.setScalar(0.001); // mulai tersembunyi, di-scale up saat reveal
  return group;
}
