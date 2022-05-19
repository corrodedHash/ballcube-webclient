import BoardLogic from "@/gamelogic";
import { GateType } from "@/boardTypes";

export function generateTestBoardLogic() {
  return new BoardLogic(
    [
      {
        horizontal: false,
        gate: [
          { depth: 0, silver: true, topleft: true, type: GateType.Furthest },
          { depth: 0, silver: false, topleft: true, type: GateType.Mid },
          { depth: 0, silver: true, topleft: false, type: GateType.Near },
        ],
      },
      {
        horizontal: true,
        gate: [
          { depth: 0, silver: false, topleft: false, type: GateType.None },
          { depth: 0, silver: true, topleft: true, type: GateType.Furthest },
          { depth: 0, silver: false, topleft: false, type: GateType.Mid },
        ],
      },
      {
        horizontal: false,
        gate: [
          { depth: 0, silver: true, topleft: true, type: GateType.Near },
          { depth: 0, silver: true, topleft: false, type: GateType.None },
          { depth: 0, silver: true, topleft: true, type: GateType.Furthest },
        ],
      },
      {
        horizontal: true,
        gate: [
          { depth: 0, silver: false, topleft: false, type: GateType.Mid },
          { depth: 0, silver: false, topleft: false, type: GateType.Near },
          { depth: 0, silver: false, topleft: true, type: GateType.None },
        ],
      },
    ],
    [
      { depth: 0, silver: true },
      { depth: 0, silver: false },
      { depth: 0, silver: true },
      { depth: 0, silver: true },
      { depth: 0, silver: false },
      { depth: 4, silver: true },
      { depth: 0, silver: true },
      { depth: 0, silver: false },
      { depth: 0, silver: false },
    ],
    true
  );
}
