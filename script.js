import * as THREE from "three";
import { AmmoPhysics } from "three/addons/physics/AmmoPhysics.js";

class Ball extends THREE.Mesh {
  constructor() {
    super();
    this.geometry = new THREE.SphereGeometry();
    this.material = new THREE.MeshPhongMaterial({ color: 0xffffff });
  }

  onClick(e) {
    console.log("Hit " + this.name);
  }
}

let camera, scene, renderer;
let controls;
let heldBall;

init();

function init() {
  initGraphics();
  initInput();
  initObjects();
}

function initGraphics() {
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 2, 5);
  camera.lookAt(0, 0, 0);
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x404040);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  window.addEventListener("resize", onWindowResize);
}

function initObjects() {
  const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 3, 0)];
  const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
  const lineMat = new THREE.LineBasicMaterial({ color: 0x000000 });

  for (let i = 0; i < 5; i++) {
    let orgPos = new THREE.Object3D();
    orgPos.position.set(-2 + i, 3, 0);

    let ball = new Ball();
    ball.scale.set(0.5, 0.5, 0.5);
    ball.position.x = -2 + i;
    ball.name = "Ball " + i;
    scene.add(ball);

    let line = new THREE.Line(lineGeo, lineMat);
    line.position.x = -2 + i;
    line.parent = ball;
    scene.add(line);
  }

  const floorGeo = new THREE.PlaneGeometry(12, 12);
  const floorMat = new THREE.MeshPhongMaterial({ color: 0x20ff20 });
  let floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.5;
  scene.add(floor);
}

function initInput() {
  window.addEventListener("mousedown", (e) => {
    let mouse = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );

    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    raycaster.intersectObjects(scene.children, true).forEach((hit) => {
      if (hit.object.onClick) {
        console.log("Down " + hit.object.name);
        heldBall = hit.object;
      }
    });
  });

  window.addEventListener("mouseup", (e) => {
    if (heldBall != null) {
      console.log("Up " + heldBall.name);
      heldBall = null;
    }
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  renderer.render(scene, camera);
}
