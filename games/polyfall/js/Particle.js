export default class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = (Math.random() - 0.5) * 5;
    this.vy = -Math.random() * 5 - 1;
    this.life = 35;
    this.maxLife = 35;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.13;
    this.life--;
  }

  draw(context) {
    context.globalAlpha = this.life / this.maxLife;
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, 4, 4);
    context.globalAlpha = 1;
  }

  get alive() {
    return this.life > 0;
  }
}