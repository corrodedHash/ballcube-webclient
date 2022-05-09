<template><div class="modelview" ref="hey"></div></template>

<script lang="ts" setup>
import {
  AmbientLight,
  DirectionalLight,
  MeshStandardMaterial,
  OrthographicCamera,
  Raycaster,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import BoardLogic, { GateType } from "@/gamelogic";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ref, watch } from "vue";
import Board from "@/board";
const hey = ref(null as null | HTMLDivElement);

async function setup_render(element: HTMLDivElement) {
  const renderer = new WebGLRenderer({ antialias: true });
  const s = Math.min(window.innerWidth, window.innerHeight) - 10;
  renderer.setSize(s, s);
  renderer.setPixelRatio(devicePixelRatio);
  element.appendChild(renderer.domElement);

  const camera = new OrthographicCamera(-30, 30, 30, -30, 0, 200);
  camera.position.set(0, 0, 100);
  camera.lookAt(0, 0, 0);

  const scene = new Scene();

  var light = new AmbientLight(0x404040, 0.6);
  scene.add(light);

  var spotlight_left = new DirectionalLight(0xffffff, 0.7);
  spotlight_left.position.set(-80, 0, 80);
  spotlight_left.lookAt(0, 0, 0);
  scene.add(spotlight_left);

  renderer.render(scene, camera);

  const logic = new BoardLogic(
    [
      {
        horizontal: false,
        gate: [
          { depth: 0, silver: true, topleft: true, type: GateType.Furthest },
          { depth: 0, silver: false, topleft: true, type: GateType.Mid },
          { depth: 0, silver: true, topleft: false, type: GateType.Near },
        ],
      },
      {
        horizontal: true,
        gate: [
          { depth: 0, silver: false, topleft: false, type: GateType.None },
          { depth: 0, silver: true, topleft: true, type: GateType.Furthest },
          { depth: 0, silver: false, topleft: false, type: GateType.Mid },
        ],
      },
      {
        horizontal: false,
        gate: [
          { depth: 0, silver: true, topleft: true, type: GateType.Near },
          { depth: 0, silver: true, topleft: false, type: GateType.None },
          { depth: 0, silver: true, topleft: true, type: GateType.Furthest },
        ],
      },
      {
        horizontal: true,
        gate: [
          { depth: 0, silver: false, topleft: false, type: GateType.Mid },
          { depth: 0, silver: false, topleft: false, type: GateType.Near },
          { depth: 0, silver: false, topleft: true, type: GateType.None },
        ],
      },
    ],
    [
      { depth: 0, silver: true },
      { depth: 0, silver: false },
      { depth: 0, silver: true },
      { depth: 0, silver: true },
      { depth: 0, silver: false },
      { depth: 4, silver: true },
      { depth: 0, silver: true },
      { depth: 0, silver: false },
      { depth: 0, silver: false },
    ],
    true
  );

  const board = await Board.setup(logic);
  board.position.addVectors(board.position, new Vector3(0, 12, 0));
  board.rotateX(Math.PI / 8);

  scene.add(board);
  renderer.render(scene, camera);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  camera.position.set(0, 20, 100);
  controls.update();

  const raycaster = new Raycaster();

  renderer.domElement.addEventListener("mousemove", (ev) => {
    const xRatio = (ev.offsetX / s) * 2 - 1;
    const yRatio = -((ev.offsetY / s) * 2 - 1);
    raycaster.setFromCamera({ x: xRatio, y: yRatio }, camera);
  });

  renderer.domElement.addEventListener("mousedown", (ev) => {
    if (ev.button !== 2) return;
    const slider = board.raySlider(raycaster);

    if (slider !== undefined) {
      if (
        logic.layers[slider.layer].gate[slider.gate].silver ===
        logic.silverAtPlay
      ) {
        logic.shift(slider.layer, slider.gate);
        logic.silverAtPlay = !logic.silverAtPlay;
        board.update(logic);
      }
    }
  });

  function animate(time: DOMHighResTimeStamp) {
    requestAnimationFrame(animate);

    controls.update();
    const slider = board.raySlider(raycaster);

    if (slider !== undefined) {
      if (
        logic.layers[slider.layer].gate[slider.gate].silver ===
        logic.silverAtPlay
      ) {
        board.highlight_slider(slider.layer, slider.gate);
      } else {
      }
    } else {
      board.unhighlight_sliders();
    }
    renderer.render(scene, camera);
  }
  animate(0);
}

watch(hey, (v) => {
  if (v === null) return;
  setup_render(v);
});
</script>

<style scoped>
.modelview {
  border: 0.2em solid lightblue;
}
</style>
