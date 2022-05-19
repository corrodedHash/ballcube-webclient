import Layer, { PointerCoordinate } from "./layer";

import {
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Raycaster,
  SphereGeometry,
  Vector3,
} from "three";
import BoardLogic from "@/gamelogic";

import { BallID, GateID, GateType, LayerID } from "@/boardTypes";
import { SliderLibrary, Tuple } from "@/util";

interface BallObject {
  ob: Object3D;
  silver: boolean;
  placed: boolean;
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

    const defaultGateCounts = {
      [GateType.Furthest]: 1,
      [GateType.Mid]: 1,
      [GateType.Near]: 2,
      [GateType.None]: 2,
    };

    this.leftoverTypes = {
      silver: { ...defaultGateCounts },
      gold: { ...defaultGateCounts },
    };

    const layers = [...Array(4).keys()].map((v, i) => {
      const l = new Layer(layerGLTF.clone(), sliderLibrary);

      l.name = `Layer_${i}`;
      l.position.setY(distance * i);

      return l;
    }) as Tuple<Layer, 4>;

    const balls = [] as Array<BallObject>;

    for (let row = -1; row < 2; row++) {
      for (let column = -1; column < 2; column++) {
        const s = new Mesh(
          new SphereGeometry(1, 60, 40),
          new MeshStandardMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.5,
            emissive: 0x0000ff,
            emissiveIntensity: 0,
          })
        );
        s.name = `Ball_${column + 1}_${row + 1}`;
        s.position.addVectors(s.position, new Vector3(column * 5, 0, row * 5));
        balls.push({ ob: s, silver: true, placed: false });
      }
    }

    this.l = layers;

    this.add(...layers);

    this.balls = balls as unknown as Tuple<BallObject, 9>;
  }

  rayPhantomBall(raycaster: Raycaster) {
    const o = raycaster.intersectObject(this, true)[0];

    if (o === undefined) return undefined;

    for (const ballID in this.balls) {
      if (this.balls[ballID].ob !== o.object) continue;
      if (this.balls[ballID].placed) return undefined;
      return parseInt(ballID) as BallID;
    }
    return undefined;
  }

  enterBallSelectionMode() {
    this.add(...this.balls.map((v) => v.ob));
    this.l.map((v) => v.hide_pointers());
  }

  highlight_ball(ball: BallID) {
    console.assert(this.balls[ball].placed === false);
    (this.balls[ball].ob as any).material.emissiveIntensity = 1;
  }

  unhighlight_balls() {
    this.balls.forEach((v) => ((v.ob as any).material.emissiveIntensity = 0));
  }

  select_ball(ball: BallID, silver: boolean) {
    this.balls[ball].silver = silver;
    this.balls[ball].placed = true;
    (this.balls[ball].ob as any).material = new MeshStandardMaterial({
      color: silver ? 0xdbdbdc : 0xffd700,
      roughness: 0.5,
      metalness: 0.3,
    });

    return this.balls.filter((v) => v.placed).length === 8;
  }

  rayPointer(
    raycaster: Raycaster
  ): (PointerCoordinate & { layer: LayerID }) | undefined {
    const o = raycaster.intersectObject(this, true)[0];

    if (o === undefined) return undefined;

    for (const l of [0, 1, 2, 3] as Array<LayerID>) {
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
    const gate_types = silver
      ? this.leftoverTypes.silver
      : this.leftoverTypes.gold;

    let allowedGates = Object.entries(gate_types)
      .filter(([k, v]) => v !== 0)
      .map(([k, v]) => parseInt(k) as GateType);

    this.l.map((v) => v.hide_pointers());

    return this.l[pointer.layer].select_pointer(pointer, allowedGates, silver);
  }

  set_slider(
    layer: LayerID,
    horizontal: boolean,
    gate: GateID,
    topleft: boolean,
    gatetype: GateType,
    ownerSilver: boolean
  ) {
    const gate_types = ownerSilver
      ? this.leftoverTypes.silver
      : this.leftoverTypes.gold;

    console.assert(gate_types[gatetype] > 0);
    gate_types[gatetype] -= 1;

    this.l[layer].set_slider(gate, horizontal, topleft, gatetype, ownerSilver);
    this.unhighlight_pointer();
    this.l.map((v) => v.show_pointers());

    return Object.values(this.leftoverTypes).every((v) =>
      Object.values(v).every((v) => v === 0)
    );
  }

  generateLogic(startingPlayerSilver: boolean) {
    return new BoardLogic(
      this.l.map((v) => v.generateLogic()) as any,
      this.balls.map((v) => {
        return { depth: v.placed ? 0 : 4, silver: v.silver };
      }) as any,
      startingPlayerSilver
    );
  }
}
