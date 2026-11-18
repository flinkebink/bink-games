export class Particle {
  constructor(x, y, color) {
    Object.assign(this, { x, y, color, vx: (Math.random() - .5) * 500, vy: (Math.random() - .5) * 500, life: .8, maxLife: .8, size: 8 });
  }
  update(dt) { this.x += this.vx * dt; this.y += this.vy * dt; this.vx *= .94; this.vy *= .94; this.life -= dt; }
  get alive() { return this.life > 0; }
}
