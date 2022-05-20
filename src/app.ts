import {Renderer} from './rendering/renderer';

(async () => {
  const canvas = document.querySelector('#game-canvas') as HTMLCanvasElement;
  const renderer = await Renderer.create(canvas);
  requestAnimationFrame(() => renderer.render());
})();
