import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";

import * as THREE from "three";
import Layer from "./layer";
import { Object3D } from "three";

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

class Board extends Object3D {
  l: Object3D[];

  private constructor(layers: Object3D[]) {
    super();
    if (layers.length !== 4) throw new Error("wrong layer count");
    this.l = layers;
    for (const l of layers) {
      this.add(l);
    }
  }

  static async setup() {
    const loader = new GLTFLoader();

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

    const layerOrthogonal = new THREE.Vector3(0, 1, 0);
    const distance = 10;
    layer2.position.addVectors(
      layer2.position,
      layerOrthogonal.clone().multiplyScalar(distance)
    );

    layer3.position.addVectors(
      layer3.position,
      layerOrthogonal.clone().multiplyScalar(distance * 2)
    );

    layer4.position.addVectors(
      layer4.position,
      layerOrthogonal.clone().multiplyScalar(distance * 3)
    );

    return new Board([layer1, layer2, layer3, layer4]);
  }
}

export async function build_board() {
  return await Board.setup();
}
