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
  private current: number;
  private lastUpdate: number = 0;

  constructor(public name: string, private sprites: Sprite[]) {
    this.current = 0;
  }

  public update(gameTime: number) {
    if (gameTime - this.lastUpdate < 40) {
      return;
    }
    this.lastUpdate = gameTime;
    this.current++;
    this.current = this.current % this.sprites.length;
  }

  public getFrame(): Sprite {
    return this.sprites[this.current];
  }
}

export class SpriteSet {
  sprites: Map<String, SpriteAnimation>;
  currentSprite: string;

  constructor(sprites: SpriteAnimation[]) {
    this.sprites = new Map();
    for (const sprite of sprites) {
      this.sprites.set(sprite.name, sprite);
    }
    this.currentSprite = sprites[0].name;
  }

  public setCurrent(name: string) {
    this.currentSprite = name;
  }
  public getCurrent(): SpriteAnimation {
    return this.sprites.get(this.currentSprite);
  }
}

export class SpriteHelper {
  constructor(private textureWidth: number, private textureHeight: number) {

  }

  public createSpriteAnimation(
      name: string, x: number, y: number, width: number, height: number): SpriteAnimation {
    return new SpriteAnimation(name, [this.createSprite(name, x, y, width, height)]);
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