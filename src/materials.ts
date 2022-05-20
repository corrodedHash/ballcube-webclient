import { MeshBasicMaterial, MeshStandardMaterial } from "three";

export function ballSelector() {
  return new MeshStandardMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.5,
    emissive: 0x0000ff,
    emissiveIntensity: 0,
  });
}

export function ball(ownerSilver: boolean) {
  return new MeshStandardMaterial({
    color: ownerSilver ? 0xdbdbdc : 0xffd700,
    roughness: 0.5,
    metalness: 0.3,
  });
}

export function pointer(highlighted: boolean) {
  if (!highlighted)
    return new MeshStandardMaterial({
      color: 0xff0000,
    });
  else
    return new MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0x0000af,
    });
}

export function peg(highlighted: boolean) {
  return new MeshStandardMaterial({
    color: 0xff0000,
    opacity: 0.4,
    transparent: true,
    emissive: 0x0000ff,
    emissiveIntensity: highlighted ? 1 : 0,
  });
}

export function slider(silver: boolean, highlighted: boolean) {
  return new MeshStandardMaterial({
    color: silver ? 0xdbdbdc : 0xffd700,
    emissive: highlighted ? 0x800000 : undefined,
    roughness: 0.5,
    metalness: 0.3,
  });
}

export function layer() {
  return new MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
  });
}
