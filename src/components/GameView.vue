<template><div class="modelview" ref="hey"></div></template>

<script lang="ts" setup>
import * as THREE from "three";
import { Clock } from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { ref, watch } from "vue";

const hey = ref(null as null | HTMLDivElement);

watch(hey, (v) => {
  if (v === null) {
    return;
  }
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  v.appendChild(renderer.domElement);

  //   const camera = new THREE.PerspectiveCamera(
  //     45,
  //     window.innerWidth / window.innerHeight,
  //     1,
  //     500
  //   );
  const camera = new THREE.OrthographicCamera(-3.2, 3.2, 2.4, -2.4, 0.01, 100);
  camera.position.set(0, 0, 100);
  camera.lookAt(0, 0, 0);

  const scene = new THREE.Scene();

  //   const material = new THREE.LineBasicMaterial({ color: 0x0000ff });

  //   const points = [];
  //   points.push(new THREE.Vector3(-10, 0, 0));
  //   points.push(new THREE.Vector3(0, 10, 0));
  //   points.push(new THREE.Vector3(10, 0, 0));

  //   const geometry = new THREE.BufferGeometry().setFromPoints(points);

  //   const line = new THREE.Line(geometry, material);

  //   scene.add(line);

  var light = new THREE.AmbientLight(0x404040);
  scene.add(light);

  renderer.render(scene, camera);
  const loader = new GLTFLoader();
  loader.load(
    "/models/layer.glb",
    function (gltf) {
      scene.add(gltf.scene);
      const clock = new Clock();

      renderer.setAnimationLoop((time) => {
        gltf.scene.rotateX(0.02);
        renderer.render(scene, camera);
      });
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
});
</script>

<style scoped>
.modelview {
  border: 1em solid lightblue;
}
</style>
