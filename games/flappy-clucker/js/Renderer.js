export default class Renderer {
  constructor(renderFrame) { this.renderFrame = renderFrame; }
  render() { this.renderFrame(); }
}
