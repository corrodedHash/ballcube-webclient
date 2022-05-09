import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";

import Layer, { SliderObject } from "./layer";

import {
  Object3D,
  SphereGeometry,
  Vector3,
  Mesh,
  MeshStandardMaterial,
  Raycaster,
} from "three";

import BoardLogic, { BallDepth, GateID, LayerID } from "./gamelogic";

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

interface BallObject {
  ob: Object3D;
  depth: BallDepth;
  silver: boolean;
}

export default class Board extends Object3D {
  public l: Layer[];
  private balls: BallObject[];
  private highlighted_slider: { layer: LayerID; gate: GateID } | undefined;

  private constructor(layers: Layer[], balls: BallObject[]) {
    super();
    if (layers.length !== 4) throw new Error("wrong layer count");
    if (balls.length !== 9) throw new Error("wrong balls count");
    this.l = layers;
    for (const l of layers) {
      this.add(l);
    }
    this.balls = balls;
    for (const b of balls) {
      this.add(b.ob);
    }
  }

  update(logic: BoardLogic) {
    const distance = 10;

    for (let i = 0; i < this.balls.length; i++) {
      const s = this.balls[i];
      s.depth = logic.balls[i].depth;
      s.ob.position.setY(1.25 - s.depth * distance);
      s.ob.visible = s.depth <= 3;
    }

    for (let i = 0; i < 4; i++) {
      const layer = this.l[i];
      const logic_layer = logic.layers[i];
      layer.set_horizontal(logic_layer.horizontal);
      for (const g of [0, 1, 2] as const) {
        layer.set_depth(g, logic_layer.gate[g].depth);
        layer.set_silver(g, logic_layer.gate[g].silver);
        layer.set_topleft(g, logic_layer.gate[g].topleft);
        layer.set_type(g, logic_layer.gate[g].type);
      }
    }
  }

  raySlider(
    raycaster: Raycaster
  ): { layer: LayerID; gate: GateID } | undefined {
    const o = raycaster.intersectObject(this, true)[0];
    if (o === undefined) return undefined;
    for (const l of [0, 1, 2, 3] as LayerID[]) {
      const g = this.l[l].hasSlider(o.object);
      if (g !== undefined) {
        return { layer: l, gate: g };
      }
    }
    return undefined;
  }

  highlight_slider(layer: LayerID, gate: GateID) {
    if (this.highlighted_slider !== undefined) {
      this.l[this.highlighted_slider.layer].unhighlight_slider();
    }
    this.highlighted_slider = { layer, gate };
    this.l[layer].highlight_slider(gate);
  }
  unhighlight_sliders() {
    if (this.highlighted_slider !== undefined) {
      this.l[this.highlighted_slider.layer].unhighlight_slider();
    }
    this.highlighted_slider = undefined;
  }

  static async setup(logic: BoardLogic) {
    const loader = new GLTFLoader();

    const layerGLTFComplete = await asyncLoadGTLF(loader, "/models/layer.glb");

    const sliderLibrary = {
      full: (await asyncLoadGTLF(loader, "/models/slider_full.glb")).scene
        .children[0] as SliderObject,
      near: (await asyncLoadGTLF(loader, "/models/slider_near.glb")).scene
        .children[0] as SliderObject,
      mid: (await asyncLoadGTLF(loader, "/models/slider_mid.glb")).scene
        .children[0] as SliderObject,
      far: (await asyncLoadGTLF(loader, "/models/slider_far.glb")).scene
        .children[0] as SliderObject,
    };
    const layerGLTF = layerGLTFComplete.scene.children[0];
    const layers = [
      new Layer(layerGLTF.clone(), sliderLibrary),
      new Layer(layerGLTF.clone(), sliderLibrary),
      new Layer(layerGLTF.clone(), sliderLibrary),
      new Layer(layerGLTF.clone(), sliderLibrary),
    ];

    layers[0].name = "Layer0";
    layers[1].name = "Layer1";
    layers[2].name = "Layer2";
    layers[3].name = "Layer3";

    const layerOrthogonal = new Vector3(0, -1, 0);
    const distance = 10;
    layers[1].position.addVectors(
      layers[1].position,
      layerOrthogonal.clone().multiplyScalar(distance)
    );

    layers[2].position.addVectors(
      layers[2].position,
      layerOrthogonal.clone().multiplyScalar(distance * 2)
    );

    layers[3].position.addVectors(
      layers[3].position,
      layerOrthogonal.clone().multiplyScalar(distance * 3)
    );

    const balls: BallObject[] = [];
    for (let row = -1; row < 2; row++) {
      for (let column = -1; column < 2; column++) {
        const b = logic.balls[column + 1 + 3 * (row + 1)];
        const s = new Mesh(
          new SphereGeometry(1, 60, 40),
          new MeshStandardMaterial({
            color: b.silver ? 0xdbdbdc : 0xffd700,
            roughness: 0.5,
            metalness: 0.3,
          })
        );
        s.name = `Ball_${column + 1}_${row + 1}`;
        s.position.addVectors(s.position, new Vector3(column * 5, 0, row * 5));
        balls.push({ depth: b.depth, ob: s, silver: b.silver });
      }
    }

    const b = new Board(layers, balls);
    b.update(logic);
    return b;
  }
}
