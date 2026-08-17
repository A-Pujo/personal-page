import * as THREE from "three";

const MISS_HINT_THRESHOLD = 5;

// Deteksi klik/tap pada objek 3D interaktif (joran, peti, dsb).
// Objek WAJIB diklik untuk trigger animasi quest (lihat DEV.md §5.3) — karena itu
// hit area dibuat lebih toleran dari mesh visualnya sendiri, bukan raycast presisi mesh asli.
export class InteractionManager {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.targets = new Map(); // hitProxyMesh -> { onHit, label }
    this.missCount = 0;
    this.onMissHint = null;

    this._handlePointerDown = this._handlePointerDown.bind(this);
    this.domElement.addEventListener("pointerdown", this._handlePointerDown);
  }

  // hitMesh: mesh (bisa lebih besar dari visual asli) yang dipakai murni untuk raycast, boleh invisible.
  register(hitMesh, onHit, label = "") {
    hitMesh.userData.__interactive = true;
    this.targets.set(hitMesh, { onHit, label });
  }

  unregister(hitMesh) {
    this.targets.delete(hitMesh);
  }

  clear() {
    this.targets.clear();
    this.missCount = 0;
  }

  _handlePointerDown(event) {
    if (this.targets.size === 0) return;

    const rect = this.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const meshes = Array.from(this.targets.keys());
    const hits = this.raycaster.intersectObjects(meshes, false);

    if (hits.length > 0) {
      const hitMesh = hits[0].object;
      const entry = this.targets.get(hitMesh);
      this.missCount = 0;
      if (entry && entry.onHit) entry.onHit();
      return;
    }

    this.missCount += 1;
    if (this.missCount >= MISS_HINT_THRESHOLD && this.onMissHint) {
      this.onMissHint();
      this.missCount = 0;
    }
  }

  dispose() {
    this.domElement.removeEventListener("pointerdown", this._handlePointerDown);
    this.targets.clear();
  }
}

// Bikin proxy mesh invisible yang lebih besar dari geometry asli, untuk hit area yang toleran di mobile.
export function createInflatedHitProxy(sourceMesh, inflate = 1.6, minSize = 1.2) {
  const box = new THREE.Box3().setFromObject(sourceMesh);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  const w = Math.max(size.x * inflate, minSize);
  const h = Math.max(size.y * inflate, minSize);
  const d = Math.max(size.z * inflate, minSize);

  const geometry = new THREE.BoxGeometry(w, h, d);
  const material = new THREE.MeshBasicMaterial({ visible: false });
  const proxy = new THREE.Mesh(geometry, material);
  proxy.position.copy(center);
  return proxy;
}
