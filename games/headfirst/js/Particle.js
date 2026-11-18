/** Short-lived visual effect particle. */
export class Particle {
  constructor({ x, y, vx, vy, l, col }) {
    Object.assign(this, { x, y, vx, vy, l, col });
  }
  update(dt) { this.x += this.vx * dt; this.y += this.vy * dt; this.l -= dt; }
  get expired() { return this.l <= 0; }
}
