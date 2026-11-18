export default class Chicken {
  constructor(y = 250, velocity = 0) {
    this.y = y;
    this.v = velocity;
  }

  flap(force) {
    this.v = force;
  }

  applyGravity(gravity) {
    this.v += gravity;
    this.y += this.v;
  }

  stopAt(y) {
    this.y = y;
    this.v = 0;
  }
}
