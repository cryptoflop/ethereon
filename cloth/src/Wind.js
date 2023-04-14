import SimplexNoise from "simplex-noise";
import { Clock, Vector3 } from "three";

const noise = new SimplexNoise();
const baseForce = 2000;
const off = 0.05;

export default class Wind {
  constructor(figure) {
    const { count } = figure.geometry.attributes.position;
    this.figure = figure;

    this.force = baseForce / count;

    this.clock = new Clock();
    this.direction = new Vector3(-0.0, -0.3, -.03);
    this.flowfield = new Array(count);

    this.update();
  }

  update() {
    const time = this.clock.getElapsedTime();

    const { position } = this.figure.geometry.attributes;
    const size = this.figure.geometry.parameters.widthSegments;

    for (let i = 0; i < position.count; i++) {
      const col = i % (size + 1);
      const row = Math.floor(i / (size + 1));

      const force =
        (noise.noise3D(row * off, col * off, time) * 0.5 + 0.5) * this.force;

      this.flowfield[i] = this.direction.clone().multiplyScalar(force);
    }
  }
}
