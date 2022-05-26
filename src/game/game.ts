import { InputState } from "../input";
import { Camera2d } from "../rendering/camera";
import { Renderer } from "../rendering/renderer";
import { Entity } from "./entities";
import { SpriteHelper } from "./sprite";

export class JackGame {
  private camera = new Camera2d(600, 650);
  private background: Entity;
  private jack: Entity;

  constructor() {
    const spriteHelper = new SpriteHelper(1163, 650);
    const backgroundSprite = spriteHelper.createSprite('background', 0, 0, 600, 650);
    const jackSprite = spriteHelper.createSprite('jack_idle', 601, 256, 39, 45);

    this.background = new Entity ({
      position: {x: 0, y: 0},
      size: {width: 600, height: 650},
      sprite: backgroundSprite,
    });

    this.jack = new Entity({
      position: {x: 0, y: 0},
      size: {width: 39, height: 45},
      sprite: jackSprite,
    });
  }

  public update(inputState: InputState) {
    if (inputState.isPressed('left')) {
      this.jack.move(-2, 0);
    }

    if (inputState.isPressed('right')) {
      this.jack.move(2, 0);
    }

    if (inputState.isPressed('up')) {
      this.jack.move(0, 2);
    }

    if (inputState.isPressed('down')) {
      this.jack.move(0, -2);
    }
  }

  public render(renderer: Renderer) {
    renderer.render(
      this.camera,
      [],
      [this.background.toSpriteQuad(), this.jack.toSpriteQuad()],
    );
  }
}