export default class Piece {
  constructor({ name, color, cells, x = 0, y = 0 }) {
    this.name = name;
    this.color = color;
    this.cells = cells.map(([cx, cy]) => [cx, cy]);
    this.x = x;
    this.y = y;
    this.normalize();
  }

  normalize() {
    const minX = Math.min(...this.cells.map(([x]) => x));
    const minY = Math.min(...this.cells.map(([, y]) => y));
    this.cells = this.cells.map(([x, y]) => [x - minX, y - minY]);
    this.width = Math.max(...this.cells.map(([x]) => x)) + 1;
    this.height = Math.max(...this.cells.map(([, y]) => y)) + 1;
    return this;
  }

  clone() {
    return new Piece({
      name: this.name, color: this.color, cells: this.cells,
      x: this.x, y: this.y
    });
  }

  rotated(direction = 1) {
    const rotatedCells = this.cells.map(([x, y]) =>
      direction > 0 ? [this.height - 1 - y, x] : [y, this.width - 1 - x]
    );
    return new Piece({
      name: this.name, color: this.color, cells: rotatedCells,
      x: this.x, y: this.y
    });
  }

  getSpawnPosition(boardWidth) {
    this.x = Math.floor((boardWidth - this.width) / 2);
    this.y = -Math.max(0, this.height - 2);
    return this;
  }
}