import {
  type BallID,
  type BallInfo,
  type GateID,
  type LayerID,
  type LayerInfo,
} from "@/boardTypes";
import { type Tuple } from "./util";

export default class BoardLogic {
  layers: Tuple<LayerInfo, 4>;
  balls: Tuple<BallInfo, 9>;
  silverAtPlay: boolean;

  private moveList: Array<{
    layer: LayerID;
    gate: GateID;
    balls: Array<{ ball: BallID; dropDepth: number }>;
  }>;

  constructor(
    layers: Tuple<LayerInfo, 4>,
    balls: Tuple<BallInfo, 9>,
    silverAtPlay: boolean
  ) {
    this.layers = layers;
    this.balls = balls;
    this.moveList = [];
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

    const dropped_balls = this.dropBalls();

    this.moveList.push({
      layer,
      gate,
      balls: Object.keys(dropped_balls).map((v) => {
        return {
          ball: parseInt(v) as BallID,
          dropDepth: dropped_balls[parseInt(v) as BallID] as number,
        };
      }),
    });

    return dropped_balls;
  }

  /// Returns true if move list was not empty
  undo(): boolean {
    const last_move = this.moveList.pop();
    if (last_move === undefined) return false;
    this.layers[last_move.layer].gate[last_move.gate].depth -= 1;
    for (const b of last_move.balls) {
      this.balls[b.ball].depth -= b.dropDepth;
    }
    return true;
  }
}
