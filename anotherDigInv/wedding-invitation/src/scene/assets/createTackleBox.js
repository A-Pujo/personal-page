import * as THREE from "three";

// Kotak alat pancing (RSVP): mirip peti tapi lebih kecil, warna merah/oranye khas tackle box.
// Detail ditambahkan (kaki, gerendel depan, gagang di tutup) supaya tetap terbaca sebagai
// kotak walau kamera dekat & tutupnya terbuka — bukan cuma balok polos.
export function createTackleBox() {
  const group = new THREE.Group();

  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xc0432c, roughness: 0.7 });
  const trimMaterial = new THREE.MeshStandardMaterial({ color: 0x7a2a1c, roughness: 0.8 });
  const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a3a3a,
    roughness: 0.35,
    metalness: 0.6,
  });

  const bodyWidth = 1.1;
  const bodyHeight = 0.5;
  const bodyDepth = 0.7;

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth),
    bodyMaterial
  );
  body.position.y = bodyHeight / 2 + 0.05;
  group.add(body);

  // Kaki/alas tipis lebih gelap supaya badan tidak terlihat "melayang" polos.
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(bodyWidth * 0.96, 0.1, bodyDepth * 0.96),
    trimMaterial
  );
  base.position.y = 0.05;
  group.add(base);

  const lidHeight = 0.16;
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, bodyHeight + 0.05, -bodyDepth / 2);
  group.add(lidPivot);

  const lid = new THREE.Mesh(
    new THREE.BoxGeometry(bodyWidth, lidHeight, bodyDepth),
    bodyMaterial
  );
  lid.position.set(0, lidHeight / 2, bodyDepth / 2);
  lidPivot.add(lid);

  // Gerendel di tepi depan tutup — nempel ke lid supaya tetap ikut saat tutup terbuka.
  const latch = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.06), metalMaterial);
  latch.position.set(0, -lidHeight / 2 - 0.02, bodyDepth / 2 - 0.02);
  lid.add(latch);

  // Gagang: setengah-lingkaran nempel di permukaan atas tutup, ikut berayun saat dibuka.
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.025, 6, 12, Math.PI),
    metalMaterial
  );
  handle.rotation.z = Math.PI;
  handle.position.set(0, lidHeight / 2, 0);
  lid.add(handle);

  group.userData.lidPivot = lidPivot;

  return group;
}
