export default class InputController {
  constructor(game) {
    this.game = game;
    this.softDrop = false;
    this.bindKeyboard();
    this.bindTouch();
    document.querySelector("#start").addEventListener("click", () => {
      if (this.game.state === "paused") this.game.togglePause();
      else this.game.start();
    });
  }

  bindKeyboard() {
    document.addEventListener("keydown", event => {
      const key = event.key.toLowerCase();
      if (["arrowleft", "arrowright", "arrowdown", "arrowup", " "].includes(key)) {
        event.preventDefault();
      }
      if (key === "arrowleft" || key === "a") this.game.move(-1);
      else if (key === "arrowright" || key === "d") this.game.move(1);
      else if (key === "arrowdown" || key === "s") this.game.softDrop();
      else if (key === "arrowup" || key === "x") this.game.rotate(1);
      else if (key === "z") this.game.rotate(-1);
      else if (key === " ") this.game.hardDrop();
      else if (key === "c" || key === "shift") this.game.holdPiece();
      else if (key === "p" || key === "escape") this.game.togglePause();
    });
  }

  bindTouch() {
    document.querySelectorAll("[data-action]").forEach(button => {
      const action = button.dataset.action;
      button.addEventListener("pointerdown", event => {
        event.preventDefault();
        if (action === "down") {
          this.softDrop = true;
          this.game.setSoftDrop(true);
          this.game.softDrop();
        } else {
          this.perform(action);
        }
      });
      ["pointerup", "pointerleave", "pointercancel"].forEach(type => {
        button.addEventListener(type, () => {
          if (action === "down") {
            this.softDrop = false;
            this.game.setSoftDrop(false);
          }
        });
      });
    });
  }

  perform(action) {
    const actions = {
      left: () => this.game.move(-1),
      right: () => this.game.move(1),
      rotate: () => this.game.rotate(1),
      drop: () => this.game.hardDrop()
    };
    actions[action]?.();
  }

  isSoftDropping() {
    return this.softDrop;
  }
}