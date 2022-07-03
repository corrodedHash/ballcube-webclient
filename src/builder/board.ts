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
import * as material from "@/materials";
import {
  BallID,
  BallInfo,
  GateID,
  GateType,
  LayerID,
  LayerInfo,
} from "@/boardTypes";
import { SliderLibrary, Tuple } from "@/util";
import { ballSelector } from "@/materials";

interface BallObject {
  ob: Mesh<SphereGeometry, MeshStandardMaterial>;
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

  private ballPlacementOrder: Array<BallID>;
  private gatePlacementOrder: Array<{ layer: LayerID; gate: GateID }>;

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

    this.ballPlacementOrder = [];
    this.gatePlacementOrder = [];

    const layers = [...Array(4).keys()].map((v, i) => {
      const l = new Layer(layerGLTF.clone(), sliderLibrary);

      l.name = `Layer_${i}`;
      l.position.setY(distance * i);

      return l;
    }) as Tuple<Layer, 4>;

    const balls = [] as Array<BallObject>;

    for (let row = -1; row < 2; row++) {
      for (let column = -1; column < 2; column++) {
        const s = new Mesh(new SphereGeometry(1, 60, 40), ballSelector());
        s.name = `Ball_${column + 1}_${row + 1}`;
        s.position.addVectors(
          s.position,
          new Vector3(column * 5, 1.25, row * 5)
        );
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
    this.balls[ball].ob.material.emissiveIntensity = 1;
  }

  unhighlight_balls() {
    this.balls.forEach((v) => (v.ob.material.emissiveIntensity = 0));
  }

  select_ball(ball: BallID, silver: boolean) {
    this.balls[ball].silver = silver;
    this.balls[ball].placed = true;
    this.balls[ball].ob.material = material.ball(silver);
    this.ballPlacementOrder.push(ball);

    return this.balls.filter((v) => v.placed).length === 8;
  }

  rayPointer(
    raycaster: Raycaster
  ): (PointerCoordinate & { layer: LayerID }) | undefined {
    const o = raycaster.intersectObject(this, true)[0];

    if (o === undefined) return undefined;

    const found_pointer = Object.entries(this.l)
      .map(
        ([k, l]) => [parseInt(k) as LayerID, l.hasPointer(o.object)] as const
      )
      .filter(([_, p]) => p !== undefined)
      .map(([l, p]) => ({ ...(p as PointerCoordinate), layer: l }));

    return found_pointer[0];
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

    const allowedGates = Object.entries(gate_types)
      .filter(([_k, v]) => v !== 0)
      .map(([k, _v]) => parseInt(k) as GateType);

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

    this.gatePlacementOrder.push({ layer, gate });

    return Object.values(this.leftoverTypes).every((v) =>
      Object.values(v).every((v) => v === 0)
    );
  }

  undo() {
    if (this.ballPlacementOrder.length === 0) {
      if (this.gatePlacementOrder.length === 0) {
        return;
      }
      const last_gate =
        this.gatePlacementOrder[this.gatePlacementOrder.length - 1];
      this.l[last_gate.layer].remove_slider(last_gate.gate);
    } else {
      const last_ball =
        this.ballPlacementOrder[this.ballPlacementOrder.length - 1];
      this.balls[last_ball].placed = false;
      this.balls[last_ball].ob.material = ballSelector();
    }
  }

  generateLogic(startingPlayerSilver: boolean) {
    return new BoardLogic(
      this.l.map((v) => v.generateLogic()) as Tuple<LayerInfo, 4>,
      this.balls.map((v) => {
        return { depth: v.placed ? 0 : 4, silver: v.silver };
      }) as Tuple<BallInfo, 9>,
      startingPlayerSilver
    );
  }
}
