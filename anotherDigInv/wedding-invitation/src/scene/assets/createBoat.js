import * as THREE from "three";

// Outline kano dilihat dari atas (lancip di haluan & buritan) — x = panjang, y = setengah-lebar.
const HULL_POINTS = [
  [1.7, 0],
  [1.2, 0.35],
  [0.4, 0.5],
  [-0.4, 0.5],
  [-1.2, 0.35],
  [-1.7, 0],
  [-1.2, -0.35],
  [-0.4, -0.5],
  [0.4, -0.5],
  [1.2, -0.35],
];

function scaledPoints(scale) {
  return HULL_POINTS.map(([x, y]) => [x * scale, y * scale]);
}

function shapeFromPoints(points) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
  shape.closePath();
  return shape;
}

function shapeWithHole(outerScale, innerScale) {
  const shape = shapeFromPoints(scaledPoints(outerScale));
  shape.holes.push(shapeFromPoints(scaledPoints(innerScale)));
  return shape;
}

// Perahu kano: dinding lambung berupa cincin (outline luar minus outline dalam) yang
// diekstrusi vertikal, jadi benar-benar berongga di tengah — bukan balok padat.
export function createBoat() {
  const group = new THREE.Group();

  const hullMaterial = new THREE.MeshStandardMaterial({ color: 0x8a5a3b, roughness: 0.85 });
  const interiorMaterial = new THREE.MeshStandardMaterial({ color: 0x40291a, roughness: 0.95 });
  const trimMaterial = new THREE.MeshStandardMaterial({ color: 0xfff8ed, roughness: 0.6 });
  const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x6b4a34, roughness: 0.9 });

  const hullHeight = 0.46;

  const wallGeometry = new THREE.ExtrudeGeometry(shapeWithHole(1, 0.82), {
    depth: hullHeight,
    bevelEnabled: false,
  });
  wallGeometry.center();
  const wall = new THREE.Mesh(wallGeometry, hullMaterial);
  wall.rotation.x = -Math.PI / 2;
  wall.position.y = hullHeight / 2;
  group.add(wall);

  // Alas/lantai bagian dalam perahu, sedikit di atas keel supaya terlihat berongga dari atas.
  const floorGeometry = new THREE.ShapeGeometry(shapeFromPoints(scaledPoints(0.78)));
  const floor = new THREE.Mesh(floorGeometry, interiorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.05;
  group.add(floor);

  // Gunwale: bibir tipis krem yang sedikit dinaikkan dari dinding supaya tidak z-fighting.
  const rimGeometry = new THREE.ExtrudeGeometry(shapeWithHole(1.02, 0.9), {
    depth: 0.05,
    bevelEnabled: false,
  });
  rimGeometry.center();
  const rim = new THREE.Mesh(rimGeometry, trimMaterial);
  rim.rotation.x = -Math.PI / 2;
  rim.position.y = hullHeight + 0.025;
  group.add(rim);

  // Dudukan (thwart) melintang di tengah perahu.
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.78), seatMaterial);
  seat.position.set(0, hullHeight * 0.55, 0);
  group.add(seat);

  return group;
}
