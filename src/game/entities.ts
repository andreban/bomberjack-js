import { SpriteQuadInstance } from "../rendering/instances/quad";
import { Sprite } from "./sprite";

export type EntityParams = {
  position: {x: number, y: number};
  size: {width: number, height: number};
  sprite: Sprite;  
};

export class Entity {
  position: {x: number, y: number};
  size: {width: number, height: number};
  sprite: Sprite; 

  constructor(params: EntityParams) {
    this.position = params.position;
    this.size = params.size;
    this.sprite = params.sprite;
  }

  moveTo(to: {x: number, y: number}) {
    this.position.x = to.x;
    this.position.y = to.y;
  }

  move(amountX: number, amountY: number) {
    this.position.x += amountX;
    this.position.y += amountY;
  }

  toSpriteQuad(): SpriteQuadInstance {
    return new SpriteQuadInstance({
      position: this.position,
      size: this.size,
      texture: this.sprite,
      rotation: 0,
    });
  }
}

export class Jack extends Entity {
  public thrust: number;
  constructor(params: EntityParams) {
    super(params);
    this.thrust = 0;
  }
}
