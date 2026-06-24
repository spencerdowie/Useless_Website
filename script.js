import * as THREE from "three";
import { MarchingCubes } from "three/addons/objects/MarchingCubes.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import Stats from "three/addons/libs/stats.module.js";
import { randFloat } from "three/src/math/MathUtils.js";

class Pendulum extends THREE.Group {
  constructor(i) {
    super();

    this.ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.4),
      new THREE.MeshPhongMaterial({
        color: 0x880000,
        specular: 0xffffff,
        shininess: 50
      })
    );
    this.add(this.ball);
    this.ball.position.y = -3;
    this.name = "Ball " + i;
    this.ball.onClick = (e) => this.onClick(e);
    //scene.add(balls[i]);

    this.line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: 0x000000 })
    );
    this.add(this.line);
    this.line.position.y = -3;
    this.position.set(-2 + i, 3, 0);
  }

  onClick(e) {
    console.log(this.name);
  }

  getBallWorldPos() {
    return this.ball.getWorldPosition(new THREE.Vector3());
  }
}

let camera, scene, renderer;
let controls, stats;
let pendulums = [],
  balls = [];
let heldBall;
let effect;
const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 3, 0)];

let time = 0;
const speed = 8;

const timer = new THREE.Timer();
timer.connect(document);

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
  camera.position.set(0, 3, 8);
  camera.lookAt(0, 0, 0);
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x404040);

  const path = "textures/cube/Park2/";
  const format = ".jpg";
  const urls = [
    path + "posx" + format,
    path + "negx" + format,
    path + "posy" + format,
    path + "negy" + format,
    path + "posz" + format,
    path + "negz" + format
  ];

  const cubeTextureLoader = new THREE.CubeTextureLoader();

  const reflectionCube = cubeTextureLoader.load(urls);
  scene.background = reflectionCube;

  effect = new MarchingCubes(
    56,
    new THREE.MeshPhongMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.8,
      specular: 0xbb6666,
      shininess: 50,
      envMap: reflectionCube,
      reflectivity: 0.8
    }),
    true,
    true,
    100000
  );
  effect.position.set(0, 0, 0);
  effect.scale.set(5, 5, 5);

  effect.enableUvs = false;
  effect.enableColors = false;

  scene.add(effect);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight1.position.set(10, 5, -10);
  scene.add(directionalLight1);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight2.position.set(-2, 0.5, 1);
  scene.add(directionalLight2);

  const controls = new OrbitControls(camera, renderer.domElement);

  // STATS

  stats = new Stats();
  document.body.appendChild(stats.dom);

  window.addEventListener("resize", onWindowResize);
}

function initObjects() {
  for (let i = 0; i < 5; i++) {
    pendulums[i] = new Pendulum(i);
    balls[i] = pendulums[i].getBallWorldPos();
    scene.add(pendulums[i]);
  }

  let floor = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.MeshPhongMaterial({
      color: 0x20ff20,
      specular: 0xffffff,
      shininess: 80,
      transparent: true,
      opacity: 0.35
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1;
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
        hit.object.onClick();
        //console.log("Down " + hit.object.name);
        heldBall = hit.object;
      }
    });
  });

  window.addEventListener("mouseup", (e) => {
    if (heldBall != null) {
      //console.log("Up " + heldBall.name);
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
  timer.update();

  const delta = timer.getDelta() * 0.5;

  time += delta;

  updateCubes();
  updatePendulums(delta);

  renderer.render(scene, camera);
  stats.update();
}

function updateCubes() {
  effect.reset();
  let xOff = 0.5,
    yOff = 0.5,
    zOff = 0.5;

  for (let i = 0; i < balls.length; i++) {
    let strength = 0.2;
    let subtract = 12;
    // let randX = randFloat(0, 0.002),
    //   randY = randFloat(0, 0.002),
    //   randZ = randFloat(0, 0.002);
    let randX = 0,
      randY = 0,
      randZ = 0;
    let ballPosition = balls[i];
    let xPos = ballPosition.x * 0.1 + xOff + randX;
    let yPos = ballPosition.y * 0.1 + yOff + randY;
    let zPos = ballPosition.z + zOff + randZ;
    effect.addBall(xPos, yPos, zPos, strength, subtract);
    //console.log(zPos);
  }

  // let animTime = ((time * 100).toFixed(0) % 20) / 2;
  // console.log(animTime.toFixed(0) % 10);
  // for (let i = 0; i < 5; i++) {
  //   let strength = 0.01;
  //   let subtract = 1;
  //   let xPos = balls[i].position.x * 0.1 + xOff;
  //   let yPos = balls[i].position.y + yOff - animTime * 0.01;
  //   let zPos = balls[i].position.z + zOff;
  //   effect.addBall(xPos, yPos, zPos, strength, subtract);
  // }
  effect.update();
}

function updatePendulums(delta) {
  let angle = Math.sin(time * speed);
  //console.log(angle);
  if (angle < 0) {
    pendulums[0].rotation.z = angle;
  } else {
    pendulums[4].rotation.z = angle;
  }
  for (let i = 0; i < pendulums.length; i++) {
    let pendulumPos = pendulums[i].getBallWorldPos();
    let offset = new THREE.Vector3(1, 1, 1).multiplyScalar(randFloat(0, 0.005));
    //console.log(offset.add(pendulumPos));
    let distance = THREE.MathUtils.clamp(
      balls[i].distanceTo(pendulumPos) * 5.5,
      0,
      1
    );
    //if (distance > 0) console.log(distance);
    balls[i].lerp(pendulumPos.add(offset), easeInOutCubic(distance));
    // balls[i].position.x = pendulumPos.x;
    // balls[i].position.y = pendulumPos.y;
  }
}

//from https://easings.net/#easeInOutCubic
function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
