import { COLS, ROWS } from "./Constants.js";

export default class Board {
  constructor(width = COLS, height = ROWS) {
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset() {
    this.cells = Array.from({ length: this.height }, () => Array(this.width).fill(null));
  }

  canPlace(piece, dx = 0, dy = 0) {
    return !piece.cells.some(([cx, cy]) => {
      const x = piece.x + cx + dx;
      const y = piece.y + cy + dy;
      return x < 0 || x >= this.width || y >= this.height ||
        (y >= 0 && this.cells[y][x] !== null);
    });
  }

  lock(piece) {
    if (piece.cells.some(([, cy]) => piece.y + cy < 0)) return false;
    for (const [cx, cy] of piece.cells) {
      this.cells[piece.y + cy][piece.x + cx] = piece.color;
    }
    return true;
  }

  clearFullRows() {
    let cleared = 0;
    for (let y = this.height - 1; y >= 0; y--) {
      if (this.cells[y].every(cell => cell !== null)) {
        this.cells.splice(y, 1);
        this.cells.unshift(Array(this.width).fill(null));
        cleared++;
        y++;
      }
    }
    return cleared;
  }
}