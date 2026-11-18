import Piece from "./Piece.js";
import { SHAPES } from "./Constants.js";

export default class PieceBag {
  constructor() {
    this.remaining = [];
  }

  refill() {
    this.remaining = SHAPES.map(shape => ({ ...shape, cells: shape.cells.map(cell => [...cell]) }));
    for (let i = this.remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.remaining[i], this.remaining[j]] = [this.remaining[j], this.remaining[i]];
    }
  }

  next() {
    if (this.remaining.length === 0) this.refill();
    return new Piece(this.remaining.pop());
  }

  reset() {
    this.remaining = [];
  }
}