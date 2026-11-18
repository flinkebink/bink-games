export default class PowerUp {
  constructor(type, config) {
    this.type = type;
    Object.assign(this, config);
  }

  static create(type, definitions) {
    return new PowerUp(type, definitions[type]);
  }

  static randomType(goodTypes, cursedTypes, random = Math.random) {
    const cursed = random() < 0.35;
    const choices = cursed ? cursedTypes : goodTypes;
    return choices[Math.floor(random() * choices.length)];
  }
}
