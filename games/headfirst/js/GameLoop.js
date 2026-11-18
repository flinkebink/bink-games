/** Owns the animation-frame lifecycle and frame delta calculation. */
export class GameLoop {
  constructor(onFrame) {
    this.onFrame = onFrame;
    this.lastTime = 0;
    this.running = false;
    this.frame = this.frame.bind(this);
  }
  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.frame);
  }
  stop() { this.running = false; }
  frame(now) {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;
    this.onFrame(dt);
    requestAnimationFrame(this.frame);
  }
}
