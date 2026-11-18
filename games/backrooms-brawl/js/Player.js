export class Player {
  constructor(x, y) {
    Object.assign(this, { x, y, r: 20, hp: 120, maxHp: 120, angle: 0, invulnerable: 0, hurt: 0, time: 0, moving: false });
  }
  update(dt, input, world) {
    this.time += dt;
    this.invulnerable -= dt;
    this.hurt -= dt;
    const { x, y } = input.direction();
    const length = Math.hypot(x, y);
    const dx = length > 1 ? x / length : x;
    const dy = length > 1 ? y / length : y;
    this.moving = Math.hypot(dx, dy) > .12;
    if (this.moving) {
      this.angle = Math.atan2(dy, dx);
      world.move(this, dx * 310 * dt, dy * 310 * dt);
    }
  }
  takeDamage(amount) {
    if (this.invulnerable > 0) return false;
    this.hp -= amount;
    this.hurt = .15;
    this.invulnerable = .35;
    return true;
  }
}
