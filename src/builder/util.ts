import { ExtrudeGeometry, Shape } from "three";

export function triangleMesh() {
  const trianglePlane = new Shape();
  trianglePlane.moveTo(0, 0);
  trianglePlane.lineTo(1, -1);
  trianglePlane.lineTo(0, 2);
  trianglePlane.lineTo(-1, -1);
  trianglePlane.lineTo(0, 0);

  const extrudeSettings = {
    steps: 2,
    depth: 0,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.4,
    bevelOffset: 0,
    bevelSegments: 1,
  };

  const geometry = new ExtrudeGeometry(trianglePlane, extrudeSettings);
  geometry.rotateX(Math.PI / 2)
  return geometry
}
