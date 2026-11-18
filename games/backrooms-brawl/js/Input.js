export class Input {
  constructor(canvas) {
    this.canvas = canvas; this.keys = {}; this.joystick = null;
    this.onDown = e => {
      if (!this.joystick) { const p = this.position(e); this.joystick = { id: e.pointerId, ox: p.x, oy: p.y, dx: 0, dy: 0 }; }
      try { canvas.setPointerCapture(e.pointerId); } catch {}
    };
    this.onMove = e => {
      if (!this.joystick || this.joystick.id !== e.pointerId) return;
      const p = this.position(e), dx = p.x - this.joystick.ox, dy = p.y - this.joystick.oy;
      const d = Math.hypot(dx, dy) || 1, scale = Math.min(d, 52) / 52;
      this.joystick.dx = dx / d * scale; this.joystick.dy = dy / d * scale;
    };
    this.onUp = e => { if (this.joystick?.id === e.pointerId) this.joystick = null; };
    this.onKeyDown = e => { this.keys[e.key.toLowerCase()] = true; if (e.key === ' ') e.preventDefault(); };
    this.onKeyUp = e => { this.keys[e.key.toLowerCase()] = false; };
    canvas.addEventListener('pointerdown', this.onDown);
    addEventListener('pointermove', this.onMove); addEventListener('pointerup', this.onUp); addEventListener('pointercancel', this.onUp);
    addEventListener('keydown', this.onKeyDown); addEventListener('keyup', this.onKeyUp);
  }
  position(e) { const r = this.canvas.getBoundingClientRect(); return { x: e.clientX-r.left, y: e.clientY-r.top }; }
  direction() {
    if (this.joystick) return { x: this.joystick.dx, y: this.joystick.dy };
    return { x: Number(!!(this.keys.d || this.keys.arrowright)) - Number(!!(this.keys.a || this.keys.arrowleft)),
      y: Number(!!(this.keys.s || this.keys.arrowdown)) - Number(!!(this.keys.w || this.keys.arrowup)) };
  }
  destroy() {
    this.canvas.removeEventListener('pointerdown', this.onDown);
    removeEventListener('pointermove', this.onMove); removeEventListener('pointerup', this.onUp); removeEventListener('pointercancel', this.onUp);
    removeEventListener('keydown', this.onKeyDown); removeEventListener('keyup', this.onKeyUp);
  }
}
