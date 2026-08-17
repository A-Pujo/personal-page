import * as THREE from "three";

// Joran pancing: CylinderGeometry tipis memanjang + garis tali dari THREE.Line.
// Group di-pivot di pangkal joran supaya animasi cast (rotasi) terlihat natural.
export function createRod() {
  const group = new THREE.Group();

  const rodLength = 2.2;
  const rodMaterial = new THREE.MeshStandardMaterial({ color: 0x3a2a1e, roughness: 0.6 });
  const rodGeometry = new THREE.CylinderGeometry(0.02, 0.05, rodLength, 8);
  const rod = new THREE.Mesh(rodGeometry, rodMaterial);
  rod.position.y = 1.1;
  rod.rotation.z = Math.PI / 10;
  group.add(rod);

  // Tip di-parent ke mesh joran (bukan ke group) di titik ujung silinder-nya sendiri
  // (0, rodLength/2, 0) dalam ruang lokal joran, supaya otomatis ikut saat joran
  // ditekuk/dianimasikan — bukan posisi tetap yang lepas dari joran.
  const tip = new THREE.Object3D();
  tip.position.set(0, rodLength / 2, 0);
  rod.add(tip);

  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xe8e2d0 });
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, -1.4, 0),
  ]);
  const line = new THREE.Line(lineGeometry, lineMaterial);
  tip.add(line);

  group.userData.tip = tip;
  group.userData.line = line;
  group.userData.rod = rod;

  // Update panjang tali pancing (0 = di tangan, 1 = terlempar penuh ke air)
  group.userData.setLineLength = (t, sideOffset = 0) => {
    const positions = new Float32Array([
      0, 0, 0,
      sideOffset * t, -1.4 - t * 3.2, 0,
    ]);
    line.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    line.geometry.attributes.position.needsUpdate = true;
  };

  return group;
}
