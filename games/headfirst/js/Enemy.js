/** A predator moving through the arena. */
export class Enemy {
  constructor({ x, y, s, e, hp, mh, k, v, f = 0, st = 0, kx = 0, ky = 0 }) {
    Object.assign(this, { x, y, s, e, hp, mh, k, v, f, st, kx, ky });
  }
}
