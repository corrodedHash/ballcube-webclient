<template><div class="modelview" ref="hey"></div></template>

<script lang="ts" setup>
import {
  AmbientLight,
  DirectionalLight,
  OrthographicCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ref, watch } from "vue";
import Board from "@/board";
import BuilderBoard from "@/builder/board";
import { generateTestBoardLogic } from "@/test";
import GameLoop from "@/gameloop";
import { loadLayer, loadSliderLibrary } from "@/util";
import BuildLoop from "@/builder/buildloop";
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

  var light = new AmbientLight(0x404040, 1);
  scene.add(light);

  var spotlight_left = new DirectionalLight(0xffffff, 0.7);
  spotlight_left.position.set(-80, 0, 80);
  spotlight_left.lookAt(0, 0, 0);
  scene.add(spotlight_left);

  renderer.render(scene, camera);
  const layerModel = await loadLayer();
  const sliderLibrary = await loadSliderLibrary();
  const buildboard = new BuilderBoard(layerModel, sliderLibrary);
  buildboard.position.addVectors(buildboard.position, new Vector3(0, 12, 0));
  buildboard.rotateX(Math.PI / 8);

  renderer.render(scene, camera);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  camera.position.set(0, 20, 100);
  controls.update();
  const usedLoop = { value: undefined as GameLoop | BuildLoop | undefined };
  const buildLoop = new BuildLoop(
    renderer.domElement,
    camera,
    buildboard,
    (logic) => {
      const gameboard = new Board(logic, layerModel, sliderLibrary);
      gameboard.position.addVectors(gameboard.position, new Vector3(0, 12, 0));
      gameboard.rotateX(Math.PI / 8);
      usedLoop.value?.stop();

      usedLoop.value = new GameLoop(
        renderer.domElement,
        gameboard,
        logic,
        camera
      );
      usedLoop.value.start();
      scene.remove(buildboard);
      scene.add(gameboard);
    }
  );

  usedLoop.value = buildLoop;

  scene.add(buildboard);

  usedLoop.value?.start();

  function animate(time: DOMHighResTimeStamp) {
    requestAnimationFrame(animate);

    controls.update();
    usedLoop.value?.tick();
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
  display: flex;
  flex-direction: row;
  justify-content: center;
}
</style>
