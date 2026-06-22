import * as THREE from "three";
import { MarchingCubes } from "./MarchingCubes.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import Stats from "three/addons/libs/stats.module.js";
import { randFloat } from "three/src/math/MathUtils.js";

class Ball extends THREE.Group {
  constructor(i) {
    super();

    this.ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.5),
      new THREE.MeshPhongMaterial({ color: 0xffffff })
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
    //this.setRotationFromEuler(new THREE.Euler(0, 0, -.75));
    this.position.set(-2 + i, 3, 0);

    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin();
    transform.setRotation();
    let motionState = new Ammo.btDefaultMotionState(transform);
    let colShape = new Ammo.btSphereShape(0, 5);
    colShape.setMargin(0.05);
    let localInertia = new Ammo.btVector(0, 0, 0);
    colShape.calculateLocalInertia(MaskPass, localInertia);
    let rbInfo = new btRigidBodyConstructionInfo(
      1,
      motionState,
      colShape,
      localInertia
    );
    let body = new Ammo.btRigidBody(rbInfo);

    physics.addRigidBody(rbInfo);
  }

  onClick(e) {
    console.log(this.name);
    this.setRotationFromEuler(new THREE.Euler(0, 0, -0.75));
  }
}

let camera, scene, renderer, physics;
let controls, stats;
let balls = [];
let heldBall;
let effect;
const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 3, 0)];

let time = 0;

const timer = new THREE.Timer();
timer.connect(document);

Ammo().then(function (AmmoLib) {
  Ammo = AmmoLib;

  init();
  animate();
});

//init();

function init() {
  initGraphics();
  initPhysics();
  initInput();
  initObjects();
}

function initPhysics() {
  const collisionConfig = new Ammo.btDefaultCollisionConfiguration();
  const dispatcher = new Ammo.btCollisionDispatcher(collisionConfig);
  const overlappingPairCache = new Ammo.btDbvtBroadphase();
  const solver = new Ammo.btSequentialImpulseConstraintSolver();
  physics = new Ammo.btDiscreteDynamicsWorld(
    dispatcher,
    overlappingPairCache,
    solver,
    collisionConfig
  );
  physics.setGravity(new Ammo.btVector3(0, -10, 0));
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

  effect = new MarchingCubes(
    56,
    new THREE.MeshPhongMaterial({ color: 0xff0000 }),
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

  const controls = new OrbitControls(camera, renderer.domElement);

  // STATS

  stats = new Stats();
  document.body.appendChild(stats.dom);

  window.addEventListener("resize", onWindowResize);
}

function initObjects() {
  for (let i = 0; i < 5; i++) {
    let ball = new Ball(i);
    balls[i] = ball;
    scene.add(ball);
  }

  const floorGeo = new THREE.PlaneGeometry(12, 12);
  const floorMat = new THREE.MeshPhongMaterial({ color: 0x20ff20 });
  let floor = new THREE.Mesh(floorGeo, floorMat);
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

  const delta = timer.getDelta();

  time += delta * 0.5;

  //updateCubes();

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
    let randX = randFloat(0, 0.002),
      randY = randFloat(0, 0.002),
      randZ = randFloat(0, 0.002);
    let xPos = balls[i].position.x * 0.1 + xOff + randX;
    let yPos = balls[i].position.y + yOff + randY;
    let zPos = balls[i].position.z + zOff + randZ;
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
