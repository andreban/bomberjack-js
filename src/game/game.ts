import { InputState } from "../input";
import { Camera2d } from "../rendering/camera";
import { Renderer } from "../rendering/renderer";
import { Bomb, Entity, Jack, StaticEntity } from "./entities";
import { SpriteAnimation, SpriteHelper } from "./sprite";

// Target FPS is 60 frames per second.
const TARGET_FPS = 1000 / 60;

export class JackGame {
  private camera = new Camera2d(600, 650);
  private background: Entity;
  private jack: Jack;
  private platforms: Entity[];
  private bombs: Bomb[];
  private score: number;
  private lastUpdateTime = 0;

  constructor() {
    this.lastUpdateTime = 0;
    this.score = 0;
    const spriteHelper = new SpriteHelper(1163, 650);
    const backgroundSprite = spriteHelper.createSprite('background', 0, 0, 600, 650);

    this.background = new StaticEntity ({
      position: {x: 600 / 2, y: 650 / 2},
      size: {width: 600, height: 650},
      sprite: backgroundSprite,
    });

    this.platforms = [
      new StaticEntity({
          position: JackGame.createPosition(400, 180),
          size: {width: 150, height: 22},
          sprite: spriteHelper.createSprite('platform1', 780.0, 42.0, 150.0, 22.0),
      }),
      new StaticEntity ({
          position: JackGame.createPosition(420, 580),
          size: {width: 180, height: 22},
          sprite: spriteHelper.createSprite('platform2', 600.0, 42.0, 180.0, 22.0),
      }),
      new StaticEntity ({
        position: JackGame.createPosition(420, 580),
        size: {width: 180, height: 22},
        sprite: spriteHelper.createSprite('platform2', 600.0, 42.0, 180.0, 22.0),
      }),
      new StaticEntity ({
        position: JackGame.createPosition(320, 440),
        size: {width: 117, height: 22},
        sprite: spriteHelper.createSprite('platform3', 930.0, 42.0, 117.0, 22.0),
      }),
      new StaticEntity ({
        position: JackGame.createPosition(180, 250),
        size: {width: 91, height: 22},
        sprite: spriteHelper.createSprite('platform4', 1047.0, 42.0, 91.0, 22.0),
      }),
      new StaticEntity ({
        position: JackGame.createPosition(120, 510),
        size: {width: 91, height: 22},
        sprite: spriteHelper.createSprite('platform5', 1047.0, 42.0, 91.0, 22.0),
      }),
    ];

    const createBomb = (x: number, y: number): Bomb => {
      return new Bomb({
        position: JackGame.createPosition(x, y),
        size: {width: 36, height: 48},
        animations: {
          'collected': spriteHelper.createSpriteAnimation('bomb0', 601.0, 112.0, 36.0, 48.0),
          'live': spriteHelper.createSpriteAnimation('bomb0', 601.0, 112.0, 36.0, 48.0),
        },
      });
    };

    this.bombs = [
      createBomb(110, 95), createBomb(170, 95), createBomb(230, 95), createBomb(430, 95),
      createBomb(490, 95), createBomb(550, 95), createBomb(40, 290), createBomb(40, 350),
      createBomb(40, 410), createBomb(40, 470), createBomb(560, 290), createBomb(560, 350),
      createBomb(560, 410), createBomb(560, 470), createBomb(110, 605), createBomb(170, 605),
      createBomb(230, 605), createBomb(360, 545), createBomb(420, 545), createBomb(480, 545),
    ];

    this.jack = new Jack({
      position: {x: 300, y: 325},
      size: {width: 39, height: 45},
      animations: {
        fall: spriteHelper.createSpriteAnimation('jack_fall', 636.0, 64.0, 40.0, 48.0),
        fly: spriteHelper.createSpriteAnimation('jack_fly', 601.0, 208.0, 40.0, 48.0),
        idle: spriteHelper.createSpriteAnimation('jack_idle', 601, 256, 39, 45),
        move_left: new SpriteAnimation('jack_left', [
          spriteHelper.createSprite('jack_left0', 601.0, 301.0, 40.0, 48.0),
          spriteHelper.createSprite('jack_left1', 639.0, 256.0, 40.0, 48.0),
        ], 30),
        move_right: new SpriteAnimation('jack_right', [
          spriteHelper.createSprite('jack_right0', 641.0, 208.0, 40.0, 48.0),
          spriteHelper.createSprite('jack_right1', 649.0, 160.0, 40.0, 48.0),
        ], 30),
      }
    });
  }

  public update(inputState: InputState, gameTime: number) {
    // Next updated called too son. Skip it.
    if (gameTime - this.lastUpdateTime < TARGET_FPS) {
      return;
    }
    this.lastUpdateTime = gameTime;

    const to: {x: number, y: number}  = {x: this.jack.position.x, y: this.jack.position.y};

    this.jack.setState('idle');
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

    this.checkBombs();

    if (this.jack.thrust > 0) {
      this.jack.setState('fly');
    } else if (this.jack.position.y < originalPosition.y) {
      this.jack.setState('fall');
    } else if (this.jack.position.x < originalPosition.x) {
      this.jack.setState('move_left');
    } else if (this.jack.position.x > originalPosition.x) {
      this.jack.setState('move_right');
    }

    this.jack.update(gameTime);
  }

  public render(renderer: Renderer) {
    renderer.render(
      this.camera,
      [],
      [
        this.background.toSpriteQuad(),
        ...this.platforms.map(p => p.toSpriteQuad()),
        ...this.bombs
            .filter(b => b.state === 'live')
            .map(b => b.toSpriteQuad()),
        this.jack.toSpriteQuad(),
      ],
    );
  }

  private checkBombs() {
    for (const bomb of this.bombs) {
      if (this.jack.position.x < bomb.position.x + bomb.size.width
            && this.jack.position.x + this.jack.size.width > bomb.position.x
            && this.jack.position.y < bomb.position.y + bomb.size.height
            && this.jack.position.y + this.jack.size.height > bomb.position.y
            && bomb.state !== 'collected'){
          // TODO: Move this to a "bomb collected" event and handle the feedback there.
          const gamepads = navigator.getGamepads();
          if (gamepads[0]) {
            const vibrationActuator = gamepads[0].vibrationActuator;
            if (vibrationActuator) {
              vibrationActuator.playEffect('dual-rumble', {
                startDelay: 0,
                duration: 100,
                weakMagnitude: 0.5,
                strongMagnitude: 0.5,
              });
            }            
          }
          
          bomb.state = 'collected';
        }
    }
  }

  private static createPosition(x: number, y: number): {x: number, y: number} {
    return {x: x, y: (650 - y) }
  }

  private canMove(position: {x: number, y: number}): boolean {
    return position.x >= 40 && position.x <= 560 && position.y < 560;
  }

  private isJackOnGround(): boolean {
    if (this.jack.position.y <= 42) {
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