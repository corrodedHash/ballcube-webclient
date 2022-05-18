import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import Layer from "./layer";

import {
  Object3D,
  SphereGeometry,
  Vector3,
  Mesh,
  MeshStandardMaterial,
  Raycaster,
} from "three";

import BoardLogic, { BallDepth, GateID, GateType, LayerID } from "./gamelogic";
import { asyncLoadGTLF, loadLayer, loadSliderLibrary, Tuple } from "./util";

interface BallObject {
  ob: Object3D;
  depth: BallDepth;
  silver: boolean;
}

export default class Board extends Object3D {
  public l: Tuple<Layer, 4>;
  private balls: Tuple<BallObject, 9>;
  private highlighted_slider: { layer: LayerID; gate: GateID } | undefined;

  private constructor(layers: Tuple<Layer, 4>, balls: Tuple<BallObject, 9>) {
    super();
    if (layers.length !== 4) throw new Error("wrong layer count");
    if (balls.length !== 9) throw new Error("wrong balls count");
    this.l = layers;
    this.balls = balls;

    this.add(...this.l);
    this.add(...this.balls.map((v) => v.ob));
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
    const layerGLTF = await loadLayer();

    const sliderLibrary = await loadSliderLibrary();

    const distance = -10;

    const layers = [...Array(4).keys()].map((v, i) => {
      const l = new Layer(layerGLTF.clone(), sliderLibrary);

      l.name = `Layer_${i}`;
      l.position.setY(distance * i);

      return l;
    }) as Tuple<Layer, 4>;

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

    const b = new Board(layers, balls as Tuple<BallObject, 9>);
    b.update(logic);
    return b;
  }
}
