import { InputState } from "../input";
import { Camera2d } from "../rendering/camera";
import { Renderer } from "../rendering/renderer";
import { Entity, Jack } from "./entities";
import { SpriteHelper } from "./sprite";

export class JackGame {
  private camera = new Camera2d(600, 650);
  private background: Entity;
  private jack: Jack;
  private platforms: Entity[];
  private bombs: Entity[];

  constructor() {
    const spriteHelper = new SpriteHelper(1163, 650);
    const backgroundSprite = spriteHelper.createSprite('background', 0, 0, 600, 650);
    const jackSprite = spriteHelper.createSprite('jack_idle', 601, 256, 39, 45);

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

    this.bombs = [];
    this.jack = new Jack({
      position: {x: 0, y: 0},
      size: {width: 39, height: 45},
      sprite: jackSprite,
    });
  }

  public update(inputState: InputState) {
    const to: {x: number, y: number}  = {x: this.jack.position.x, y: this.jack.position.y};

    if (inputState.isPressed('left')) {
      to.x -= 2;
    }

    if (inputState.isPressed('right')) {
      to.x += 2;
    }

    if (inputState.isPressed('up')) {
      to.y += 8;
    }

    if (this.canMove(to)) {
      this.jack.moveTo(to);
    }

    if (!this.isJackOnGround()) {
      this.jack.move(0, -4);
    }

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
    return position.x >= -260 && position.x <= 260 && position.y < 240;
  }

  private isJackOnGround(): boolean {
    if (this.jack.position.y <= -282) {
      return true;
    }

    let [x, y] = [
      this.jack.position.x,
      this.jack.position.y - this.jack.size.height / 4,
    ];

    for (const platform of this.platforms) {
        if (x >= platform.position.x - platform.size.width / 2
          && x <= platform.position.x + platform.size.width / 2
          && y >= platform.position.y + platform.size.height / 2
          && y <= platform.position.y + platform.size.height) {
        return true;
      }
    }
    return false;
  }
}