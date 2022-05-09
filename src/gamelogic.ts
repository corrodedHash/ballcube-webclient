export type LayerID = 0 | 1 | 2 | 3;
export type GateID = 0 | 1 | 2;
export type GateDepth = 0 | 1 | 2 | 3;

export type BallID = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export enum GateType {
  Furthest,
  Mid,
  Near,
  None,
}
export type BallDepth = 0 | 1 | 2 | 3 | 4;

export interface GateInfo {
  silver: boolean;
  depth: GateDepth;
  type: GateType;
  topleft: boolean;
}

export interface LayerInfo {
  horizontal: boolean;
  gate: [GateInfo, GateInfo, GateInfo];
}
export interface BallInfo {
  depth: BallDepth;
  silver: boolean;
}

export default class BoardLogic {
  layers: [LayerInfo, LayerInfo, LayerInfo, LayerInfo];
  balls: [
    BallInfo,
    BallInfo,
    BallInfo,
    BallInfo,
    BallInfo,
    BallInfo,
    BallInfo,
    BallInfo,
    BallInfo
  ];
  silverAtPlay: boolean;

  constructor(
    layers: [LayerInfo, LayerInfo, LayerInfo, LayerInfo],
    balls: [
      BallInfo,
      BallInfo,
      BallInfo,
      BallInfo,
      BallInfo,
      BallInfo,
      BallInfo,
      BallInfo,
      BallInfo
    ],
    silverAtPlay: boolean
  ) {
    this.layers = layers;
    this.balls = balls;
    this.silverAtPlay = silverAtPlay;
    this.dropBalls();
  }

  private relevantBalls(layer: LayerID, gate: GateID) {
    let balls: BallID[] = [];
    if (this.layers[layer].horizontal) {
      balls = [0, 1, 2].map((v) => (v + 3 * gate) as BallID);
    } else {
      balls = [0, 3, 6].map((v) => (v + gate) as BallID);
    }
    const result = balls.filter((v) => this.balls[v].depth === layer);
    return result;
  }

  private droppableBalls(layer: LayerInfo, gate: GateID) {
    const ball_base = layer.horizontal ? [0, 1, 2] : [0, 3, 6];
    const align_ball_base = ball_base.map(
      (v) => (v + gate * (layer.horizontal ? 3 : 1)) as BallID
    );
    const flipped_ball_base = layer.gate[gate].topleft
      ? align_ball_base
      : align_ball_base.reverse();

    const drop_ball_indices = [
      layer.gate[gate].depth + layer.gate[gate].type,
      ...[...Array(layer.gate[gate].depth).keys()],
    ].map((v) => 2 - v);

    drop_ball_indices.sort((a, b) => a - b);
    const unique_indices = drop_ball_indices.filter(
      (v, i) => drop_ball_indices[i + 1] !== v && v < 3 && v >= 0
    );
    const result = unique_indices.map((v) => flipped_ball_base[v]);
    return result;
  }

  private dropBallsInLayer(layer: LayerID): BallID[] {
    const dropped_balls: BallID[] = [];
    for (const gate_id of [0, 1, 2] as GateID[]) {
      const relevant = this.relevantBalls(layer, gate_id);
      const droppable = this.droppableBalls(this.layers[layer], gate_id);
      const dropping_balls = droppable.filter(
        (v) => relevant.indexOf(v) !== -1
      );
      for (const b of dropping_balls) {
        this.balls[b].depth += 1;
        dropped_balls.push(b);
      }
    }
    return dropped_balls;
  }

  private dropBalls(): Partial<Record<BallID, number>> {
    const changed_balls: Partial<Record<BallID, number>> = {};
    for (const l of [0, 1, 2, 3] as LayerID[]) {
      const dropped = this.dropBallsInLayer(l);
      for (const d of dropped) {
        const old_d = changed_balls[d];
        changed_balls[d] = old_d === undefined ? 1 : 1 + old_d;
      }
    }
    return changed_balls;
  }

  shift(layer: LayerID, gate: GateID): Partial<Record<BallID, number>> {
    this.layers[layer].gate[gate].depth += 1;

    return this.dropBalls();
  }
}
