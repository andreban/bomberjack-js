import { InputState } from "../input";
import { Camera2d } from "../rendering/camera";
import { Renderer } from "../rendering/renderer";
import { Entity, Jack } from "./entities";
import { SpriteAnimation, SpriteHelper } from "./sprite";

export class JackGame {
  private camera = new Camera2d(600, 650);
  private background: Entity;
  private jack: Jack;
  private platforms: Entity[];
  private bombs: Entity[];
  private jackSprites: SpriteAnimation;
  private score: number;

  constructor() {
    this.score = 0;
    const spriteHelper = new SpriteHelper(1163, 650);
    const backgroundSprite = spriteHelper.createSprite('background', 0, 0, 600, 650);
    this.jackSprites = new SpriteAnimation([
      spriteHelper.createSprite('jack_idle', 601, 256, 39, 45),
      spriteHelper.createSprite('jack_fall', 636.0, 64.0, 40.0, 48.0),
      spriteHelper.createSprite('jack_fly', 601.0, 208.0, 40.0, 48.0),
      spriteHelper.createSprite('jack_left0', 601.0, 301.0, 40.0, 48.0),
      spriteHelper.createSprite('jack_left1', 639.0, 256.0, 40.0, 48.0),
      spriteHelper.createSprite('jack_right0', 641.0, 208.0, 40.0, 48.0),
      spriteHelper.createSprite('jack_right1', 649.0, 160.0, 40.0, 48.0),
    ]);

    this.background = new Entity ({
      position: {x: 0, y: 0},
      size: {width: 600, height: 650},
      sprite: backgroundSprite,
    });

    this.platforms = [
      new Entity({
          position: {
            x: 400 - 300,
            y: (180 - 325) * -1,
          },
          size: {width: 150, height: 22},
          sprite: spriteHelper.createSprite('platform1', 780.0, 42.0, 150.0, 22.0),
      }),
      new Entity ({
          position: {
            x: 420.0 - 300,
            y: (580 - 325) * -1,
          },
          size: {width: 180, height: 22},
          sprite: spriteHelper.createSprite('platform2', 600.0, 42.0, 180.0, 22.0),
      }),
      new Entity ({
        position: JackGame.createPosition(420, 580),
        size: {width: 180, height: 22},
        sprite: spriteHelper.createSprite('platform2', 600.0, 42.0, 180.0, 22.0),
      }),
      new Entity ({
        position: JackGame.createPosition(320, 440),
        size: {width: 117, height: 22},
        sprite: spriteHelper.createSprite('platform3', 930.0, 42.0, 117.0, 22.0),
      }),
      new Entity ({
        position: JackGame.createPosition(180, 250),
        size: {width: 91, height: 22},
        sprite: spriteHelper.createSprite('platform4', 1047.0, 42.0, 91.0, 22.0),
      }),
      new Entity ({
        position: JackGame.createPosition(120, 510),
        size: {width: 91, height: 22},
        sprite: spriteHelper.createSprite('platform5', 1047.0, 42.0, 91.0, 22.0),
      }),
    ];

    const bombSprite = spriteHelper.createSprite('bomb0', 601.0, 112.0, 36.0, 48.0);
    this.bombs = [
      new Entity({
        position: JackGame.createPosition(110, 95),
        size: {width: 36, height: 48},
        sprite: bombSprite,
      }),
      new Entity({
        position: JackGame.createPosition(170, 95),
        size: {width: 36, height: 48},
        sprite: bombSprite,
      }),
      new Entity({
        position: JackGame.createPosition(230, 95),
        size: {width: 36, height: 48},
        sprite: bombSprite,
      }),
      new Entity({
        position: JackGame.createPosition(430, 95),
        size: {width: 36, height: 48},
        sprite: bombSprite,
      }),
      new Entity({
        position: JackGame.createPosition(490, 95),
        size: {width: 36, height: 48},
        sprite: bombSprite,
      }),
      new Entity({
        position: JackGame.createPosition(550, 95),
        size: {width: 36, height: 48},
        sprite: bombSprite,
      }),
      new Entity({
        position: JackGame.createPosition(40, 290),
        size: {width: 36, height: 48},
        sprite: bombSprite,
      }),
      new Entity({
        position: JackGame.createPosition(40, 350),
        size: {width: 36, height: 48},
        sprite: bombSprite,
      }),
      new Entity({
        position: JackGame.createPosition(40, 410),
        size: {width: 36, height: 48},
        sprite: bombSprite,
      }),
      new Entity({
        position: JackGame.createPosition(40, 470),
        size: {width: 36, height: 48},
        sprite: bombSprite,
      }),
      new Entity({
        position: JackGame.createPosition(560, 290),
        size: {width: 36, height: 48},
        sprite: bombSprite,
      }),
      new Entity({
        position: JackGame.createPosition(560, 350),
        size: {width: 36, height: 48},
        sprite: bombSprite,
      }),
      new Entity({
        position: JackGame.createPosition(560, 410),
        size: {width: 36, height: 48},
        sprite: bombSprite,
      }),
      new Entity({
        position: JackGame.createPosition(560, 470),
        size: {width: 36, height: 48},
        sprite: bombSprite,
      }),
      new Entity({
        position: JackGame.createPosition(110, 605),
        size: {width: 36, height: 48},
        sprite: bombSprite,
      }),
      new Entity({
        position: JackGame.createPosition(170, 605),
        size: {width: 36, height: 48},
        sprite: bombSprite,
      }),
      new Entity({
        position: JackGame.createPosition(230, 605),
        size: {width: 36, height: 48},
        sprite: bombSprite,
      }),
      new Entity({
        position: JackGame.createPosition(360, 545),
        size: {width: 36, height: 48},
        sprite: bombSprite,
      }),
      new Entity({
        position: JackGame.createPosition(420, 545),
        size: {width: 36, height: 48},
        sprite: bombSprite,
      }),
      new Entity({
        position: JackGame.createPosition(480, 545),
        size: {width: 36, height: 48},
        sprite: bombSprite,
      }),
    ];

    this.jack = new Jack({
      position: {x: 0, y: 0},
      size: {width: 39, height: 45},
      sprite: this.jackSprites.getCurrent(),
    });
  }

  public update(inputState: InputState, gameTime: number) {
    const to: {x: number, y: number}  = {x: this.jack.position.x, y: this.jack.position.y};

    this.jackSprites.setCurrent('jack_idle');
    const onGround = this.isJackOnGround() && this.jack.thrust <= 0;

    if (onGround) {
      if (inputState.isPressed('up')) {
        this.jack.thrust = 20;
      }
    } else {
      to.y -= 4;
      to.y += this.jack.thrust;
      this.jack.thrust = Math.min(Math.max(this.jack.thrust - 0.4, 0.0), 20.0);
    }

    if (inputState.isPressed('left')) {
      to.x -= 2;
    }

    if (inputState.isPressed('right')) {
      to.x += 2;
    }

    const originalPosition = {x: this.jack.position.x, y: this.jack.position.y};
    if (this.canMove({x: to.x, y: this.jack.position.y})) {
      this.jack.moveTo({x: to.x, y: this.jack.position.y});
    }

    if (this.canMove({x: this.jack.position.x, y: to.y})) {
      this.jack.moveTo({x: this.jack.position.x, y: to.y});
    }

    if (this.jack.thrust > 0) {
      this.jackSprites.setCurrent('jack_fly');
    } else if (this.jack.position.y < originalPosition.y) {
      this.jackSprites.setCurrent('jack_fall');
    } else if (this.jack.position.x < originalPosition.x) {
      this.jackSprites.setCurrent(`jack_left${Math.round(gameTime / 20) % 2}`);
    } else if (this.jack.position.x > originalPosition.x) {
      this.jackSprites.setCurrent(`jack_right${Math.round(gameTime / 20) % 2}`);
    }

    this.jack.sprite = this.jackSprites.getCurrent();
  }

  public render(renderer: Renderer) {
    renderer.render(
      this.camera,
      [],
      [
        this.background.toSpriteQuad(),
        ...this.platforms.map(p => p.toSpriteQuad()),
        ...this.bombs.map(b => b.toSpriteQuad()),
        this.jack.toSpriteQuad(),
      ],
    );
  }

  private static createPosition(x: number, y: number): {x: number, y: number} {
    return {x: x - 300, y: (y - 325) * -1}
  }

  private canMove(position: {x: number, y: number}): boolean {
    return position.x >= -260 && position.x <= 260 && position.y < 230;
  }

  private isJackOnGround(): boolean {
    if (this.jack.position.y <= -282) {
      return true;
    }

    let [x, y] = [
      this.jack.position.x,
      this.jack.position.y - this.jack.size.height / 2,
    ];

    for (const platform of this.platforms) {
        if (x >= platform.position.x - platform.size.width / 2
          && x <= platform.position.x + platform.size.width / 2
          && y >= platform.position.y + platform.size.height / 2 - 4
          && y <= platform.position.y + platform.size.height / 2) {
        return true;
      }
    }
    return false;
  }
}