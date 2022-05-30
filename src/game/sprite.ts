export class Sprite {
  constructor(
    public name: string,
    public x1: number,
    public y1: number,
    public x2: number,
    public y2: number) {
  }
}

export class SpriteAnimation {
  sprites: Map<String, Sprite>;
  currentSprite: string;

  constructor(sprites: Sprite[]) {
    this.sprites = new Map();
    for (const sprite of sprites) {
      this.sprites.set(sprite.name, sprite);
    }
    this.currentSprite = sprites[0].name;
  }

  public setCurrent(name: string) {
    this.currentSprite = name;
  }

  public getCurrent(): Sprite {
    return this.sprites.get(this.currentSprite);
  }
}

export class SpriteHelper {
  constructor(private textureWidth: number, private textureHeight: number) {

  }

  public createSprite(name: string, x: number, y: number, width: number, height: number): Sprite {
    return new Sprite(
      name,
      x / this.textureWidth,
      y / this.textureHeight,
      (x + width) / this.textureWidth,
      (y + height) / this.textureHeight);
  }
}