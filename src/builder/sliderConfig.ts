import { GateType } from "@/boardTypes";
import {
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Raycaster,
} from "three";
import { SliderLibrary, SliderObject, Tuple } from "@/util";
import * as material from "@/materials";
export default class SliderConfigurator extends Object3D {
  private sliderLibrary: SliderLibrary;

  sliderOb: SliderObject;
  silver: boolean;
  gateType: GateType;
  optionPegs: Tuple<
    Mesh<CylinderGeometry, MeshStandardMaterial> | undefined,
    4
  >;
  availableTypes: GateType[];

  constructor(
    silver: boolean,
    availableTypes: GateType[],
    sliderLibrary: SliderLibrary
  ) {
    super();
    this.silver = silver;

    this.gateType = availableTypes[0];
    this.availableTypes = availableTypes;
    this.sliderLibrary = sliderLibrary;

    const optionPegs: typeof this.optionPegs = [
      undefined,
      undefined,
      undefined,
      undefined,
    ];

    for (let i = 0; i < optionPegs.length; i++) {
      if (availableTypes.indexOf(i) === -1) continue;

      const peg = new Mesh(
        new CylinderGeometry(1.5, 1.5, 2, 10),
        material.peg(false)
      );

      peg.position.setY(1);
      peg.position.setZ(5 * (1 - i));

      optionPegs[i] = peg;
      this.add(peg);
    }

    this.optionPegs = optionPegs;

    this.sliderOb = this.sliderLibrary[this.gateType].clone(true);
    this.sliderOb.material = material.slider(this.silver, false);

    this.add(this.sliderOb);
  }

  rayOption(raycaster: Raycaster): GateType | undefined {
    const intersections = raycaster.intersectObject(this);
    const first_intersection = intersections[0];
    if (first_intersection === undefined) return undefined;
    for (let i = 0; i < this.optionPegs.length; i++) {
      if (first_intersection.object === this.optionPegs[i]) return i;
    }
    return undefined;
  }

  highlight(gatetype: GateType) {
    this.unhighlight();

    if (this.gateType !== gatetype) {
      this.remove(this.sliderOb);
      this.sliderOb = this.sliderLibrary[gatetype].clone(true);
      this.sliderOb.material = material.slider(this.silver, false);
      this.add(this.sliderOb);
      this.gateType = gatetype;
    }

    const p = this.optionPegs[gatetype];
    if (p !== undefined) p.material = material.peg(true);
  }

  unhighlight() {
    this.optionPegs.forEach((v) => {
      if (v !== undefined) v.material = material.peg(false);
    });
  }
}
