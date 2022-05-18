import { LayerID } from "@/gamelogic";
import Loop from "@/loop";
import { SliderLibrary } from "@/util";
import { Camera, Object3D, Raycaster } from "three";
import BuildBoard from "./board";
import { PointerCoordinate } from "./layer";
import SliderConfigurator from "./sliderConfig";

export default class BuildLoop implements Loop {
  private board: BuildBoard;
  private camera: Camera;
  private raycaster: Raycaster;
  private element: HTMLElement;
  private sliderConfig:
    | ({ slider: SliderConfigurator; layer: LayerID } & PointerCoordinate)
    | undefined;

  private listeners: {
    move: (this: HTMLElement, ev: MouseEvent) => any;
    down: (this: HTMLElement, ev: MouseEvent) => any;
  };

  private silverAtPlay: boolean;

  constructor(element: HTMLElement, camera: Camera, board: BuildBoard) {
    this.element = element;
    this.camera = camera;
    this.raycaster = new Raycaster();

    this.board = board;

    this.silverAtPlay = true;

    this.listeners = {
      move: (ev: MouseEvent) => {
        const xRatio = (ev.offsetX / element.clientWidth) * 2 - 1;
        const yRatio = -((ev.offsetY / element.clientHeight) * 2 - 1);
        this.raycaster.setFromCamera({ x: xRatio, y: yRatio }, this.camera);
      },
      down: (ev: MouseEvent) => {
        if (ev.button !== 2) return;
        if (this.sliderConfig === undefined) {
          const pointer = this.board.rayPointer(this.raycaster);
          if (pointer !== undefined) {
            const sc = this.board.select_pointer(pointer, this.silverAtPlay);
            this.sliderConfig = { ...pointer, slider: sc };
          }
        } else {
          const gatetype = this.sliderConfig.slider.rayOption(this.raycaster);
          if (gatetype !== undefined) {
            this.board.set_slider(
              this.sliderConfig.layer,
              this.sliderConfig.gate,
              this.sliderConfig.horizontal,
              this.sliderConfig.topleft,
              this.sliderConfig.slider.gateType
            );
            this.sliderConfig = undefined;
          }
        }
      },
    };
  }

  start() {
    this.element.addEventListener("mousemove", this.listeners["move"]);
    this.element.addEventListener("mousedown", this.listeners["down"]);
  }

  stop() {
    this.element.removeEventListener("mousemove", this.listeners["move"]);
    this.element.removeEventListener("mousedown", this.listeners["down"]);
  }

  tick() {
    if (this.sliderConfig === undefined) {
      const pointer = this.board.rayPointer(this.raycaster);
      if (pointer !== undefined) {
        this.board.highlight_pointer(pointer.layer, pointer);
      } else {
        this.board.unhighlight_pointer();
      }
    } else {
      const gatetype = this.sliderConfig.slider.rayOption(this.raycaster);
      if (gatetype !== undefined) {
        this.sliderConfig.slider.highlight(gatetype);
      } else {
        this.sliderConfig.slider.unhighlight();
      }
    }
  }
}
