import { JackGame } from './game/game';
import { InputState } from './input';
import { Renderer } from './rendering/renderer';

(async () => {
  const canvas = document.querySelector('#game-canvas') as HTMLCanvasElement;
  const error = document.querySelector('#webgpu-not-supported') as HTMLDivElement;
  const inputState = new InputState(document);
  try {
    const renderer = await Renderer.create(canvas);
    const game = new JackGame();
    const render = (timestamp) => {
      game.update(inputState, timestamp);
      game.render(renderer);
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  } catch(e) {
    console.error(e);
    canvas.classList.toggle('hidden');
    error.classList.toggle('hidden');
  }
})();
