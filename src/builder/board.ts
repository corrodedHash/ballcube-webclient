import Layer, { PointerCoordinate } from "./layer";

import {
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Raycaster,
  SphereGeometry,
  Vector3,
} from "three";

import { BallDepth, GateType, LayerID } from "@/gamelogic";
import { SliderLibrary, Tuple } from "@/util";

interface BallObject {
  depth: BallDepth;
  ob: Object3D;
  silver: boolean;
}

export default class Board extends Object3D {
  private l: Tuple<Layer, 4>;
  private balls: Tuple<BallObject, 9>;
  private leftoverTypes: {
    silver: Record<GateType, number>;
    gold: Record<GateType, number>;
  };
  private highlighted_pointer:
    | (PointerCoordinate & { layer: LayerID })
    | undefined;

  constructor(layerGLTF: Object3D, sliderLibrary: SliderLibrary) {
    super();

    const distance = -10;

    this.leftoverTypes = {
      silver: {
        [GateType.Furthest]: 1,
        [GateType.Mid]: 1,
        [GateType.Near]: 2,
        [GateType.None]: 2,
      },
      gold: {
        [GateType.Furthest]: 1,
        [GateType.Mid]: 1,
        [GateType.Near]: 2,
        [GateType.None]: 2,
      },
    };

    const layers = [...Array(4).keys()].map((v, i) => {
      const l = new Layer(layerGLTF.clone(), sliderLibrary);

      l.name = `Layer_${i}`;
      l.position.setY(distance * i);

      return l;
    }) as Tuple<Layer, 4>;

    const balls = [];

    for (let row = -1; row < 2; row++) {
      for (let column = -1; column < 2; column++) {
        const s = new Mesh(
          new SphereGeometry(1, 60, 40),
          new MeshStandardMaterial({
            color: true ? 0xdbdbdc : 0xffd700,
            roughness: 0.5,
            metalness: 0.3,
          })
        );
        s.name = `Ball_${column + 1}_${row + 1}`;
        s.position.addVectors(s.position, new Vector3(column * 5, 0, row * 5));
        s.visible = false;
        balls.push({ depth: 0, ob: s, silver: true });
      }
    }

    this.l = layers;

    this.add(...layers);
    this.add(...balls.map((v) => v.ob));

    this.balls = balls as unknown as Tuple<BallObject, 9>;
  }

  rayPointer(
    raycaster: Raycaster
  ): (PointerCoordinate & { layer: LayerID }) | undefined {
    const o = raycaster.intersectObject(this, true)[0];

    if (o === undefined) return undefined;

    for (const l of [0, 1, 2, 3] as LayerID[]) {
      const pointer = this.l[l].hasPointer(o.object);
      if (pointer !== undefined) return { ...pointer, layer: l };
    }

    return undefined;
  }

  highlight_pointer(layer: LayerID, pointer: PointerCoordinate) {
    if (this.highlighted_pointer !== undefined) this.unhighlight_pointer();

    this.highlighted_pointer = { layer, ...pointer };
    this.l[layer].highlight_pointer(pointer);
  }

  unhighlight_pointer() {
    for (const l of this.l) l.unhighlight_pointers();
  }

  select_pointer(
    pointer: PointerCoordinate & { layer: LayerID },
    silver: boolean
  ) {
    let gate_types = silver
      ? this.leftoverTypes.silver
      : this.leftoverTypes.gold;
    let allowedGates = Object.entries(gate_types)
      .filter(([k, v]) => v !== 0)
      .map(([k, v]) => parseInt(k) as GateType);
    console.log(allowedGates)
    this.l[pointer.layer].select_pointer(pointer, allowedGates);
  }
}
