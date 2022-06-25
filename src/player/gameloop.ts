import { Camera, Raycaster } from "three";
import Board from "./board";
import BoardLogic from "@/gamelogic";
import Loop from "@/loop";

export default class GameLoop implements Loop {
  private raycaster: Raycaster;
  private camera: Camera;

  private board: Board;
  private logic: BoardLogic;

  private element: HTMLElement;

  private listeners: {
    move: (this: HTMLElement, ev: MouseEvent) => void;
    down: (this: HTMLElement, ev: MouseEvent) => void;
  };

  constructor(
    element: HTMLElement,
    board: Board,
    logic: BoardLogic,
    camera: Camera
  ) {
    this.raycaster = new Raycaster();
    this.camera = camera;
    this.board = board;
    this.logic = logic;
    this.element = element;

    this.listeners = {
      move: (ev: MouseEvent) => {
        const xRatio = (ev.offsetX / element.clientWidth) * 2 - 1;
        const yRatio = -((ev.offsetY / element.clientHeight) * 2 - 1);
        this.raycaster.setFromCamera({ x: xRatio, y: yRatio }, this.camera);
      },
      down: (ev: MouseEvent) => {
        if (ev.button !== 2) return;
        const slider = this.board.raySlider(this.raycaster);

        if (slider !== undefined) {
          const sliderBelongsToCurrentPlayer =
            this.logic.layers[slider.layer].gate[slider.gate].silver ===
            this.logic.silverAtPlay;

          if (sliderBelongsToCurrentPlayer) {
            this.logic.shift(slider.layer, slider.gate);
            this.logic.silverAtPlay = !this.logic.silverAtPlay;
            this.board.update(this.logic);
          }
        }
      },
    };
  }

  tick() {
    const slider = this.board.raySlider(this.raycaster);

    if (slider !== undefined) {
      const sliderBelongsToCurrentPlayer =
        this.logic.layers[slider.layer].gate[slider.gate].silver ===
        this.logic.silverAtPlay;

      if (sliderBelongsToCurrentPlayer) {
        this.board.highlight_slider(slider.layer, slider.gate);
      }
    } else {
      this.board.unhighlight_sliders();
    }
  }

  start() {
    this.element.addEventListener("mousemove", this.listeners["move"]);
    this.element.addEventListener("mousedown", this.listeners["down"]);
  }

  stop() {
    this.element.removeEventListener("mousemove", this.listeners["move"]);
    this.element.removeEventListener("mousedown", this.listeners["down"]);
  }
}
