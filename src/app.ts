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
    const gameStart = performance.now();
    const render = () => {
      const updated = performance.now();
      game.update(inputState, updated - gameStart);
      game.render(renderer);
      requestAnimationFrame(render);
    };
    render();
  } catch(e) {
    canvas.classList.toggle('hidden');
    error.classList.toggle('hidden');
  }
})();
