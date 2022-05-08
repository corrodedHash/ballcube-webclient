import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";

import * as THREE from "three";
import { Vector3 } from "three";

const asyncLoadGTLF = async (
  loader: GLTFLoader,
  path: string
): Promise<GLTF> => {
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => resolve(gltf),
      undefined,
      (e) => reject(e)
    );
  });
};

class Layer extends THREE.Object3D {
  horizontal: boolean;
  sliders: (THREE.Object3D | null)[];
  topleft: boolean[];
  depth: number[];

  constructor(layer: THREE.Object3D, slider: THREE.Object3D) {
    super();
    const bla = [slider, slider.clone(true), slider.clone(true)];
    this.sliders = bla;

    this.add(layer);
    this.add(bla[0]);
    this.add(bla[1]);
    this.add(bla[2]);

    this.horizontal = false;
    this.topleft = [true, true, true];
    this.depth = [0, 0, 0];

    this.place_sliders();
  }
  private place_sliders() {
    const cell_size = 5;

    this.sliders[0]?.rotation.set(0, 0, 0);
    this.sliders[1]?.rotation.set(0, 0, 0);
    this.sliders[2]?.rotation.set(0, 0, 0);

    this.sliders[0]?.position.set(0, 0, 0);
    this.sliders[1]?.position.set(0, 0, 0);
    this.sliders[2]?.position.set(0, 0, 0);

    if (this.horizontal) {
      this.sliders[0]?.rotateY(Math.PI / 2);
      this.sliders[1]?.rotateY(Math.PI / 2);
      this.sliders[2]?.rotateY(Math.PI / 2);
    }

    if (this.topleft[0] !== true) this.sliders[0]?.rotateY(Math.PI);
    if (this.topleft[1] !== true) this.sliders[1]?.rotateY(Math.PI);
    if (this.topleft[2] !== true) this.sliders[2]?.rotateY(Math.PI);

    if (this.horizontal) {
      this.sliders[0]?.position.addVectors(
        this.sliders[0]?.position,
        new Vector3(
          -this.depth[0] * cell_size * (this.topleft[0] ? 1 : -1),
          0,
          -2 * cell_size * (this.topleft[0] ? 1 : -1)
        )
      );
      this.sliders[1]?.position.addVectors(
        this.sliders[1]?.position,
        new Vector3(
          -this.depth[1] * cell_size * (this.topleft[1] ? 1 : -1),
          0,
          -cell_size * (this.topleft[1] ? 1 : -1)
        )
      );
      this.sliders[2]?.position.addVectors(
        this.sliders[2]?.position,
        new Vector3(
          -this.depth[2] * cell_size * (this.topleft[2] ? 1 : -1),
          0,
          0
        )
      );
    } else {
      this.sliders[0]?.position.addVectors(
        this.sliders[0]?.position,
        new Vector3(
          0,
          0,
          -this.depth[0] * cell_size * (this.topleft[0] ? 1 : -1)
        )
      );
      this.sliders[1]?.position.addVectors(
        this.sliders[1]?.position,
        new Vector3(
          cell_size * (this.topleft[1] ? 1 : -1),
          0,
          -this.depth[1] * cell_size * (this.topleft[1] ? 1 : -1)
        )
      );
      this.sliders[2]?.position.addVectors(
        this.sliders[2]?.position,
        new Vector3(
          2 * cell_size * (this.topleft[2] ? 1 : -1),
          0,
          -this.depth[2] * cell_size * (this.topleft[2] ? 1 : -1)
        )
      );
    }
  }

  flip() {
    this.horizontal = !this.horizontal;

    this.place_sliders();
  }

  toggle_topleft(id: number) {
    this.topleft[id] = !this.topleft[id];

    this.place_sliders();
  }

  set_depth(id: number, depth: number) {
    this.depth[id] = depth;

    this.place_sliders();
  }
}

export async function build_board() {
  const loader = new GLTFLoader();
  const board = new THREE.Group();

  const layerGLTF = (await asyncLoadGTLF(loader, "/models/layer.glb")).scene;
  const sliderFull = (await asyncLoadGTLF(loader, "/models/slider_full.glb"))
    .scene;

  const layer1 = new Layer(layerGLTF.clone(), sliderFull.clone());
  const layer2 = new Layer(layerGLTF.clone(), sliderFull.clone());
  const layer3 = new Layer(layerGLTF.clone(), sliderFull.clone());
  const layer4 = new Layer(layerGLTF.clone(), sliderFull.clone());
  layer2.flip();

  layer1.set_depth(0, 1);
  layer1.set_depth(1, 2);
  layer1.toggle_topleft(1);
  layer2.toggle_topleft(1);
  layer2.set_depth(0, 1);
  layer2.set_depth(1, 3);

  board.add(layer1);

  const layerOrthogonal = new THREE.Vector3(0, 1, 0);
  const distance = 10;
  layer2.position.addVectors(
    layer2.position,
    layerOrthogonal.clone().multiplyScalar(distance)
  );
  board.add(layer2);

  layer3.position.addVectors(
    layer3.position,
    layerOrthogonal.clone().multiplyScalar(distance * 2)
  );
  board.add(layer3);

  layer4.position.addVectors(
    layer4.position,
    layerOrthogonal.clone().multiplyScalar(distance * 3)
  );
  board.add(layer4);

  return board;
}
