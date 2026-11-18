export default class Pipe {
  constructor({ x, base, top = base, amp = 0, ph = 0, pu = null, po = 0 }) {
    Object.assign(this, { x, base, top, amp, ph, pu, po });
    this.passed = false;
  }

  update(speed, frame, gap = 150) {
    this.x -= speed;
    this.top = Math.max(45, Math.min(310, this.base + Math.sin(frame * 0.04 + this.ph) * this.amp));
    this.bottom = this.top + gap;
  }

  isOffscreen() {
    return this.x < -60;
  }
}
