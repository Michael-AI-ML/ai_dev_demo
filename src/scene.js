/**
 * scene.js — Three.js scene setup: renderer, camera, lighting, orbit controls
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createScene(canvas) {
  // --- Renderer ---
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x1a1a2e);

  // --- Scene ---
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x1a1a2e, 15, 40);

  // --- Camera ---
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 4, 10);
  camera.lookAt(0, 0, 0);

  // --- Orbit Controls ---
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 3;
  controls.maxDistance = 20;
  controls.target.set(0, 0, 0);

  // --- Lighting ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 10, 7);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3);
  fillLight.position.set(-5, -2, -5);
  scene.add(fillLight);

  // --- Grid reference plane ---
  const gridHelper = new THREE.GridHelper(20, 20, 0x333355, 0x222244);
  gridHelper.position.y = -3.5;
  scene.add(gridHelper);

  // --- Resize handling ---
  function resize() {
    const container = canvas.parentElement;
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  return { scene, camera, renderer, controls };
}
