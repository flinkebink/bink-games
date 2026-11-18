/** A fired projectile and the data needed to simulate its flight. */
export class Projectile {
  constructor({ x, y, vx, vy, l, d, z = 1, fx = null }) {
    Object.assign(this, { x, y, vx, vy, l, d, z, fx });
  }
  update(dt) { this.x += this.vx * dt; this.y += this.vy * dt; this.l -= dt; }
  get expired() { return this.l <= 0; }
}
