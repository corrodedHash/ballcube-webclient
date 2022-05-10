import { BufferGeometry, Mesh, MeshStandardMaterial, Object3D } from "three";
import { GateDepth, GateID, GateType } from "@/gamelogic";
import { triangleMesh } from "./util";
import { SliderLibrary, Tuple } from "@/util";
import SliderConfigurator from "./sliderConfig";

export type SliderObject = Mesh<BufferGeometry, MeshStandardMaterial>;

interface SliderInfo {
  ob: SliderObject;
  topleft: boolean;
  depth: GateDepth;
  ownedBySilver: boolean;
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
    this.currentSlider = new SliderConfigurator(
      availableTypes,
      this.sliderLibrary
    );
    this.add(this.currentSlider);

    if (!pointer.topleft) this.currentSlider.rotateY(Math.PI);
    if (pointer.horizontal) {
      this.currentSlider.rotateY(Math.PI / 2);
      this.currentSlider.position.setZ((pointer.gate - 1) * 5);
    } else {
      this.currentSlider.position.setX((pointer.gate - 1) * 5);
    }
  }
}
