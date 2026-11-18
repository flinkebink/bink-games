export default class InputController {
  constructor(canvas, { onTap, onFlap, width, height }) {
    this.canvas = canvas;
    this.onTap = onTap;
    this.onFlap = onFlap;
    this.width = width;
    this.height = height;
    canvas.addEventListener("pointerdown", event => {
      event.preventDefault();
      const bounds = canvas.getBoundingClientRect();
      this.onTap((event.clientX - bounds.left) * this.width / bounds.width,
        (event.clientY - bounds.top) * this.height / bounds.height);
    });
    window.addEventListener("keydown", event => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        this.onFlap();
      }
    });
  }
}
