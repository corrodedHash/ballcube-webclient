import { GateType } from "@/gamelogic";
import {
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Raycaster,
} from "three";
import { SliderLibrary, Tuple } from "@/util";

export default class SliderConfigurator extends Object3D {
  private sliderLibrary: SliderLibrary;

  sliderOb: Object3D;
  gateType: GateType;
  optionPegs: Tuple<
    Mesh<CylinderGeometry, MeshStandardMaterial> | undefined,
    4
  >;
  availableTypes: GateType[];

  constructor(availableTypes: GateType[], sliderLibrary: SliderLibrary) {
    super();

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
        new MeshStandardMaterial({
          color: 0xff0000,
          emissive: 0x0000ff,
          opacity: 0.4,
          transparent: true,
          emissiveIntensity: 0,
        })
      );

      peg.position.setY(1);
      peg.position.setZ(5 * (1 - i));

      optionPegs[i] = peg;
      this.add(peg);
    }

    this.optionPegs = optionPegs;

    this.sliderOb = this.sliderLibrary[this.gateType].clone(true);

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
      this.sliderOb = this.sliderLibrary[gatetype].clone();
      this.add(this.sliderOb);
      this.gateType = gatetype;
    }

    const p = this.optionPegs[gatetype];
    if (p !== undefined) p.material.emissiveIntensity = 1;
  }

  unhighlight() {
    this.optionPegs.forEach((v) => {
      if (v !== undefined) v.material.emissiveIntensity = 0;
    });
  }

  update() {
    this.remove(this.sliderOb);

    this.sliderOb = this.sliderLibrary[this.gateType].clone(true);

    this.add(this.sliderOb);
  }
}
