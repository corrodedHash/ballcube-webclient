<template><div class="modelview" ref="hey"></div></template>

<script lang="ts" setup>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ref, watch } from "vue";
import { build_board } from "@/board";
const hey = ref(null as null | HTMLDivElement);

async function setup_render(element: HTMLDivElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  // renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setSize(500, 500);
  element.appendChild(renderer.domElement);

  //   const camera = new THREE.PerspectiveCamera(
  //     45,
  //     window.innerWidth / window.innerHeight,
  //     1,
  //     500
  //   );

  const camera = new THREE.OrthographicCamera(-20, 20, 20, -20, 0, 200);
  camera.position.set(0, 0, 100);
  camera.lookAt(0, 0, 0);

  const scene = new THREE.Scene();

  var light = new THREE.AmbientLight(0x404040);
  scene.add(light);

  var spotlight_left = new THREE.DirectionalLight(0xffffff, 0.8);
  spotlight_left.position.set(-80, 0, 80);
  spotlight_left.lookAt(0, 0, 0);
  scene.add(spotlight_left);

  renderer.render(scene, camera);
  const board = await build_board();
  // board.rotateY(Math.PI / 4)
  board.position.addVectors(board.position, new THREE.Vector3(0, -15, 0));
  board.rotateX(Math.PI / 8);

  scene.add(board);
  renderer.render(scene, camera);
  const controls = new OrbitControls(camera, renderer.domElement);

  //controls.update() must be called after any manual changes to the camera's transform
  camera.position.set(0, 20, 100);
  controls.update();

  function animate() {
    requestAnimationFrame(animate);

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    renderer.render(scene, camera);
  }
  animate()
}

watch(hey, (v) => {
  if (v === null) {
    return;
  }
  setup_render(v);
});
</script>

<style scoped>
.modelview {
  border: 0.2em solid lightblue;
}
</style>
