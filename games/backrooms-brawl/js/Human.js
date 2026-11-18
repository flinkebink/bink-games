export class Human {
  static names = ['Dave','Jess','Mo','Carl','Priya','Tom','Lena','Ozzy','Kai','Rita'];
  static shirts = ['#3b82f6','#ef4444','#22c55e','#a855f7','#f97316','#14b8a6'];
  static skins = ['#f2c28b','#c68642','#8d5524','#ffdbac'];
  constructor(x, y, kind = 'f') {
    Object.assign(this, { x, y, r: 18, hp: 60, maxHp: 60, kind, cooldown: 1 + Math.random() * 2,
      angle: 0, wanderTime: 0, wanderAngle: 0, time: Math.random() * 9, flash: 0,
      id: Math.random() * 9, side: Math.random() < .5 ? 1 : -1,
      color: Human.shirts[Math.random() * Human.shirts.length | 0],
      skin: Human.skins[Math.random() * Human.skins.length | 0],
      name: Human.names[Math.random() * Human.names.length | 0], moving: false, scared: false, dead: false });
  }
  update(dt, player, world, level) {
    this.time += dt; this.flash -= dt; this.cooldown -= dt;
    const dx = player.x - this.x, dy = player.y - this.y;
    const distance = Math.hypot(dx, dy) || 1;
    const angle = Math.atan2(dy, dx);
    this.scared = distance < 300;
    let moveAngle, speed;
    if (this.kind === 'f' && distance < 300) { moveAngle = angle + Math.PI + Math.sin(this.time * 2 + this.id) * .7; speed = 150; }
    else if (this.kind === 's') {
      this.angle = angle;
      if (distance < 260) { moveAngle = angle + Math.PI + Math.sin(this.time * 3 + this.id) * .9; speed = 190; }
    }
    if (speed === undefined) {
      this.wanderTime -= dt;
      if (this.wanderTime <= 0) { this.wanderAngle = Math.random() * 7; this.wanderTime = 1 + Math.random() * 2; }
      moveAngle = this.wanderAngle; speed = 55;
    }
    speed *= 1 + level * .12;
    const ox = this.x, oy = this.y;
    world.move(this, Math.cos(moveAngle) * speed * dt, Math.sin(moveAngle) * speed * dt);
    if (Math.hypot(this.x - ox, this.y - oy) < speed * dt * .3) {
      world.move(this, Math.cos(moveAngle + 1.57 * this.side) * speed * dt, Math.sin(moveAngle + 1.57 * this.side) * speed * dt);
      this.wanderTime -= .3;
    }
    this.moving = true;
  }
  takeDamage(amount) {
    this.hp -= amount; this.flash = .12;
    if (this.hp <= 0) this.dead = true;
  }
}
