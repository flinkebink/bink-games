export default class Particle {
  constructor({ x, y, vx = 0, vy = 0, life = 30, maxLife = life, kind = "s", color = "#fff9e0", radius = 2, rotation = 0 }) {
    Object.assign(this, { x, y, vx, vy, l: life, m: maxLife, k: kind, c: color, r: radius, rotation });
  }

  static createBurst(x, y, count, kind, color, random = Math.random) {
    return Array.from({ length: count }, () => {
      const angle = random() * Math.PI * 2;
      const speed = 1 + random() * (kind === "s" ? 5 : 3);
      return new Particle({
        x,
        y,
        vx: Math.cos(angle) * speed - 1,
        vy: Math.sin(angle) * speed,
        life: 30 + random() * 30,
        maxLife: 60,
        kind,
        color: color || "#fff9e0",
        radius: random() * 6,
      });
    });
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.k !== "t") this.vy += this.k === "f" ? 0.06 : 0.15;
    if (this.k === "f") this.vx *= 0.98;
    return --this.l > 0;
  }
}
