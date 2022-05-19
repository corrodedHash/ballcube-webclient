import { MeshBasicMaterial, MeshStandardMaterial, Object3D } from "three";
import { GateDepth, GateID, GateType } from "@/boardTypes";
import {
  positionSliderInLayer,
  SliderLibrary,
  SliderObject,
  Tuple,
} from "@/util";

interface SliderInfo {
  ob: SliderObject;
  topleft: boolean;
  depth: GateDepth;
  ownedBySilver: boolean;
}

export default class Layer extends Object3D {
  private sliderLibrary: SliderLibrary;

  private horizontal: boolean;
  private sliders: Tuple<SliderInfo, 3>;

  constructor(layer: Object3D, sliders: SliderLibrary) {
    super();
    this.sliderLibrary = sliders;
    const bla = [
      sliders[GateType.None].clone(true),
      sliders[GateType.None].clone(true),
      sliders[GateType.None].clone(true),
    ];
    bla[0].name = "Slider0";
    bla[1].name = "Slider1";
    bla[2].name = "Slider2";

    this.sliders = bla.map((v) => {
      return { ob: v as any, topleft: true, depth: 0, ownedBySilver: true };
    }) as [SliderInfo, SliderInfo, SliderInfo];
    (layer as any).material = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
    });
    this.add(layer);
    this.add(...bla);
    this.horizontal = false;

    this.update();
  }

  hasSlider(ob: Object3D): GateID | undefined {
    for (const i of [0, 1, 2] as GateID[]) {
      if (this.sliders[i].ob === ob) return i;
    }
    return undefined;
  }

  highlight_slider(gate: GateID) {
    this.sliders[gate].ob.material.emissive.r = 0.5;
  }

  unhighlight_slider() {
    this.sliders[0].ob.material.emissive.r = 0;
    this.sliders[1].ob.material.emissive.r = 0;
    this.sliders[2].ob.material.emissive.r = 0;
  }

  private update() {
    const cell_size = 5;

    for (const slider_id in this.sliders) {
      const s = this.sliders[slider_id];

      s.ob.visible = s.depth <= 2;
      s.ob.material.color.setHex(s.ownedBySilver ? 0xffffff : 0xffd700);

      positionSliderInLayer(
        s.ob,
        this.horizontal,
        s.topleft,
        parseInt(slider_id) as GateID,
        s.depth,
        cell_size
      );
    }
  }

  set_horizontal(horizontal: boolean) {
    this.horizontal = horizontal;

    this.update();
  }

  set_topleft(id: GateID, topleft: boolean) {
    this.sliders[id].topleft = topleft;

    this.update();
  }

  set_depth(id: GateID, depth: GateDepth) {
    this.sliders[id].depth = depth;

    this.update();
  }

  set_silver(id: GateID, silver: boolean) {
    this.sliders[id].ownedBySilver = silver;

    this.update();
  }

  set_type(id: GateID, type: GateType) {
    this.remove(this.sliders[id].ob);

    this.sliders[id].ob = this.sliderLibrary[type].clone(true);

    this.sliders[id].ob.material = new MeshStandardMaterial({
      color: this.sliders[id].ownedBySilver ? 0xffffff : 0xffd700,
      roughness: 0.5,
      metalness: 0.3,
    });

    this.add(this.sliders[id].ob);
    this.update();
  }
}
