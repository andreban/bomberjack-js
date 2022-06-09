import { SpriteQuadInstance } from "../rendering/instances/quad";
import { Sprite, SpriteAnimation } from "./sprite";

export type EntityParams = {
  position: {x: number, y: number};
  size: {width: number, height: number};
};

export abstract class Entity {
  public position: {x: number, y: number};
  public size: {width: number, height: number};

  constructor(params: EntityParams) {
    this.position = params.position;
    this.size = params.size;
  }

  moveTo(to: {x: number, y: number}) {
    this.position.x = to.x;
    this.position.y = to.y;
  }

  move(amountX: number, amountY: number) {
    this.position.x += amountX;
    this.position.y += amountY;
  }

  abstract getSprite(): Sprite;

  toSpriteQuad(): SpriteQuadInstance {
    return new SpriteQuadInstance({
      position: this.position,
      size: this.size,
      texture: this.getSprite(),
      rotation: 0,
    });
  }
}

export type StaticEntityParams = EntityParams & {sprite : Sprite};
export class StaticEntity extends Entity {
  sprite: Sprite;

  constructor(params: StaticEntityParams) {
    super(params);
    this.sprite = params.sprite;
  }

  getSprite(): Sprite {
    return this.sprite;
  }
}

export type AnimatedEntityParams<S extends string> =
    EntityParams & {animations: Record<S, SpriteAnimation>};
export class AnimatedEntity<S extends string> extends Entity {
  state: S;
  animations: Record<S, SpriteAnimation>;

  constructor(params: AnimatedEntityParams<S>) {
    super(params);
    this.animations = params.animations;
  }

  update(gameTime: number) {
    this.animations[this.state].update(gameTime);
  }

  setState(state: S) {
    this.state = state;
  }

  getSprite(): Sprite {
    const animation = this.animations[this.state];
    return animation.getFrame();
  }
}

export type JackState = 'idle' | 'move_left' | 'move_right' | 'fly' | 'fall'; 
export class Jack extends AnimatedEntity<JackState> {
  public thrust: number;

  constructor(params: AnimatedEntityParams<JackState>) {
    super(params);
    this.thrust = 0;
    this.state = 'idle';
  }
}

export type BombState = 'live' | 'collected';
export class Bomb extends AnimatedEntity<BombState> {
  constructor(params: AnimatedEntityParams<BombState>) {
    super(params);
    this.state = 'live';
  }
}
