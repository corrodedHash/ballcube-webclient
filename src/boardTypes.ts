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
