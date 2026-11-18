import { CELL_SIZE, COLORS, COLS, ROWS } from "./Constants.js";
import Board from "./Board.js";
import PieceBag from "./PieceBag.js";
import Particle from "./Particle.js";
import Renderer from "./Renderer.js";

export default class Game {
  constructor() {
    this.board = new Board();
    this.pieceBag = new PieceBag();
    this.renderer = new Renderer();
    this.state = "menu";
    this.activePiece = null;
    this.upcomingPieces = [];
    this.heldPiece = null;
    this.canHold = true;
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.dropTimer = 0;
    this.lastFrame = 0;
    this.animationFrame = 0;
    this.particles = [];
    this.bestScore = this.loadBestScore();
    this.softDropActive = false;
    this.updateStats();
  }

  loadBestScore() {
    try { return Number(localStorage.getItem("polyfall-best")) || 0; }
    catch { return 0; }
  }

  start() {
    this.board.reset();
    this.pieceBag.reset();
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.upcomingPieces = [];
    this.heldPiece = null;
    this.particles = [];
    this.canHold = true;
    this.state = "play";
    document.querySelector("#overlay").hidden = true;
    this.spawnPiece();
    this.updateStats();
    this.lastFrame = performance.now();
    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = requestAnimationFrame(time => this.loop(time));
    this.draw();
  }

  spawnPiece() {
    while (this.upcomingPieces.length < 4) {
      this.upcomingPieces.push(this.pieceBag.next());
    }
    this.activePiece = this.upcomingPieces.shift().getSpawnPosition(COLS);
    this.canHold = true;
    if (!this.board.canPlace(this.activePiece)) this.endGame();
    this.updatePreviews();
  }

  move(dx, dy = 0, awardDropPoints = false) {
    if (this.state !== "play" || !this.activePiece) return false;
    if (!this.board.canPlace(this.activePiece, dx, dy)) return false;
    this.activePiece.x += dx;
    this.activePiece.y += dy;
    if (dy > 0 && awardDropPoints) {
      this.score++;
      this.updateStats();
    }
    this.draw();
    return true;
  }

  softDrop() {
    this.move(0, 1, true);
  }

  rotate(direction) {
    if (this.state !== "play" || !this.activePiece) return;
    const rotated = this.activePiece.rotated(direction);
    for (const [offsetX, offsetY] of [[0,0],[-1,0],[1,0],[-2,0],[2,0],[0,-1]]) {
      if (this.board.canPlace(rotated, offsetX, offsetY)) {
        rotated.x += offsetX;
        rotated.y += offsetY;
        this.activePiece = rotated;
        this.draw();
        return;
      }
    }
  }

  hardDrop() {
    if (this.state !== "play" || !this.activePiece) return;
    let distance = 0;
    while (this.board.canPlace(this.activePiece, 0, 1)) {
      this.activePiece.y++;
      distance++;
    }
    this.score += distance * 2;
    this.lockPiece();
    this.draw();
  }

  holdPiece() {
    if (this.state !== "play" || !this.canHold || !this.activePiece) return;
    const outgoing = this.activePiece.clone();
    if (this.heldPiece) {
      this.activePiece = this.heldPiece.getSpawnPosition(COLS);
    } else {
      this.spawnPiece();
    }
    this.heldPiece = outgoing;
    this.canHold = false;
    if (!this.board.canPlace(this.activePiece)) this.endGame();
    this.updatePreviews();
    this.draw();
  }

  lockPiece() {
    if (!this.board.lock(this.activePiece)) {
      this.endGame();
      return;
    }
    this.clearRows();
    this.spawnPiece();
    this.updateStats();
  }

  clearRows() {
    const cleared = this.board.clearFullRows();
    if (!cleared) return;
    const points = [0, 100, 300, 500, 800, 1200, 1600][cleared] || cleared * 400;
    this.score += points * this.level;
    this.lines += cleared;
    this.level = 1 + Math.floor(this.lines / 8);
    for (let i = 0; i < cleared * 12; i++) {
      this.particles.push(new Particle(
        Math.random() * COLS * CELL_SIZE,
        Math.random() * ROWS * CELL_SIZE,
        COLORS[Math.floor(Math.random() * COLORS.length)]
      ));
    }
  }

  togglePause() {
    if (this.state === "play") {
      this.state = "paused";
      this.showOverlay("PAUSED", "Take a breather. Your stack is waiting.", "RESUME");
    } else if (this.state === "paused") {
      document.querySelector("#overlay").hidden = true;
      this.state = "play";
      this.lastFrame = performance.now();
      this.animationFrame = requestAnimationFrame(time => this.loop(time));
    }
  }

  endGame() {
    this.state = "over";
    this.showOverlay("GRID LOCKED",
      "The stack reached the top. Final score: " + this.score.toLocaleString() + ".",
      "PLAY AGAIN");
    this.updateStats();
  }

  showOverlay(title, message, buttonLabel) {
    document.querySelector("#overlayTitle").textContent = title;
    document.querySelector("#overlayText").textContent = message;
    document.querySelector("#start").textContent = buttonLabel;
    document.querySelector("#overlay").hidden = false;
  }

  updateStats() {
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      try { localStorage.setItem("polyfall-best", String(this.bestScore)); } catch {}
    }
    document.querySelector("#score").textContent = this.score.toLocaleString();
    document.querySelector("#best").textContent = this.bestScore.toLocaleString();
    document.querySelector("#lines").textContent = this.lines;
    document.querySelector("#level").textContent = this.level;
    this.updatePreviews();
  }

  updatePreviews() {
    this.renderer.drawPreviews(this.heldPiece, this.upcomingPieces);
  }

  getGhostY() {
    const ghost = this.activePiece.clone();
    while (this.board.canPlace(ghost, 0, 1)) ghost.y++;
    return ghost.y;
  }

  draw() {
    if (!this.activePiece) return;
    this.renderer.drawBoard(
      this.board, this.activePiece, this.getGhostY(), this.particles
    );
  }

  loop(time) {
    if (this.state !== "play") return;
    const delta = Math.min(50, time - this.lastFrame);
    this.lastFrame = time;
    this.dropTimer += delta;
    const interval = this.softDropActive
      ? 45 : Math.max(75, 760 - (this.level - 1) * 58);
    if (this.dropTimer >= interval) {
      this.dropTimer = 0;
      if (!this.move(0, 1)) this.lockPiece();
    }
    this.particles.forEach(particle => particle.update());
    this.particles = this.particles.filter(particle => particle.alive);
    this.draw();
    if (this.state === "play") {
      this.animationFrame = requestAnimationFrame(nextTime => this.loop(nextTime));
    }
  }

  setSoftDrop(active) {
    this.softDropActive = active;
  }
}