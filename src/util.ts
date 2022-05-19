import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GateDepth, GateID, GateType } from "@/boardTypes";

import LayerModel from "@/assets/models/layer.glb";

import SliderFullModel from "@/assets/models/slider_full.glb";
import SliderFarModel from "@/assets/models/slider_far.glb";
import SliderMidModel from "@/assets/models/slider_mid.glb";
import SliderNearModel from "@/assets/models/slider_near.glb";

import { BufferGeometry, Mesh, MeshStandardMaterial, Object3D } from "three";

export type SliderObject = Mesh<BufferGeometry, MeshStandardMaterial>;
export type SliderLibrary = Record<GateType, SliderObject>;

export async function loadSliderLibrary() {
  const loader = new GLTFLoader();

  const loadSlider = async (path: string) =>
    (await asyncLoadGTLF(loader, path)).scene.children[0] as SliderObject;

  const slidersPromise = await Promise.all([
    loadSlider(SliderFullModel),
    loadSlider(SliderNearModel),
    loadSlider(SliderMidModel),
    loadSlider(SliderFarModel),
  ]);
  slidersPromise.forEach((v) => v.position.set(0, 0, 0));
  const sliderLibrary: SliderLibrary = {
    [GateType.None]: slidersPromise[0],
    [GateType.Near]: slidersPromise[1],
    [GateType.Mid]: slidersPromise[2],
    [GateType.Furthest]: slidersPromise[3],
  };
  return sliderLibrary;
}

export async function loadLayer() {
  const loader = new GLTFLoader();

  return (await asyncLoadGTLF(loader, LayerModel)).scene.children[0];
}

export async function asyncLoadGTLF(
  loader: GLTFLoader,
  path: string
): Promise<GLTF> {
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => resolve(gltf),
      undefined,
      (e) => reject(e)
    );
  });
}

export function positionSliderInLayer(
  slider: Object3D,
  horizontal: boolean,
  topleft: boolean,
  gate: GateID,
  depth: GateDepth,
  cell_size: number
) {
  slider.rotation.set(0, 0, 0);
  slider.position.set(0, 0, 0);

  if (horizontal) slider.rotateY(Math.PI / 2);
  if (!topleft) slider.rotateY(Math.PI);
  const slot = (gate - 1) * cell_size;
  const depth_pos = -depth * cell_size * (topleft ? 1 : -1);

  if (horizontal) slider.position.set(depth_pos, 0, slot);
  else slider.position.set(slot, 0, depth_pos);
}

export type Tuple<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : _TupleOf<T, N, []>
  : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R["length"] extends N
  ? R
  : _TupleOf<T, N, [T, ...R]>;
