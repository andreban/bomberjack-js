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
  sprites: Sprite[];
  currentSprite: number;
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