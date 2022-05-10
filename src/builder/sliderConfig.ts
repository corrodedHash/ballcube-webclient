import { GateType } from "@/gamelogic";
import { Mesh, MeshStandardMaterial, Object3D } from "three";
import { SliderLibrary } from "@/util";
import { triangleMesh } from "./util";

export default class SliderConfigurator extends Object3D {
  private sliderLibrary: SliderLibrary;

  sliderOb: Object3D;
  fullButton: Object3D;
  gateType: GateType;
  availableTypes: GateType[];

  constructor(availableTypes: GateType[], sliderLibrary: SliderLibrary) {
    super();

    this.gateType = availableTypes[0];
    this.availableTypes = availableTypes;
    this.sliderLibrary = sliderLibrary;
    this.fullButton = new Mesh(
      triangleMesh(),
      new MeshStandardMaterial({ color: 0xff0000 })
    );

    this.sliderOb = this.sliderLibrary[this.gateType].clone(true);
    console.dir(this.sliderOb)

    this.add(this.sliderOb);
  }
  update() {
    this.remove(this.sliderOb);

    this.sliderOb = this.sliderLibrary[this.gateType].clone(true);
    this.add(this.sliderOb);
  }
}
