import * as THREE from "three";
import C from "cannon";

const size = 8;
const mass = 1;

export default class Figure {
  constructor(scene, world) {
    this.$image = document.querySelector(".tile__image");
    this.$image.style.opacity = 0;

    this.scene = scene;
    this.world = world;

    this.loader = new THREE.TextureLoader();

    this.image = this.loader.load(
      "data:image/svg+xml,%3Csvg viewBox='0 0 44 220' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='44' height='220' fill='red'%3E%3C/rect%3E%3Ctext transform='rotate(90)' x='32' y='-16' fill='white' style='font-family: Arial; font-size: 18px;'%3ERemove before flight%3C/text%3E%3C/svg%3E"
    );

    this.sizes = new THREE.Vector2(0, 0);
    this.offset = new THREE.Vector2(0, 0);
    this.bufferV = new THREE.Vector3();
    this.bufferV2 = new C.Vec3();

    this.getSizes();

    this.createMesh();
    this.createStitches();
  }

  getSizes() {
    const { width, height, top, left } = this.$image.getBoundingClientRect();

    this.sizes.set(width, height);
    this.offset.set(
      left - window.innerWidth / 2 + width / 2,
      -top + window.innerHeight / 2 - height / 2
    );
  }

  createMesh() {
    this.geometry = new THREE.PlaneBufferGeometry(1, 1, size, size);
    this.material = new THREE.MeshBasicMaterial({
      map: this.image
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.mesh.position.set(this.offset.x, this.offset.y, 0);
    this.mesh.scale.set(this.sizes.x, this.sizes.y, 1);

    this.scene.add(this.mesh);
  }

  createStitches() {
    const particleShape = new C.Particle();
    const { position } = this.geometry.attributes;
    const { x: width, y: height } = this.sizes;

    this.stitches = [];

    for (let i = 0; i < position.count; i++) {
      const row = Math.floor(i / (size + 1));

      const pos = new C.Vec3(
        position.getX(i) * width,
        position.getY(i) * height,
        position.getZ(i)
      );

      const stitch = new C.Body({
        mass: row === 0 ? 0 : mass / position.count,
        linearDamping: 0.8,
        position: pos,
        shape: particleShape
      });

      this.stitches.push(stitch);
      this.world.addBody(stitch);
    }

    for (let i = 0; i < position.count; i++) {
      const col = i % (size + 1);
      const row = Math.floor(i / (size + 1));

      if (col < size) this.connect(i, i + 1);
      if (row < size) this.connect(i, i + size + 1);
    }
  }

  connect(i, j) {
    const c = new C.DistanceConstraint(this.stitches[i], this.stitches[j]);

    this.world.addConstraint(c);
  }

  applyWind(wind) {
    const { position } = this.geometry.attributes;

    for (let i = 0; i < position.count; i++) {
      const stitch = this.stitches[i];

      const windNoise = wind.flowfield[i];
      const tempPosPhysic = this.bufferV2.set(
        windNoise.x,
        windNoise.y,
        windNoise.z
      );

      stitch.applyForce(tempPosPhysic, C.Vec3.ZERO);
    }
  }

  update() {
    const { position } = this.geometry.attributes;
    const { x: width, y: height } = this.sizes;

    for (let i = 0; i < position.count; i++) {
      const p = this.bufferV.copy(this.stitches[i].position);

      position.setXYZ(i, p.x / width, p.y / height, p.z);
    }

    position.needsUpdate = true;
  }
}
