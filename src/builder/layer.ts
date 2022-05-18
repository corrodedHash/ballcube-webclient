import { BufferGeometry, Mesh, MeshStandardMaterial, Object3D } from "three";
import { GateDepth, GateID, GateType } from "@/gamelogic";
import { triangleMesh } from "./util";
import { positionSliderInLayer, SliderLibrary, Tuple } from "@/util";
import SliderConfigurator from "./sliderConfig";

export type SliderObject = Mesh<BufferGeometry, MeshStandardMaterial>;

interface SliderInfo {
  ob: SliderObject;
  topleft: boolean;
  depth: GateDepth;
  ownedBySilver: boolean;
  gatetype: GateType;
}

export interface PointerCoordinate {
  gate: GateID;
  horizontal: boolean;
  topleft: boolean;
}

export default class Layer extends Object3D {
  private sliderLibrary: SliderLibrary;

  private horizontal: boolean | undefined;

  private definedSliders: Tuple<SliderInfo | undefined, 3>;

  private currentSlider: SliderConfigurator | undefined;

  private pointers: Tuple<Object3D, 12>;

  constructor(layer: Object3D, sliders: SliderLibrary) {
    super();
    this.sliderLibrary = sliders;

    this.definedSliders = [undefined, undefined, undefined];

    const pointers = [] as Array<Object3D>;

    for (let id = -1; id < 2; id++) {
      const coords = {
        column_top: [id * 5, -10, 0] as const,
        column_bot: [id * 5, 10, 1] as const,
        row_left: [-10, id * 5, 0.5] as const,
        row_right: [10, id * 5, 1.5] as const,
      };

      Object.entries(coords).map(([k, [x, z, r]]) => {
        let p = new Mesh(
          triangleMesh(),
          new MeshStandardMaterial({ color: 0xff0000 })
        );

        p.name = `${k}_${id}`;
        p.position.set(x, 0, z);
        p.rotateY(Math.PI * r);

        pointers.push(p);
        this.add(p);
      });
    }

    this.pointers = pointers as typeof this.pointers;

    this.add(layer);
  }

  hasPointer(ob: Object3D): PointerCoordinate | undefined {
    const i = this.pointers.indexOf(ob);
    if (i === -1) return undefined;
    const slot = Math.floor(i / 4);
    const type = i % 4;

    return {
      gate: slot as GateID,
      topleft: type % 2 == 0,
      horizontal: type >= 2,
    };
  }

  show_pointers() {
    this.pointers.map((v, index) => {
      if (this.definedSliders[Math.floor(index / 4)] !== undefined) return;
      if (this.horizontal !== undefined) {
        const index_horizontal = index % 4 >= 2;
        if (index_horizontal == this.horizontal) {
          this.add(v);
        }
      } else this.add(v);
    });
  }
  hide_pointers() {
    this.pointers.map((v) => this.remove(v));
  }

  highlight_pointer(pointer: PointerCoordinate) {
    let pointer_id =
      pointer.gate * 4 +
      (pointer.topleft ? 0 : 1) +
      2 * (pointer.horizontal ? 1 : 0);

    (this.pointers[pointer_id] as any).material.emissive.b = 0.7;
  }

  unhighlight_pointers() {
    this.pointers.forEach((v) => ((v as any).material.emissive.b = 0));
  }

  select_pointer(pointer: PointerCoordinate, availableTypes: GateType[]) {
    if (this.currentSlider !== undefined)
      throw new Error("Trying to create a second slider");
    this.currentSlider = new SliderConfigurator(
      availableTypes,
      this.sliderLibrary
    );
    this.add(this.currentSlider);
    console.assert(
      this.horizontal === undefined || this.horizontal === pointer.horizontal
    );

    this.horizontal = pointer.horizontal;

    positionSliderInLayer(
      this.currentSlider,
      pointer.horizontal,
      pointer.topleft,
      pointer.gate,
      0,
      5
    );

    return this.currentSlider;
  }

  set_slider(
    gate: GateID,
    horizontal: boolean,
    topleft: boolean,
    gatetype: GateType
  ) {
    console.assert(
      this.horizontal === undefined || this.horizontal === horizontal
    );
    console.assert(this.definedSliders[gate] === undefined);

    const s = this.sliderLibrary[gatetype].clone();
    positionSliderInLayer(s, horizontal, topleft, gate, 0, 5);
    if (this.currentSlider !== undefined) this.remove(this.currentSlider);
    this.currentSlider = undefined;

    this.add(s);

    this.definedSliders[gate] = {
      ob: s,
      depth: 0,
      ownedBySilver: true,
      topleft,
      gatetype,
    };
  }
}
