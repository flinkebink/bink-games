import { CELL_SIZE, COLORS, COLS, ROWS } from "./Constants.js";

export default class Renderer {
  constructor() {
    this.canvas = document.querySelector("#board");
    this.context = this.canvas.getContext("2d");
    this.holdCanvas = document.querySelector("#hold");
    this.nextCanvases = [0, 1, 2].map(index => document.querySelector("#next" + index));
  }

  drawCell(context, x, y, colorIndex, size = CELL_SIZE) {
    const px = x * size;
    const py = y * size;
    context.fillStyle = COLORS[colorIndex];
    context.fillRect(px + 1, py + 1, size - 2, size - 2);
    context.fillStyle = "#ffffff35";
    context.fillRect(px + 3, py + 3, size - 6, Math.max(2, size * 0.13));
    context.fillStyle = "#00000025";
    context.fillRect(px + 3, py + size - 5, size - 6, 2);
    context.strokeStyle = "#07102099";
    context.lineWidth = 1;
    context.strokeRect(px + 1.5, py + 1.5, size - 3, size - 3);
  }

  drawPiece(context, piece, alpha = 1, size = CELL_SIZE) {
    context.save();
    context.globalAlpha = alpha;
    for (const [x, y] of piece.cells) {
      this.drawCell(context, x + piece.x, y + piece.y, piece.color, size);
    }
    context.restore();
  }

  drawBoard(board, activePiece, ghostY, particles) {
    const context = this.context;
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const background = context.createLinearGradient(0, 0, 300, 600);
    background.addColorStop(0, "#101b33");
    background.addColorStop(1, "#080e1d");
    context.fillStyle = background;
    context.fillRect(0, 0, 300, 600);

    context.strokeStyle = "#ffffff0b";
    context.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      context.beginPath(); context.moveTo(x * CELL_SIZE, 0);
      context.lineTo(x * CELL_SIZE, 600); context.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      context.beginPath(); context.moveTo(0, y * CELL_SIZE);
      context.lineTo(300, y * CELL_SIZE); context.stroke();
    }

    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        const color = board.cells[y][x];
        if (color !== null) this.drawCell(context, x, y, color);
      }
    }

    if (activePiece) {
      const ghost = activePiece.clone();
      ghost.y = ghostY;
      this.drawPiece(context, ghost, 0.2);
      this.drawPiece(context, activePiece);
    }
    particles.forEach(particle => particle.draw(context));
  }

  drawMini(canvas, piece) {
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#0b1325";
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (!piece) return;

    const width = piece.width;
    const height = piece.height;
    const size = Math.min(23, Math.floor(116 / width), Math.floor(55 / height));
    const offsetX = (canvas.width - width * size) / 2;
    const offsetY = (canvas.height - height * size) / 2;
    context.save();
    context.translate(offsetX, offsetY);
    for (const [x, y] of piece.cells) this.drawCell(context, x, y, piece.color, size);
    context.restore();
  }

  drawPreviews(holdPiece, upcomingPieces) {
    this.drawMini(this.holdCanvas, holdPiece);
    this.nextCanvases.forEach((canvas, index) =>
      this.drawMini(canvas, upcomingPieces[index] || null)
    );
  }
}