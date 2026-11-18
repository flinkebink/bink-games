export default class Game {
  constructor({ update, render }) {
    this.update = update;
    this.render = render;
    this.accumulator = 0;
    this.lastTime = 0;
    this.frame = this.frame.bind(this);
  }

  start() {
    requestAnimationFrame(time => {
      this.lastTime = time;
      this.frame(time);
    });
  }

  frame(time) {
    this.accumulator += Math.min(time - this.lastTime, 100);
    this.lastTime = time;
    while (this.accumulator >= 16.67) {
      this.update();
      this.accumulator -= 16.67;
    }
    this.render();
    requestAnimationFrame(this.frame);
  }
}
