import * as THREE from "three";
import Figure from "./Figure";
import Wind from "./Wind";
import C from "cannon";

const perspective = 800;

export default class Scene {
  constructor() {
    this.container = document.getElementById("stage");

    this.scene = new THREE.Scene();
    this.world = new C.World();
    this.world.gravity.set(0, -1000, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.container,
      alpha: true,
      antialias: true
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.initLights();
    this.initCamera();

    this.figure = new Figure(this.scene, this.world);
    this.wind = new Wind(this.figure.mesh);

    this.update();
  }

  initLights() {
    const ambientlight = new THREE.AmbientLight(0xffffff, 2);
    this.scene.add(ambientlight);
  }

  initCamera() {
    const fov =
      (180 * (2 * Math.atan(window.innerHeight / 2 / perspective))) / Math.PI;

    this.camera = new THREE.PerspectiveCamera(
      fov,
      window.innerWidth / window.innerHeight,
      1,
      5000
    );
    this.camera.position.set(0, 0, perspective);
  }

  update() {
    if (
      this.renderer === undefined ||
      this.scene === undefined ||
      this.camera === undefined
    )
      return;
    requestAnimationFrame(this.update.bind(this));

    this.wind.update();
    this.figure.update();
    this.figure.applyWind(this.wind);
    this.world.step(1 / 60);
    this.renderer.render(this.scene, this.camera);
  }
}
