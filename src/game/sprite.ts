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
  private frameInterval: number;

  constructor(public name: string, private sprites: Sprite[], fps: number) {
    this.current = 0;
    this.frameInterval = 1000 / fps;
  }

  public update(gameTime: number) {
    if (gameTime - this.lastUpdate < this.frameInterval) {
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

export class SpriteHelper {
  constructor(private textureWidth: number, private textureHeight: number) {

  }

  public createSpriteAnimation(
      name: string, x: number, y: number, width: number, height: number): SpriteAnimation {
    return new SpriteAnimation(name, [this.createSprite(name, x, y, width, height)], 30);
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