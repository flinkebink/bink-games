export class World {
  static SIZE = 32;
  static TILE = 56;
  constructor() { this.tiles = []; this.generate(); }
  generate() {
    const n = World.SIZE;
    this.tiles = Array.from({ length: n }, (_, y) => Array.from({ length: n }, (_, x) => x === 0 || y === 0 || x === n - 1 || y === n - 1 ? 1 : 0));
    for (let i = 0; i < 100; i++) {
      const x = 2 + Math.random() * (n - 4) | 0, y = 2 + Math.random() * (n - 4) | 0;
      const length = 1 + Math.random() * 4 | 0, horizontal = Math.random() < .5;
      for (let k = 0; k < length; k++) {
        const tx = horizontal ? x + k : x, ty = horizontal ? y : y + k;
        if (tx < n - 1 && ty < n - 1 && !(Math.abs(tx - n / 2) < 4 && Math.abs(ty - n / 2) < 4)) this.tiles[ty][tx] = 1;
      }
    }
  }
  isBlocked(x, y, radius = 0) {
    const t = World.TILE;
    for (let ty = Math.floor((y-radius)/t); ty <= Math.floor((y+radius)/t); ty++)
      for (let tx = Math.floor((x-radius)/t); tx <= Math.floor((x+radius)/t); tx++)
        if (ty < 0 || tx < 0 || ty >= World.SIZE || tx >= World.SIZE || this.tiles[ty][tx]) return true;
    return false;
  }
  move(entity, dx, dy) {
    if (!this.isBlocked(entity.x + dx, entity.y, entity.r)) entity.x += dx;
    if (!this.isBlocked(entity.x, entity.y + dy, entity.r)) entity.y += dy;
  }
  randomOpenPosition() {
    for (let i = 0; i < 100; i++) {
      const x = (1 + Math.random() * (World.SIZE - 2)) * World.TILE;
      const y = (1 + Math.random() * (World.SIZE - 2)) * World.TILE;
      if (!this.isBlocked(x, y, 20)) return { x, y };
    }
    return { x: World.SIZE * World.TILE / 2, y: World.SIZE * World.TILE / 2 };
  }
}